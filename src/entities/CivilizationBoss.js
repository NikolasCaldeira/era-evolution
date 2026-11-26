import {CIVILIZATION_BOSSES,CivilizationBossState,makeBossAttackPlan,bossAttackHits} from '../systems/CivilizationBossSystem.js';
import {civilizationBossTexture} from '../art/CivilizationArt.js';

/** Ciclo 13: cada chefe usa formas de perigo e táticas próprias, anunciadas antes do dano. */
export class CivilizationBoss {
  constructor(scene,x,y,era){
    this.scene=scene;this.x=x;this.y=y;this.era=era;this.id=99500;this.isBoss=true;
    this.config=CIVILIZATION_BOSSES[era];this.state=new CivilizationBossState(era);
    this.alive=true;this.contactRadius=57;this.phase=1;this.path=[];this.pathIndex=0;this.repathAt=0;
    this.attack=null;this.nextAttack=scene.time.now+1800;this.frame=0;this.animMs=0;this.toLeft=false;
    this.telegraph=scene.add.graphics().setDepth(9700);
    this.shadow=scene.add.ellipse(x,y+14,122,33,0x11211d,.39).setDepth(y+170);
    this.sprite=scene.add.image(x,y,civilizationBossTexture(era,false,0)).setOrigin(.5,.83).setDepth(y+260).setScale(1.04);
    this.nameplate=scene.add.text(x,y-140,this.config.name,{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#fff1cc',stroke:'#26302f',strokeThickness:4}).setOrigin(.5).setDepth(y+400);
  }
  damage(amount){
    const previous=this.state.phase;
    if(!this.state.takeDamage(amount))return false;
    this.phase=this.state.phase;
    if(this.sprite?.active)this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(110,()=>this.sprite?.active&&this.sprite.clearTint());
    if(this.alive&&previous!==this.phase){this.scene.showMessage(`${this.config.name}: FASE ${this.phase}`);this.scene.makeImpact(this.x,this.y-35,this.config.color,65);}
    if(!this.state.alive)this.destroy();
    return true;
  }
  startAttack(now,target){
    const type=this.state.chooseAttack(Math.hypot(target.x-this.x,target.y-this.y));
    const from={x:this.x,y:this.y},to={x:target.x,y:target.y};
    const fireAt=now+this.state.windupMs();
    this.attack={type,start:now,fireAt,originX:this.x,originY:this.y,
      targetX:to.x,targetY:to.y,shapes:makeBossAttackPlan(this.era,type,from,to),executed:false};
    this.nextAttack=fireAt+this.state.cooldownMs();
    this.scene.showMessage(`${this.config.name} — ${this.config.attackNames[type]}!`);
  }
  move(dx,dy,nav){
    const nx=this.x+dx,ny=this.y+dy;
    if(nav.isOpen(nx,ny)){this.x=nx;this.y=ny;return true;}
    if(nav.isOpen(nx,this.y)){this.x=nx;return true;}
    if(nav.isOpen(this.x,ny)){this.y=ny;return true;}
    return false;
  }
  navigate(delta,target,nav){
    const now=this.scene.time.now;
    if(Math.hypot(target.x-this.x,target.y-this.y)<155)return;
    if(now>=this.repathAt||!this.path.length||this.pathIndex>=this.path.length){
      this.path=nav.findPath(this.x,this.y,target.x,target.y);this.pathIndex=0;this.repathAt=now+620;
    }
    while(this.pathIndex<this.path.length&&Math.hypot(this.path[this.pathIndex].x-this.x,this.path[this.pathIndex].y-this.y)<18)this.pathIndex++;
    const waypoint=this.path[this.pathIndex]||target;
    const dx=waypoint.x-this.x,dy=waypoint.y-this.y,d=Math.hypot(dx,dy)||1;
    this.toLeft=dx<0;
    const step=Math.min(d,(this.config.speed+(this.phase-1)*12)*Math.min(delta,40)/1000);
    if(!this.move(dx/d*step,dy/d*step,nav))this.repathAt=0;
  }
  warn(now){
    const g=this.telegraph,a=this.attack;g.clear();
    if(!a||a.executed)return;
    const progress=Math.max(0,Math.min(1,(now-a.start)/(a.fireAt-a.start)));
    const alpha=.48+progress*.42;
    g.lineStyle(3+progress*2,this.config.color,alpha);
    for(const s of a.shapes){
      if(s.kind==='line'){
        g.lineBetween(s.from.x,s.from.y,s.to.x,s.to.y);
        g.strokeCircle(s.to.x,s.to.y,s.radius);
      }else if(s.kind==='circle'){
        g.strokeCircle(s.x,s.y,s.radius);
        g.lineStyle(1,this.config.color,alpha*.6);
        g.strokeCircle(s.x,s.y,Math.max(2,s.radius*(1-progress)));
        g.lineStyle(3+progress*2,this.config.color,alpha);
      }else if(s.kind==='ring'){
        g.strokeCircle(s.x,s.y,s.outer);
        g.lineStyle(2,0x8ae6c2,.75);
        g.strokeCircle(s.x,s.y,s.inner); // zona central segura
        g.lineStyle(3+progress*2,this.config.color,alpha);
      }else if(s.kind==='cone'){
        const a1=s.angle-s.halfAngle,a2=s.angle+s.halfAngle;
        g.lineBetween(s.x,s.y,s.x+Math.cos(a1)*s.reach,s.y+Math.sin(a1)*s.reach);
        g.lineBetween(s.x,s.y,s.x+Math.cos(a2)*s.reach,s.y+Math.sin(a2)*s.reach);
        g.beginPath();g.arc(s.x,s.y,s.reach,a1,a2);g.strokePath();
      }
    }
  }
  execute(now,target){
    const a=this.attack;if(!a||a.executed)return;
    a.executed=true;
    if(a.type==='summon'){
      this.scene.makeImpact(this.x,this.y-20,this.config.color,70);
      this.scene.spawnBossMinions(2);return;
    }
    if(a.type==='dive'){
      const dx=a.targetX-a.originX,dy=a.targetY-a.originY,d=Math.hypot(dx,dy)||1;
      a.direction={x:dx/d,y:dy/d};a.chargeUntil=now+630;
      this.scene.makeImpact(this.x,this.y-25,this.config.color,35);return;
    }
    if(a.shapes.length){
      const first=a.shapes[0];
      const px=first.x??a.targetX,py=first.y??a.targetY;
      this.scene.makeImpact(px,py-12,this.config.color,first.kind==='ring'?90:40);
    }
    if(!bossAttackHits(a.shapes,target,10))return;
    // A lentidão é aplicada antes do dano (que ativa proteção temporária);
    // durante a esquiva invulnerável não se recebe nem dano nem o efeito.
    if(a.type==='quicksand')this.scene.applyCombatSlow?.(.66,1700,'AREIAS MOVEDIÇAS');
    if(a.type==='stonegaze')this.scene.applyCombatSlow?.(.48,1350,'OLHAR PETRIFICANTE');
    this.scene.damagePlayer(this,1);
    if(a.type==='gearring')this.scene.makeImpact(target.x,target.y-17,0xeed38a,22);
  }
  update(delta,target,nav){
    if(!this.alive)return;
    const now=this.scene.time.now;
    if(!this.attack&&now>=this.nextAttack)this.startAttack(now,target);
    if(this.attack){
      const a=this.attack;this.warn(now);
      if(!a.executed&&now>=a.fireAt)this.execute(now,target);
      if(a.executed&&a.type==='dive'&&now<a.chargeUntil){
        const step=(345+(this.phase-1)*42)*Math.min(delta,40)/1000;
        if(!this.move(a.direction.x*step,a.direction.y*step,nav))a.chargeUntil=now;
        if(Math.hypot(this.x-target.x,this.y-target.y)<this.contactRadius)this.scene.damagePlayer(this,1);
      }
      if(a.executed&&(a.type!=='dive'||now>=a.chargeUntil)){
        this.attack=null;this.telegraph.clear();this.repathAt=0;
      }
    }else this.navigate(delta,target,nav);
    this.animMs+=delta;if(this.animMs>190){this.frame=(this.frame+1)%4;this.animMs=0;}
    this.sprite.setTexture(civilizationBossTexture(this.era,this.toLeft,this.frame)).setPosition(this.x,this.y).setDepth(this.y+260);
    this.shadow.setPosition(this.x,this.y+14).setDepth(this.y+170);
    this.nameplate.setPosition(this.x,this.y-140).setDepth(this.y+400);
  }
  destroy(){
    if(!this.alive)return;
    this.alive=false;this.attack=null;
    this.telegraph.clear();this.telegraph.destroy();this.nameplate.destroy();this.shadow.destroy();
    this.scene.tweens.add({targets:this.sprite,alpha:0,scale:.1,duration:360,onComplete:()=>this.sprite.destroy()});
  }
}

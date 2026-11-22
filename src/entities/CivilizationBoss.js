import {CIVILIZATION_BOSSES,CivilizationBossState,withinBossBeam} from '../systems/CivilizationBossSystem.js';
import {civilizationBossTexture} from '../art/CivilizationArt.js';
/** Chefe temático de cada civilização. Investida, onda e feixe com telegráficos próprios. */
export class CivilizationBoss {
  constructor(scene,x,y,era){
    this.scene=scene;this.x=x;this.y=y;this.era=era;this.id=99500;this.isBoss=true;
    this.config=CIVILIZATION_BOSSES[era];this.state=new CivilizationBossState(era);
    this.alive=true;this.contactRadius=57;this.phase=1;this.path=[];this.pathIndex=0;this.repathAt=0;
    this.attack=null;this.nextAttack=scene.time.now+1650;this.frame=0;this.animMs=0;this.toLeft=false;
    this.telegraph=scene.add.graphics().setDepth(9700);
    this.shadow=scene.add.ellipse(x,y+14,122,33,0x11211d,.39).setDepth(y+170);
    this.sprite=scene.add.image(x,y,civilizationBossTexture(era,false,0)).setOrigin(.5,.83).setDepth(y+260).setScale(1.04);
    this.nameplate=scene.add.text(x,y-140,this.config.name,{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#fff1cc',stroke:'#26302f',strokeThickness:4}).setOrigin(.5).setDepth(y+400);
  }
  damage(amount){
    const prev=this.state.phase;
    if(!this.state.takeDamage(amount))return false;
    this.phase=this.state.phase;
    if(this.sprite?.active)this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(110,()=>this.sprite?.active&&this.sprite.clearTint());
    if(this.alive&&prev!==this.phase){this.scene.showMessage(`${this.config.name}: FASE ${this.phase}`);this.scene.makeImpact(this.x,this.y-35,this.config.color,65);}
    if(!this.state.alive)this.destroy();
    return true;
  }
  startAttack(now,target){
    const type=this.state.chooseAttack(Math.hypot(target.x-this.x,target.y-this.y));
    this.attack={type,start:now,fireAt:now+this.state.windupMs(),originX:this.x,originY:this.y,targetX:target.x,targetY:target.y,executed:false};
    this.nextAttack=this.attack.fireAt+this.state.cooldownMs();
    this.scene.showMessage(`${this.config.name} — ${this.config[type].toUpperCase()}!`);
  }
  move(dx,dy,nav){
    let nx=this.x+dx,ny=this.y+dy;
    if(nav.isOpen(nx,ny)){this.x=nx;this.y=ny;return true;}
    if(nav.isOpen(nx,this.y)){this.x=nx;return true;}
    if(nav.isOpen(this.x,ny)){this.y=ny;return true;}
    return false;
  }
  navigate(delta,target,nav){
    const now=this.scene.time.now;
    if(Math.hypot(target.x-this.x,target.y-this.y)<145)return;
    if(now>=this.repathAt||!this.path.length||this.pathIndex>=this.path.length){
      this.path=nav.findPath(this.x,this.y,target.x,target.y);this.pathIndex=0;this.repathAt=now+600;
    }
    while(this.pathIndex<this.path.length&&Math.hypot(this.path[this.pathIndex].x-this.x,this.path[this.pathIndex].y-this.y)<18)this.pathIndex++;
    const waypoint=this.path[this.pathIndex]||target;
    const dx=waypoint.x-this.x,dy=waypoint.y-this.y,d=Math.hypot(dx,dy)||1;
    this.toLeft=dx<0;
    const s=Math.min(d,(this.config.speed+(this.phase-1)*15)*Math.min(delta,40)/1000);
    if(!this.move(dx/d*s,dy/d*s,nav))this.repathAt=0;
  }
  warn(now){
    const g=this.telegraph,a=this.attack;g.clear();if(!a||a.executed)return;
    const t=Math.min(1,(now-a.start)/(a.fireAt-a.start));
    g.lineStyle(3+t*2,this.config.color,.45+t*.45);
    if(a.type==='charge'||a.type==='beam'){
      g.lineBetween(a.originX,a.originY-20,a.targetX,a.targetY);
      g.strokeCircle(a.targetX,a.targetY,a.type==='beam'?32:17);
    }else{
      const radius=a.type==='summon'?104:133;
      g.strokeCircle(this.x,this.y,radius);
      g.strokeCircle(this.x,this.y,radius*(1-t));
    }
  }
  execute(now,target){
    const a=this.attack;if(!a||a.executed)return;
    a.executed=true;
    if(a.type==='charge'){
      const dx=a.targetX-a.originX,dy=a.targetY-a.originY,d=Math.hypot(dx,dy)||1;
      a.direction={x:dx/d,y:dy/d};a.chargeUntil=now+510;
      this.scene.makeImpact(this.x,this.y-23,this.config.color,28);
    }else if(a.type==='stomp'){
      this.scene.makeImpact(this.x,this.y-18,this.config.color,115);
      if(Math.hypot(target.x-this.x,target.y-this.y)<135)this.scene.damagePlayer(this,1);
    }else if(a.type==='beam'){
      this.scene.makeImpact(a.targetX,a.targetY,this.config.color,45);
      if(withinBossBeam({x:a.originX,y:a.originY-20},{x:a.targetX,y:a.targetY},target,36))this.scene.damagePlayer(this,1);
    }else{
      this.scene.makeImpact(this.x,this.y-20,this.config.color,65);
      this.scene.spawnBossMinions(2);
    }
  }
  update(delta,target,nav){
    if(!this.alive)return;
    const now=this.scene.time.now;
    if(!this.attack&&now>=this.nextAttack)this.startAttack(now,target);
    if(this.attack){
      const a=this.attack;this.warn(now);
      if(!a.executed&&now>=a.fireAt)this.execute(now,target);
      if(a.executed&&a.type==='charge'&&now<a.chargeUntil){
        const s=(325+(this.phase-1)*40)*Math.min(delta,40)/1000;
        if(!this.move(a.direction.x*s,a.direction.y*s,nav))a.chargeUntil=now;
        if(Math.hypot(this.x-target.x,this.y-target.y)<this.contactRadius)this.scene.damagePlayer(this,1);
      }
      if(a.executed&&(a.type!=='charge'||now>=a.chargeUntil)){this.attack=null;this.telegraph.clear();this.repathAt=0;}
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

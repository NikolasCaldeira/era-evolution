import { ICE_BOSS_CONFIG, IceAgeBossState, inFrostCone } from '../systems/IceAgeBossSystem.js';
import { iceAgeBossTexture } from '../art/IceAgeBossArt.js';

/** Mamute Ancestral: investida, pisada, cone de gelo e convocação de apoio. */
export class PleistoceneBoss {
  constructor(scene,x,y){
    this.scene=scene;this.id=99998;this.isBoss=true;this.era='pleistoceno';
    this.x=x;this.y=y;this.alive=true;this.contactRadius=ICE_BOSS_CONFIG.contactRadius;
    this.state=new IceAgeBossState();this.speed=ICE_BOSS_CONFIG.baseSpeed;
    this.path=[];this.pathIndex=0;this.repathAt=0;
    this.nextAttack=scene.time.now+2000;this.attack=null;this.frame=0;this.animMs=0;this.toLeft=false;
    this.telegraph=scene.add.graphics().setDepth(9700);
    this.shadow=scene.add.ellipse(x,y+17,158,43,0x13232b,.43).setDepth(y+175);
    this.sprite=scene.add.image(x,y,iceAgeBossTexture(false,0)).setOrigin(.5,.82).setScale(.97).setDepth(y+230);
    this.nameplate=scene.add.text(x,y-171,'MAMUTE ANCESTRAL',{
      fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#d9f5ff',stroke:'#18323e',strokeThickness:4
    }).setOrigin(.5).setDepth(y+375);
    this.icePatches=[];this.patchSequence=0;
  }
  get hp(){return this.state.health;}
  get maxHp(){return this.state.maxHealth;}
  get phase(){return this.state.phase;}
  damage(amount){
    const r=this.state.takeDamage(amount);
    if(!r.applied)return false;
    this.sprite.setTintFill(0xc9faff);
    this.scene.time.delayedCall(110,()=>this.sprite?.active&&this.sprite.clearTint());
    if(r.phaseChanged){
      this.scene.makeImpact(this.x,this.y-63,0x87d4eb,76);
      this.scene.showMessage(`MAMUTE ANCESTRAL — FASE ${this.phase}!`);
    }
    if(r.defeated)this.destroy();
    return true;
  }
  beginAttack(now,target){
    const count=this.scene.creatures.filter(c=>c.alive&&!c.isBoss&&c.summoned).length;
    const type=this.state.nextAttack(Math.hypot(target.x-this.x,target.y-this.y),count<3);
    this.attack={type,start:now,fireAt:now+this.state.windupFor(type),
      targetX:target.x,targetY:target.y,originX:this.x,originY:this.y,executed:false};
    this.nextAttack=now+this.state.windupFor(type)+this.state.cooldownMs();
    const title={charge:'INVESTIDA GLACIAL!',stomp:'PISADA SÍSMICA!',breath:'RAJADA CONGELANTE!',summon:'A MATILHA DESPERTA!'}[type];
    this.scene.showMessage(`MAMUTE ANCESTRAL: ${title}`);
  }
  addIcePatch(x,y){
    const ring=this.scene.add.ellipse(x,y,69,31,0xa8dfeb,.35).setStrokeStyle(2,0xd3faff,.63).setDepth(y+18);
    this.scene.tweens.add({targets:ring,alpha:0,delay:1850,duration:4250,onComplete:()=>ring.destroy()});
    this.icePatches.push({id:++this.patchSequence,x,y,until:this.scene.time.now+6100,ring});
  }
  execute(now,target){
    const a=this.attack;if(!a||a.executed)return;
    a.executed=true;
    if(a.type==='charge'){
      const dx=a.targetX-a.originX,dy=a.targetY-a.originY,d=Math.hypot(dx,dy)||1;
      a.direction={x:dx/d,y:dy/d};a.chargeUntil=now+ICE_BOSS_CONFIG.chargeDurationMs;
      a.nextIce=now;this.scene.makeImpact(this.x,this.y-40,0xb9e9ed,35);
    } else if(a.type==='stomp'){
      this.scene.makeImpact(this.x,this.y-20,0xc7f3f8,ICE_BOSS_CONFIG.stompRadius*.65);
      if(Math.hypot(target.x-this.x,target.y-this.y)<ICE_BOSS_CONFIG.stompRadius)
        this.scene.damagePlayer(this,1);
    } else if(a.type==='breath'){
      const heading=Math.atan2(a.targetY-(a.originY-36),a.targetX-a.originX);
      const origin={x:this.x,y:this.y-36};
      this.scene.makeImpact(this.x+Math.cos(heading)*64,this.y-36+Math.sin(heading)*64,0x93e4f2,46);
      if(inFrostCone(origin,heading,{x:target.x,y:target.y-13})){
        if(this.scene.damagePlayer(this,1))this.scene.applyCold(ICE_BOSS_CONFIG.slowDurationMs);
      }
    } else if(a.type==='summon'){
      this.scene.makeImpact(this.x,this.y-32,0xb4e3eb,92);
      this.scene.spawnBossMinions(2);
    }
  }
  move(dx,dy,nav){
    const x=this.x+dx,y=this.y+dy;
    const clear=(nx,ny)=>nav.isOpen(nx,ny)&&nav.isOpen(nx-10,ny)&&nav.isOpen(nx+10,ny);
    if(clear(x,y)){this.x=x;this.y=y;return true;}
    if(clear(x,this.y)){this.x=x;return true;}
    if(clear(this.x,y)){this.y=y;return true;}
    return false;
  }
  navigate(delta,target,nav){
    const distance=Math.hypot(target.x-this.x,target.y-this.y);
    if(distance<126)return;
    const now=this.scene.time.now;
    if(now>=this.repathAt||!this.path.length||this.pathIndex>=this.path.length){
      this.path=nav.findPath(this.x,this.y,target.x,target.y);
      this.pathIndex=0;this.repathAt=now+560;
    }
    while(this.pathIndex<this.path.length&&Math.hypot(this.path[this.pathIndex].x-this.x,this.path[this.pathIndex].y-this.y)<25)this.pathIndex++;
    const waypoint=this.path[this.pathIndex]||target;
    const dx=waypoint.x-this.x,dy=waypoint.y-this.y,len=Math.hypot(dx,dy)||1;
    this.toLeft=dx<0;
    const speed=this.speed+(this.phase-1)*14,step=Math.min(len,speed*Math.min(delta,40)/1000);
    if(!this.move(dx/len*step,dy/len*step,nav))this.repathAt=0;
  }
  drawWarning(now){
    const a=this.attack;
    this.telegraph.clear();if(!a||a.executed)return;
    const progress=Math.min(1,(now-a.start)/(a.fireAt-a.start));
    this.telegraph.lineStyle(3+progress*2,0xaeeeff,.48+progress*.45);
    if(a.type==='charge'){
      this.telegraph.lineBetween(this.x,this.y-23,a.targetX,a.targetY);
      this.telegraph.fillStyle(0x8ed8eb,.44);this.telegraph.fillCircle(a.targetX,a.targetY,12+progress*8);
    } else if(a.type==='stomp'){
      this.telegraph.strokeCircle(this.x,this.y,ICE_BOSS_CONFIG.stompRadius);
      this.telegraph.strokeCircle(this.x,this.y,ICE_BOSS_CONFIG.stompRadius*(1-progress));
    } else if(a.type==='breath'){
      const heading=Math.atan2(a.targetY-(this.y-36),a.targetX-this.x);
      const origin={x:this.x,y:this.y-36},pts=[origin];
      for(let i=0;i<=16;i++){
        const theta=heading-ICE_BOSS_CONFIG.breathHalfAngle+i*ICE_BOSS_CONFIG.breathHalfAngle/8;
        pts.push({x:origin.x+Math.cos(theta)*ICE_BOSS_CONFIG.breathRange,y:origin.y+Math.sin(theta)*ICE_BOSS_CONFIG.breathRange});
      }
      this.telegraph.fillStyle(0x9be5f2,.12+.17*progress);this.telegraph.fillPoints(pts,true);
      this.telegraph.lineStyle(2,0xbceeff,.8);
      this.telegraph.lineBetween(origin.x,origin.y,pts[1].x,pts[1].y);
      this.telegraph.lineBetween(origin.x,origin.y,pts[pts.length-1].x,pts[pts.length-1].y);
    } else {
      this.telegraph.strokeCircle(this.x,this.y,68+progress*32);
      for(let i=0;i<4;i++){const th=i*Math.PI/2+now/900;
        this.telegraph.lineBetween(this.x,this.y-20,this.x+Math.cos(th)*85,this.y-20+Math.sin(th)*45);
      }
    }
  }
  update(delta,target,nav){
    if(!this.alive)return;
    const now=this.scene.time.now;
    if(!this.attack&&now>=this.nextAttack)this.beginAttack(now,target);
    if(this.attack){
      const a=this.attack;
      this.drawWarning(now);
      if(!a.executed&&now>=a.fireAt)this.execute(now,target);
      if(a.executed&&a.type==='charge'&&now<a.chargeUntil){
        const distance=(370+this.phase*48)*Math.min(delta,40)/1000;
        if(!this.move(a.direction.x*distance,a.direction.y*distance,nav))a.chargeUntil=now;
        if(now>=a.nextIce){this.addIcePatch(this.x,this.y);a.nextIce=now+125;}
        if(Math.hypot(this.x-target.x,this.y-target.y)<this.contactRadius+4)this.scene.damagePlayer(this,1);
      }
      if(a.executed&&(a.type!=='charge'||now>=a.chargeUntil)){
        this.attack=null;this.telegraph.clear();this.repathAt=0;
      }
    }else this.navigate(delta,target,nav);
    this.icePatches=this.icePatches.filter(p=>p.until>now);
    const onTrail=this.icePatches.find(p=>Math.hypot(p.x-target.x,p.y-target.y)<33);
    if(onTrail){
      if(typeof this.scene.applyFrostTrail==='function')this.scene.applyFrostTrail(onTrail);
      else this.scene.applyCold(500); // compatibilidade com cenas de teste anteriores
    }
    this.animMs+=delta;
    if(this.animMs>=180){this.frame=(this.frame+1)%4;this.animMs=0;}
    this.sprite.setTexture(iceAgeBossTexture(this.toLeft,this.frame)).setPosition(this.x,this.y).setDepth(this.y+230);
    this.shadow.setPosition(this.x,this.y+17).setDepth(this.y+175);
    this.nameplate.setPosition(this.x,this.y-171).setDepth(this.y+375);
  }
  destroy(){
    if(!this.alive)return;
    this.alive=false;this.attack=null;for(const p of this.icePatches)p.ring?.active&&p.ring.destroy();this.icePatches=[];this.patchSequence=0;
    this.telegraph.clear();this.telegraph.destroy();
    this.nameplate.destroy();this.shadow.destroy();
    this.scene.tweens.add({targets:this.sprite,alpha:0,scale:0,duration:420,onComplete:()=>this.sprite.destroy()});
  }
}

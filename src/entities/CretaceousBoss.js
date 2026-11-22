import { BossState, BOSS_CONFIG } from '../systems/BossSystem.js';
import { bossTexture } from '../art/BossArt.js';

/** Encontro com o chefe do Cretáceo. Telegrafa os ataques para permitir reação. */
export class CretaceousBoss {
  constructor(scene,x,y){
    this.scene=scene;this.id=99999;this.isBoss=true;
    this.x=x;this.y=y;this.contactRadius=BOSS_CONFIG.contactRadius;
    this.state=new BossState();this.alive=true;
    this.path=[];this.pathIndex=0;this.repathAt=0;
    this.speed=BOSS_CONFIG.baseSpeed;
    this.attackCount=0;
    this.nextAttack=scene.time.now+2200;
    this.attack=null;this.projectiles=[];
    this.timeAnimated=0;this.frame=0;this.toLeft=false;
    this.telegraph=scene.add.graphics().setDepth(9800);
    this.shadow=scene.add.ellipse(x,y+13,124,34,0x0a1711,.5).setDepth(y+175);
    this.sprite=scene.add.image(x,y,bossTexture(false,0)).setOrigin(.5,.82).setScale(1.03).setDepth(y+220);
    this.nameplate=scene.add.text(x,y-150,'TRICERÁTOPS ANCESTRAL',{
      fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#f5daa2',stroke:'#193429',strokeThickness:4
    }).setOrigin(.5).setDepth(y+340);
  }
  get hp(){return this.state.health;}
  get maxHp(){return this.state.maxHealth;}
  get phase(){return this.state.phase;}
  damage(amount){
    const result=this.state.takeDamage(amount);
    if(!result.applied)return false;
    if(this.sprite.active){
      this.sprite.setTintFill(0xffecb8);
      this.scene.time.delayedCall(115,()=>this.sprite?.active&&this.sprite.clearTint());
    }
    if(result.phaseChanged){
      this.scene.makeImpact(this.x,this.y-46,0xf7bf78,66);
      this.scene.showMessage(`O Tricerátops entrou na fase ${this.phase}!`);
    }
    if(result.defeated)this.destroy();
    return true;
  }
  startAttack(now,target){
    const distance=Math.hypot(target.x-this.x,target.y-this.y);
    const type=this.state.nextAttack(distance);
    this.attack={type,start:now,fireAt:now+this.state.windupFor(type),
      targetX:target.x,targetY:target.y,originX:this.x,originY:this.y,executed:false};
    this.nextAttack=now+this.state.windupFor(type)+this.state.cooldownMs();
    const label={charge:'INVESTIDA!',stomp:'ONDA DE CHOQUE!',volley:'RAJADA ANCESTRAL!'}[type];
    this.scene.showMessage(`${BOSS_CONFIG.name}: ${label}`);
  }
  executeAttack(now){
    const a=this.attack;if(!a||a.executed)return;
    a.executed=true;
    if(a.type==='charge'){
      a.chargeUntil=now+BOSS_CONFIG.chargeDurationMs;
      const dx=a.targetX-a.originX,dy=a.targetY-a.originY;
      const d=Math.hypot(dx,dy)||1;
      a.direction={x:dx/d,y:dy/d};
      this.scene.makeImpact(this.x,this.y-25,0xf2bd6d,35);
    }else if(a.type==='stomp'){
      this.scene.makeImpact(this.x,this.y-15,0xf0bd76,BOSS_CONFIG.stompRadius*.65);
      if(Math.hypot(this.scene.player.x-this.x,this.scene.player.y-this.y)<BOSS_CONFIG.stompRadius){
        this.scene.damagePlayer(this,1);
      }
    }else if(a.type==='volley'){
      const dx=a.targetX-this.x,dy=a.targetY-this.y;
      const angle=Math.atan2(a.targetY-(this.y-31),a.targetX-this.x),count=this.phase===3?7:5;
      for(let i=0;i<count;i++){
        const theta=angle+(i-(count-1)/2)*.19;
        const x=this.x+Math.cos(theta)*54,y=this.y-31+Math.sin(theta)*34;
        const sprite=this.scene.add.circle(x,y,8,0xd7a05e,.95)
          .setStrokeStyle(2,0xf9e5b5).setDepth(y+560);
        this.projectiles.push({x,y,vx:Math.cos(theta)*(245+this.phase*18),vy:Math.sin(theta)*(245+this.phase*18),life:2600,sprite});
      }
    }
  }
  move(dx,dy,nav){
    if(nav.isOpen(this.x+dx,this.y+dy)&&nav.isOpen(this.x+dx+12,this.y+dy)&&nav.isOpen(this.x+dx-12,this.y+dy)){
      this.x+=dx;this.y+=dy;return true;
    }
    if(nav.isOpen(this.x+dx,this.y)){this.x+=dx;return true;}
    if(nav.isOpen(this.x,this.y+dy)){this.y+=dy;return true;}
    return false;
  }
  navigate(delta,target,nav){
    const d=Math.hypot(target.x-this.x,target.y-this.y);
    if(d<108)return;
    const now=this.scene.time.now;
    if(now>=this.repathAt||!this.path.length||this.pathIndex>=this.path.length){
      this.path=nav.findPath(this.x,this.y,target.x,target.y);
      this.pathIndex=0;this.repathAt=now+720;
    }
    while(this.pathIndex<this.path.length&&Math.hypot(this.path[this.pathIndex].x-this.x,this.path[this.pathIndex].y-this.y)<26)this.pathIndex++;
    const p=this.path[this.pathIndex]||target;
    const dx=p.x-this.x,dy=p.y-this.y;
    const length=Math.hypot(dx,dy)||1;
    const speed=this.speed+(this.phase-1)*15,step=Math.min(Math.min(delta,40)/1000*speed,length);
    this.toLeft=dx<0;
    if(!this.move(dx/length*step,dy/length*step,nav))this.repathAt=0;
  }
  update(delta,target,nav){
    if(!this.alive)return;
    const now=this.scene.time.now;
    if(!this.attack&&now>=this.nextAttack)this.startAttack(now,target);
    const a=this.attack;
    if(a){
      this.telegraph.clear();
      if(!a.executed){
        const fraction=Math.max(0,Math.min(1,(now-a.start)/(a.fireAt-a.start)));
        this.telegraph.lineStyle(3+fraction*2,0xffcc78,.48+fraction*.52);
        if(a.type==='charge'){
          this.telegraph.lineBetween(this.x,this.y-21,a.targetX,a.targetY);
          this.telegraph.fillStyle(0xffbb72,.65);this.telegraph.fillCircle(a.targetX,a.targetY,9+fraction*5);
        }else if(a.type==='stomp'){
          this.telegraph.strokeCircle(this.x,this.y,BOSS_CONFIG.stompRadius);
          this.telegraph.strokeCircle(this.x,this.y,BOSS_CONFIG.stompRadius*(1-fraction));
        }else{
          this.telegraph.strokeCircle(this.x,this.y,48+fraction*24);
          for(let i=-2;i<=2;i++){
            const angle=Math.atan2(a.targetY-this.y,a.targetX-this.x)+i*.19;
            this.telegraph.lineBetween(this.x,this.y-31,this.x+Math.cos(angle)*130,this.y-31+Math.sin(angle)*130);
          }
        }
        if(now>=a.fireAt)this.executeAttack(now);
      }else if(a.type==='charge'&&now<a.chargeUntil){
        const step=(430+this.phase*40)*Math.min(delta,40)/1000;
        if(!this.move(a.direction.x*step,a.direction.y*step,nav))a.chargeUntil=now;
        if(Math.hypot(this.x-target.x,this.y-target.y)<this.contactRadius+5)this.scene.damagePlayer(this,1);
      }
      if(a.executed&&(a.type!=='charge'||now>=a.chargeUntil)){
        this.attack=null;this.telegraph.clear();
      }
    }else this.navigate(delta,target,nav);
    const dt=Math.min(delta,40)/1000;
    this.projectiles=this.projectiles.filter(p=>{
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=delta;
      p.sprite.setPosition(p.x,p.y).setDepth(p.y+560);
      if(Math.hypot(p.x-target.x,p.y-target.y)<27){
        this.scene.damagePlayer(this,1);p.sprite.destroy();return false;
      }
      if(p.life<=0||!nav.isOpen(p.x,p.y)){p.sprite.destroy();return false;}
      return true;
    });
    this.timeAnimated+=delta;
    if(this.timeAnimated>170){this.timeAnimated=0;this.frame=(this.frame+1)%4;}
    this.sprite.setTexture(bossTexture(this.toLeft,this.frame)).setPosition(this.x,this.y).setDepth(this.y+220);
    this.shadow.setPosition(this.x,this.y+13).setDepth(this.y+175);
    this.nameplate.setPosition(this.x,this.y-155).setDepth(this.y+340);
  }
  destroy(){
    if(!this.alive)return;
    this.alive=false;
    this.telegraph.clear();this.telegraph.destroy();
    for(const p of this.projectiles)p.sprite.destroy();
    this.projectiles=[];this.nameplate.destroy();this.shadow.destroy();
    this.scene.tweens.add({targets:this.sprite,scale:0,alpha:0,duration:320,onComplete:()=>this.sprite.destroy()});
  }
}

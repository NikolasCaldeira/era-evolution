import { creatureTexture, creaturesList } from '../art/CharacterArt.js';
import { behaviorForCreature } from '../systems/DifficultySystem.js';
import { PLEISTOCENE_SPECIES,pleistoceneCreatureTexture } from '../art/PleistoceneArt.js';
import {CIVILIZATION_SPECIES,civilizationCreatureTexture} from '../art/CivilizationArt.js';
import {MODERN_SPECIES,modernCreatureTexture} from '../art/ModernArt.js';
export class Creature {
  constructor(scene,x,y,id,config={}) {
    this.scene=scene;this.id=id;this.era=config.era||'cretaceo';
    this.species=MODERN_SPECIES[this.era]?MODERN_SPECIES[this.era][id%3]:CIVILIZATION_SPECIES[this.era]?CIVILIZATION_SPECIES[this.era][id%3]:this.era==='pleistoceno'?PLEISTOCENE_SPECIES[id%PLEISTOCENE_SPECIES.length]:creaturesList[id%creaturesList.length];
    this.x=x;this.y=y;this.radius=15;this.hp=3;
    this.behavior=MODERN_SPECIES[this.era]?['investida','resistente','flanqueador'][(id+(['industrial','contemporanea','digital','espacial','extincao'].indexOf(this.era)))%3]:CIVILIZATION_SPECIES[this.era]?['investida','resistente','flanqueador'][(id+(['antiga','medieval','renascimento'].indexOf(this.era)))%3]:this.era==='pleistoceno'?['investida','resistente','resistente'][id%3]:behaviorForCreature(id);
    this.baseSpeed=MODERN_SPECIES[this.era]?({industrial:[82,60,86],contemporanea:[88,75,94],digital:[96,72,103],espacial:[92,85,108],extincao:[98,92,116]})[this.era][id%3]:CIVILIZATION_SPECIES[this.era]?({antiga:[78,56,82],medieval:[85,74,61],renascimento:[74,88,71]})[this.era][id%3]:this.era==='pleistoceno'?[80,55,45][id%3]:55+(id%3)*10;
    this.speed=this.baseSpeed*(config.speedMultiplier||1);
    this.aggression=config.aggression||1;
    this.alive=true;
    this.dashUntil=0;this.nextDash=0;
    this.path=[];this.pathIndex=0;this.repathAt=0;
    this.lastGoal={x:NaN,y:NaN};this.stuckMs=0;
    this.sampleX=x;this.sampleY=y;this.sampleAt=scene.time.now||0;
    this.stallCount=0;this.detourSide=id%2===0?1:-1;
    this.forcedWaypoint=null;this.forcedUntil=0;
    this.frame=0;this.animTime=0;this.toLeft=false;
    this.shadow=scene.add.ellipse(x,y+10,41,13,0x0a1711,.36).setDepth(y+180);
    this.sprite=scene.add.image(x,y,this.texture(false,0)).setOrigin(.5,.81).setScale(.79).setDepth(y+200);
    // A vida é indicada apenas depois de sofrer dano, mantendo a tela limpa.
    this.lifeDots=[];
    for(let i=0;i<3;i++){
      const dot=scene.add.circle(x-10+i*10,y-57,2.6,0xe8dca8).setDepth(y+310).setVisible(false);
      this.lifeDots.push(dot);
    }
  }

  texture(flip,frame){return MODERN_SPECIES[this.era]?modernCreatureTexture(this.era,this.species,flip,frame):CIVILIZATION_SPECIES[this.era]?civilizationCreatureTexture(this.era,this.species,flip,frame):this.era==='pleistoceno'?pleistoceneCreatureTexture(this.species,flip,frame):creatureTexture(this.species,flip,frame);}
  update(delta,target,nav,creatures) {
    if(!this.alive)return;
    const dt=Math.min(delta,40)/1000;
    // Check movement over a full second, not a single frame: wall sliding and
    // oscillation used to be wrongly counted as forward progress.
    if(this.scene.time.now-this.sampleAt>900){
      const travelled=Math.hypot(this.x-this.sampleX,this.y-this.sampleY);
      if(travelled<19){this.stallCount++;this.path=[];this.pathIndex=0;
        this.detourSide*=-1;this.repathAt=0;
        this.forcedWaypoint=nav.escapeWaypoint(this.x,this.y,target.x,target.y,this.detourSide);
        this.forcedUntil=this.scene.time.now+680;
      }else this.stallCount=0;
      this.sampleX=this.x;this.sampleY=this.y;this.sampleAt=this.scene.time.now;
    }
    const distance=Math.hypot(target.x-this.x,target.y-this.y);
    if(distance>29){
      let waypoint={x:target.x,y:target.y};
      if(this.forcedWaypoint && this.scene.time.now>=this.forcedUntil) this.forcedWaypoint=null;
      if(!nav.lineClear(this.x,this.y,target.x,target.y)){
        const goalMoved=Math.hypot(target.x-this.lastGoal.x,target.y-this.lastGoal.y)>44;
        if(!this.path.length||this.pathIndex>=this.path.length||
           (this.scene.time.now>=this.repathAt&&goalMoved)||this.stuckMs>450){
          const route=nav.findPath(this.x,this.y,target.x,target.y);
          if(route.length){this.path=route;this.pathIndex=0;this.stuckMs=0;}
          this.lastGoal={x:target.x,y:target.y};
          this.repathAt=this.scene.time.now+480+(this.id%5)*65;
        }
        while(this.pathIndex<this.path.length&&
          Math.hypot(this.path[this.pathIndex].x-this.x,this.path[this.pathIndex].y-this.y)<14){this.pathIndex++;}
        if(this.pathIndex<this.path.length) waypoint=this.path[this.pathIndex];
        else waypoint={x:this.x,y:this.y};
      }else{this.path=[];this.pathIndex=0;this.stuckMs=0;}
      if(this.forcedWaypoint)waypoint=this.forcedWaypoint;
      // Flanqueadores tentam aproximar-se lateralmente sem atravessar obstáculos.
      let flank=0;
      if(this.behavior==='flanqueador'&&distance>75&&distance<240&& !this.forcedWaypoint){
        flank=.32*this.detourSide;
      }
      // Os pequenos corredores fazem investidas curtas a intervalos crescentes.
      let speedBoost=1;
      if(this.behavior==='investida'&&distance<220&&distance>65){
        if(this.scene.time.now>this.nextDash){
          this.dashUntil=this.scene.time.now+Math.round(320*this.aggression);
          this.nextDash=this.scene.time.now+Math.max(950,2500/this.aggression);
        }
        if(this.scene.time.now<this.dashUntil)speedBoost=1.38;
      }
      this.moveToward(waypoint,dt,delta,nav,creatures,flank,speedBoost);
    }
    this.animTime+=delta;
    if(this.animTime>145){this.animTime=0;this.frame=(this.frame+1)%4;}
    const nextTexture=this.texture(this.toLeft,this.frame);
    if(this.sprite.texture?.key!==nextTexture)this.sprite.setTexture(nextTexture);
    this.sprite.setPosition(this.x,this.y).setDepth(this.y+200);
    this.shadow.setPosition(this.x,this.y+10).setDepth(this.y+180);
    this.lifeDots.forEach((dot,i)=>dot.setPosition(this.x-10+i*10,this.y-49).setDepth(this.y+310));
  }
  moveToward(waypoint,dt,delta,nav,creatures,flank=0,speedBoost=1) {
    let dx=waypoint.x-this.x,dy=waypoint.y-this.y;
    const distance=Math.hypot(dx,dy);if(distance<.01)return;
    dx/=distance;dy/=distance;this.toLeft=dx<-.04;
    let sepX=0,sepY=0;
    for(const other of creatures){
      if(other===this||!other.alive)continue;
      const ox=this.x-other.x,oy=this.y-other.y,d=Math.hypot(ox,oy);
      if(d>.1&&d<31){const intensity=(31-d)/31;sepX+=ox/d*intensity;sepY+=oy/d*intensity;}
    }
    const steerX=dx+sepX*.22-dy*flank,steerY=dy+sepY*.22+dx*flank;
    const length=Math.hypot(steerX,steerY)||1,step=Math.min(this.speed*speedBoost*dt,distance);
    let moved=this.tryMove(steerX/length*step,steerY/length*step,nav);
    if(!moved)moved=this.tryMove(dx*step,dy*step,nav);
    if(!moved){
      // Tentativa local à volta de uma quina antes do novo cálculo de rota.
      const angle=Math.atan2(dy,dx);
      for(const offset of [Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI]){
        for(const side of [this.detourSide,-this.detourSide]){
          if(this.tryMove(Math.cos(angle+offset*side)*step,Math.sin(angle+offset*side)*step,nav)){
            moved=true;break;
          }
        }
        if(moved)break;
      }
    }
    if(!moved)this.stuckMs+=delta;else this.stuckMs=0;
  }
  tryMove(dx,dy,nav){
    const beforeX=this.x,beforeY=this.y;
    if(nav.isOpen(this.x+dx,this.y+dy)){this.x+=dx;this.y+=dy;}
    else {if(nav.isOpen(this.x+dx,this.y))this.x+=dx;if(nav.isOpen(this.x,this.y+dy))this.y+=dy;}
    return Math.hypot(this.x-beforeX,this.y-beforeY)>.15;
  }
  damage(amount=1){
    if(!this.alive)return false;
    this.hp=Math.max(0,this.hp-Math.max(1,Math.floor(amount)));
    this.sprite.setTintFill(0xffe4bd);
    this.scene.time.delayedCall(120,()=>{if(this.sprite.active)this.sprite.clearTint();});
    this.lifeDots.forEach((dot,i)=>dot.setVisible(this.alive && i<this.hp));
    if(this.hp<=0)this.destroy();
    return true;
  }
  destroy(){
    if(!this.alive)return;
    this.alive=false;
    this.scene.tweens.add({targets:this.sprite,alpha:0,scale:.3,duration:180,onComplete:()=>this.sprite.destroy()});
    this.lifeDots.forEach(dot=>dot.destroy());this.shadow.destroy();
  }
}

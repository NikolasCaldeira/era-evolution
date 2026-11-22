import { creatureTexture, creaturesList } from '../art/CharacterArt.js';
export class Creature {
  constructor(scene,x,y,id) {
    this.scene=scene;this.id=id;this.species=creaturesList[id%creaturesList.length];
    this.x=x;this.y=y;this.radius=15;this.hp=3;this.speed=55+(id%3)*10;this.alive=true;
    this.path=[];this.pathIndex=0;this.repathAt=0;
    this.lastGoal={x:NaN,y:NaN};this.stuckMs=0;
    this.frame=0;this.animTime=0;this.toLeft=false;
    this.shadow=scene.add.ellipse(x,y+10,41,13,0x0a1711,.36).setDepth(y+180);
    this.sprite=scene.add.image(x,y,creatureTexture(this.species,false,0)).setOrigin(.5,.81).setScale(.79).setDepth(y+200);
    // A vida é indicada apenas depois de sofrer dano, mantendo a tela limpa.
    this.lifeDots=[];
    for(let i=0;i<3;i++){
      const dot=scene.add.circle(x-10+i*10,y-57,2.6,0xe8dca8).setDepth(y+310).setVisible(false);
      this.lifeDots.push(dot);
    }
  }

  update(delta,target,nav,creatures) {
    if(!this.alive)return;
    const dt=Math.min(delta,40)/1000;
    const distance=Math.hypot(target.x-this.x,target.y-this.y);
    if(distance>29){
      let waypoint={x:target.x,y:target.y};
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
      this.moveToward(waypoint,dt,delta,nav,creatures);
    }
    this.animTime+=delta;
    if(this.animTime>145){this.animTime=0;this.frame=(this.frame+1)%4;}
    this.sprite.setTexture(creatureTexture(this.species,this.toLeft,this.frame));
    this.sprite.setPosition(this.x,this.y).setDepth(this.y+200);
    this.shadow.setPosition(this.x,this.y+10).setDepth(this.y+180);
    this.lifeDots.forEach((dot,i)=>dot.setPosition(this.x-10+i*10,this.y-49).setDepth(this.y+310));
  }
  moveToward(waypoint,dt,delta,nav,creatures) {
    let dx=waypoint.x-this.x,dy=waypoint.y-this.y;
    const distance=Math.hypot(dx,dy);if(distance<.01)return;
    dx/=distance;dy/=distance;this.toLeft=dx<-.04;
    let sepX=0,sepY=0;
    for(const other of creatures){
      if(other===this||!other.alive)continue;
      const ox=this.x-other.x,oy=this.y-other.y,d=Math.hypot(ox,oy);
      if(d>.1&&d<31){const intensity=(31-d)/31;sepX+=ox/d*intensity;sepY+=oy/d*intensity;}
    }
    const steerX=dx+sepX*.22,steerY=dy+sepY*.22;
    const length=Math.hypot(steerX,steerY)||1,step=Math.min(this.speed*dt,distance);
    let moved=this.tryMove(steerX/length*step,steerY/length*step,nav);
    if(!moved)moved=this.tryMove(dx*step,dy*step,nav);
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

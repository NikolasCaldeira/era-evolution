import Phaser from 'phaser';
import { playerTexture } from '../art/CharacterArt.js';
import { pleistocenePlayerTexture } from '../art/PleistoceneArt.js';
import {civilizationPlayerTexture,CIVILIZATION_SPECIES} from '../art/CivilizationArt.js';

const FACING = ['right','down-right','down','down-left','left','up-left','up','up-right'];
export class Player {
  constructor(scene,x,y,era='cretaceo') {
    this.era=era;
    this.scene=scene;this.x=x;this.y=y;this.speed=250;this.radius=16;
    this.facing='down';this.isMoving=false;this.frame=0;this.elapsed=0;
    this.shadow=scene.add.ellipse(x,y+12,40,15,0x071b17,.38).setDepth(y+180);
    this.sprite=scene.add.image(x,y,this.texture('down',0)).setOrigin(.5,.83).setDepth(y+300);
    this.sprite.setScale(.85);
  }
  texture(facing,frame){return CIVILIZATION_SPECIES[this.era]?civilizationPlayerTexture(this.era,facing,frame):this.era==='pleistoceno'?pleistocenePlayerTexture(facing,frame):playerTexture(facing,frame);}
  update(delta,direction,obstacles,map) {
    const dt=Math.min(delta,40)/1000;
    let dx=direction.x,dy=direction.y;
    const magnitude=Math.hypot(dx,dy)||1;dx/=magnitude;dy/=magnitude;
    const stepX=dx*this.speed*dt,stepY=dy*this.speed*dt;
    const nx=this.x+stepX;
    if(this.insideMap(nx,this.y,map)&&!this.collides(nx,this.y,obstacles))this.x=nx;
    const ny=this.y+stepY;
    if(this.insideMap(this.x,ny,map)&&!this.collides(this.x,ny,obstacles))this.y=ny;
    this.isMoving=Math.abs(dx)+Math.abs(dy)>.01;
    if(this.isMoving){
      const angle=Math.atan2(dy,dx);
      this.facing=FACING[Math.round(((angle+2*Math.PI)%(2*Math.PI))/(Math.PI/4))%8];
      this.elapsed+=delta;if(this.elapsed>125){this.elapsed=0;this.frame=(this.frame+1)%4;}
    }else{this.elapsed=0;this.frame=0;}
    this.sprite.setTexture(this.texture(this.facing,this.frame));
    this.shadow.setPosition(this.x,this.y+12).setDepth(this.y+180);
    this.sprite.setPosition(this.x,this.y).setDepth(this.y+300);
  }
  insideMap(screenX,screenY,map) {
    const p=map.projection.toWorld(screenX,screenY),margin=1.55;
    return p.x>=margin&&p.y>=margin&&p.x<=map.columns-margin&&p.y<=map.rows-margin;
  }
  collides(x,y,obstacles) {return obstacles.some(o=>Math.abs(x-o.x)<o.rx&&Math.abs(y-o.y)<o.ry);}
}

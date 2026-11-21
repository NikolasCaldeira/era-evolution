import Phaser from 'phaser';
import { SETTINGS } from '../core/Settings.js';
import { IsoProjection } from '../world/IsoProjection.js';
import { WorldGenerator } from '../world/WorldGenerator.js';
import { Player } from '../entities/Player.js';
import { Creature } from '../entities/Creature.js';
import { NavigationGrid } from '../world/NavigationGrid.js';
import { createCharacterArt } from '../art/CharacterArt.js';
export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.cameras.main.setBackgroundColor('#122a24');
    createCharacterArt(this);
    this.projection = new IsoProjection(SETTINGS.tileWidth,SETTINGS.tileHeight,SETTINGS.mapRows*SETTINGS.tileWidth/2,SETTINGS.tileHeight/2);
    this.world = new WorldGenerator(this,this.projection); this.world.create(SETTINGS.mapColumns,SETTINGS.mapRows);
    this.createAtmosphere();
    this.navigation = new NavigationGrid({ projection:this.projection, columns:SETTINGS.mapColumns, rows:SETTINGS.mapRows, obstacles:this.world.obstacles });
    const start=this.projection.toScreen(17,14); this.player=new Player(this,start.x,start.y);
    this.map={projection:this.projection,columns:SETTINGS.mapColumns,rows:SETTINGS.mapRows};
    const mapW=(SETTINGS.mapColumns+SETTINGS.mapRows)*SETTINGS.tileWidth/2, mapH=(SETTINGS.mapColumns+SETTINGS.mapRows)*SETTINGS.tileHeight/2;
    this.cameras.main.setBounds(0,0,mapW,mapH); this.cameras.main.startFollow(this.player.sprite,true,.09,.09);
    this.cameras.main.setZoom(this.getZoom(this.scale.width));
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,F3');
    this.debugRoutes=false; this.routeGraphics=this.add.graphics().setDepth(9990);
    this.input.keyboard.on('keydown-F3',()=>{this.debugRoutes=!this.debugRoutes;this.routeGraphics.clear();this.showMessage(this.debugRoutes?'Rotas das criaturas: visíveis (F3)':'Rotas das criaturas: ocultas (F3)');});
    this.creatures=[]; this.fragments=[]; this.kills=0; this.fragmentCount=0; this.level=1; this.power=1; this.lastAttack=0; this.spawnTimer=0;
    this.projectiles=[]; this.createHud(); this.showMessage('CRETÁCEO · Explore, sobreviva e recolha fragmentos');
    this.input.keyboard.on('keydown-ESC',()=>{if(!this.scene.isActive('PauseScene'))this.scene.launch('PauseScene');});
    this.scale.on('resize',size=>this.cameras.main.setZoom(this.getZoom(size.width)));
    this.spawnInitialCreatures();
  }
  getZoom(width){return Math.min(1.1,Math.max(.72,width/1200));}
  spawnInitialCreatures(){for(let i=0;i<8;i++)this.spawnCreature(i);}
  spawnCreature(id){
    const candidates=[[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]; const t=candidates[id%candidates.length];
    const p=this.projection.toScreen(t[0],t[1]);
    const spawn = this.navigation.isOpen(p.x,p.y) ? p : this.navigation.nearestOpenPoint(p.x,p.y);
    if (spawn) this.creatures.push(new Creature(this,spawn.x,spawn.y,id));
  }
  createAtmosphere(){
    // Pontos de luz / esporos flutuantes, sem efeito na colisão ou no combate.
    this.ambientMotes=[];
    for(let i=0;i<24;i++){
      const tileX=2+(i*17%29),tileY=2+(i*11%23);
      const p=this.projection.toScreen(tileX,tileY);
      const mote=this.add.circle(p.x+(i*13)%38,p.y-24,1.4+i%2,0xd4dca0,.17+i%3*.06).setDepth(p.y+40);
      this.tweens.add({targets:mote,y:p.y-44-(i%4)*6,alpha:.08,yoyo:true,repeat:-1,duration:1400+(i*97)%1700});
      this.ambientMotes.push(mote);
    }
  }
  createHud(){
    this.hud=this.add.container(0,0).setScrollFactor(0).setDepth(10000);
    this.hud.add(this.add.rectangle(16,16,346,112,0x0d2420,.91).setOrigin(0).setStrokeStyle(1,0x719579,.57));
    this.hud.add(this.add.rectangle(16,16,5,112,0xd7bd7f).setOrigin(0));
    this.hud.add(this.add.text(34,27,'ERA 01  |  CRETÁCEO',{
      fontFamily:'Georgia,serif',fontSize:'17px',fontStyle:'bold',color:'#f1deb0',letterSpacing:1
    }));
    this.hud.add(this.add.text(34,51,'UM MUNDO ANTES DA HUMANIDADE',{
      fontFamily:'Arial',fontSize:'10px',color:'#8fba9c',letterSpacing:2
    }));
    this.stats=this.add.text(34,77,'Criaturas: 0   •   Fragmentos: 0/10\nNível: 1   •   Disparo: 1',{
      fontFamily:'Arial',fontSize:'13px',color:'#dfe9d1',lineSpacing:5
    });this.hud.add(this.stats);
  }
  showMessage(message){if(this.message)this.message.destroy();this.message=this.add.text(this.scale.width/2,70,message,{fontSize:'14px',color:'#f0dfaa',backgroundColor:'#101b1b',padding:{x:14,y:9}}).setOrigin(.5).setScrollFactor(0).setDepth(12000);this.time.delayedCall(2600,()=>this.message?.destroy());}
  update(_time,delta){
    if(!this.player)return;
    const dir={x:Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown),y:Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)};
    this.player.update(delta,dir,this.world.obstacles,this.map);
    this.creatures.forEach(c=>c.update(delta,this.player,this.navigation,this.creatures));
    this.renderRouteDebug();
    this.autoShoot(); this.updateProjectiles(delta); this.collectFragments();
    this.spawnTimer+=delta;if(this.spawnTimer>7000&&this.creatures.filter(c=>c.alive).length<8){this.spawnTimer=0;this.spawnCreature(this.kills+this.creatures.length);}
    this.stats.setText(`Criaturas: ${this.kills}  •  Fragmentos: ${this.fragmentCount}/10\nNível: ${this.level}  •  Disparo: ${this.power}`);
  }
  renderRouteDebug(){
    this.routeGraphics.clear();
    if (!this.debugRoutes) return;
    const g=this.routeGraphics; g.lineStyle(2,0xffdc78,.78);
    this.creatures.filter(c=>c.alive).forEach(c=>{
      const points=c.path.slice(c.pathIndex);
      if (!points.length) return;
      g.beginPath(); g.moveTo(c.x,c.y);
      points.forEach(point=>g.lineTo(point.x,point.y));g.strokePath();
      points.forEach(p=>{g.fillStyle(0xffdf8d,.85);g.fillCircle(p.x,p.y,4);});
    });
  }
  autoShoot(){
    const now=this.time.now;
    if(now-this.lastAttack<SETTINGS.attackCooldown)return;
    const range=SETTINGS.attackRange * (1 + (this.power-1)*.2);
    const target=this.creatures.filter(c=>c.alive && Phaser.Math.Distance.Between(c.x,c.y,this.player.x,this.player.y)<range)
      .sort((a,b)=>Phaser.Math.Distance.Between(a.x,a.y,this.player.x,this.player.y)-Phaser.Math.Distance.Between(b.x,b.y,this.player.x,this.player.y))[0];
    if(!target)return;
    this.lastAttack=now;
    const dx=target.x-this.player.x,dy=target.y-this.player.y,dist=Math.hypot(dx,dy)||1;
    const x=this.player.x+dx/dist*20,y=this.player.y-15+dy/dist*20;
    const bolt=this.add.star(x,y,4,3,10,0x64f5d2,1).setStrokeStyle(1.5,0xeaffd5).setDepth(y+350);
    const glow=this.add.circle(x,y,16,0x54efc6,.2).setDepth(y+349);
    this.projectiles.push({x,y,vx:dx/dist*460,vy:dy/dist*460,life:range/460*1000+180,bolt,glow});
  }
  updateProjectiles(delta){
    const dt=Math.min(delta,40)/1000;
    this.projectiles=this.projectiles.filter(p=>{
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=delta;
      p.bolt.setPosition(p.x,p.y).setDepth(p.y+350);
      p.bolt.rotation += dt*7;
      p.glow.setPosition(p.x,p.y).setDepth(p.y+349);
      const target=this.creatures.find(c=>c.alive&&Phaser.Math.Distance.Between(c.x,c.y-7,p.x,p.y)<19);
      if(target){
        target.damage();
        const flash=this.add.circle(p.x,p.y,9,0x8cf7cf,.82).setDepth(p.y+450);
        this.tweens.add({targets:flash,scale:2.5,alpha:0,duration:130,onComplete:()=>flash.destroy()});
        if(!target.alive){this.kills++;this.dropFragment(target.x,target.y);if(this.kills%10===0)this.showMessage('A atividade aumentou: novas criaturas estão chegando!');}
      }
      if(target||p.life<=0){p.bolt.destroy();p.glow.destroy();return false;}
      return true;
    });
  }
  dropFragment(x,y){const shard=this.add.star(x,y,4,5,11,0xf1d58f).setDepth(y+250);this.tweens.add({targets:shard,y:y-12, yoyo:true,repeat:2,duration:280});this.fragments.push(shard);}
  collectFragments(){
    this.fragments=this.fragments.filter(f=>{if(!f.active)return false;if(Phaser.Math.Distance.Between(f.x,f.y,this.player.x,this.player.y)<35){f.destroy();this.fragmentCount++;if(this.fragmentCount>=SETTINGS.fragmentGoal)this.openUpgrade();return false;}return true;});
  }
  openUpgrade(){
    this.fragmentCount=0;this.scene.pause();this.scene.launch('UpgradeScene',{level:this.level,power:this.power});
  }
}

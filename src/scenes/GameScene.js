import Phaser from 'phaser';
import { SETTINGS } from '../core/Settings.js';
import { SurvivalState } from '../core/SurvivalState.js';
import { screenAnchor } from '../core/ScreenAnchor.js';
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
    this.projection = new IsoProjection(
      SETTINGS.tileWidth, SETTINGS.tileHeight,
      SETTINGS.mapRows * SETTINGS.tileWidth / 2, SETTINGS.tileHeight / 2
    );
    this.world = new WorldGenerator(this,this.projection);
    this.world.create(SETTINGS.mapColumns, SETTINGS.mapRows);
    this.createAtmosphere();
    this.navigation = new NavigationGrid({
      projection:this.projection, columns:SETTINGS.mapColumns,
      rows:SETTINGS.mapRows, obstacles:this.world.obstacles
    });
    const start=this.projection.toScreen(17,14);
    this.player=new Player(this,start.x,start.y);
    this.survival=new SurvivalState({
      maxHealth:SETTINGS.maxHealth,
      invulnerabilityMs:SETTINGS.damageInvulnerabilityMs
    });
    this.map={projection:this.projection,columns:SETTINGS.mapColumns,rows:SETTINGS.mapRows};
    const mapW=(SETTINGS.mapColumns+SETTINGS.mapRows)*SETTINGS.tileWidth/2;
    const mapH=(SETTINGS.mapColumns+SETTINGS.mapRows)*SETTINGS.tileHeight/2;
    this.cameras.main.setBounds(0,0,mapW,mapH);
    this.cameras.main.startFollow(this.player.sprite,true,.09,.09);
    this.cameras.main.setZoom(this.getZoom(this.scale.width));

    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,F3');
    this.debugRoutes=false;
    this.routeGraphics=this.add.graphics().setDepth(9990);
    this.onRouteKey=()=>{
      if(this.ended)return;
      this.debugRoutes=!this.debugRoutes;
      this.routeGraphics.clear();
      this.showMessage(this.debugRoutes?'Rotas das criaturas: visíveis (F3)':'Rotas das criaturas: ocultas (F3)');
    };
    this.onPauseKey=()=>{
      if(!this.ended && !this.upgrading && !this.scene.isActive('PauseScene')) this.scene.launch('PauseScene');
    };
    this.input.keyboard.on('keydown-F3',this.onRouteKey);
    this.input.keyboard.on('keydown-ESC',this.onPauseKey);

    this.creatures=[];
    this.fragments=[];
    this.projectiles=[];
    this.kills=0;
    this.fragmentCount=0;
    this.level=1;
    this.power=1;
    this.lastAttack=-Infinity;
    this.spawnTimer=0;
    this.elapsedMs=0;
    this.upgrading=false;
    this.ended=false;
    this.eraGoalAnnounced=false;
    this.createHud();
    this.showMessage('CRETÁCEO · Explore, sobreviva e recolha fragmentos');
    this.onResize=size=>{
      this.cameras.main.setZoom(this.getZoom(size.width));
      this.layoutHud();
      if(this.message?.active) this.fixToScreen(this.message,size.width/2,this.messageScreenY());
    };
    this.scale.on('resize',this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard.off('keydown-F3',this.onRouteKey);
      this.input.keyboard.off('keydown-ESC',this.onPauseKey);
      this.scale.off('resize',this.onResize);
    });
    this.spawnInitialCreatures();
    this.updateHud();
  }

  getZoom(width){return Math.min(1.1,Math.max(.72,width/1200));}
  messageScreenY(){return this.scale.width<960?180:16;}
  spawnInitialCreatures(){for(let i=0;i<8;i++)this.spawnCreature(i);}
  spawnCreature(id){
    const candidates=[[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]];
    const t=candidates[id%candidates.length];
    const p=this.projection.toScreen(t[0],t[1]);
    const spawn=this.navigation.isOpen(p.x,p.y)?p:this.navigation.nearestOpenPoint(p.x,p.y);
    if(spawn)this.creatures.push(new Creature(this,spawn.x,spawn.y,id));
  }
  createAtmosphere(){
    this.ambientMotes=[];
    for(let i=0;i<24;i++){
      const tileX=2+(i*17%29),tileY=2+(i*11%23);
      const p=this.projection.toScreen(tileX,tileY);
      const mote=this.add.circle(p.x+(i*13)%38,p.y-24,1.4+i%2,0xd4dca0,.17+i%3*.06).setDepth(p.y+40);
      this.tweens.add({targets:mote,y:p.y-44-(i%4)*6,alpha:.08,yoyo:true,repeat:-1,duration:1400+(i*97)%1700});
      this.ambientMotes.push(mote);
    }
  }

  /** Objetos fixos devem compensar o zoom da câmera que segue o jogador. */
  fixToScreen(object,screenX,screenY){
    const pos=screenAnchor(this.scale.width,this.scale.height,this.cameras.main.zoom,screenX,screenY);
    object.setScrollFactor(0).setScale(pos.scale).setPosition(pos.x,pos.y);
  }
  createHud(){
    const h=this.hud=this.add.container(0,0).setScrollFactor(0).setDepth(10000);
    this.hudBack=this.add.rectangle(0,0,390,154,0x0d2420,.94).setOrigin(0).setStrokeStyle(1,0x719579,.68);
    h.add(this.hudBack);
    h.add(this.add.rectangle(0,0,5,154,0xd7bd7f).setOrigin(0));
    h.add(this.add.text(17,12,'ERA 01  |  CRETÁCEO',{fontFamily:'Georgia,serif',fontSize:'17px',fontStyle:'bold',color:'#f1deb0'}));
    h.add(this.add.text(17,38,'SOBREVIVA AO MUNDO PRIMORDIAL',{fontFamily:'Arial',fontSize:'10px',color:'#9ec5a9',letterSpacing:1}));
    h.add(this.add.text(17,60,'VIDA',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#c3d9c2'}));
    this.healthText=this.add.text(53,57,'♥ ♥ ♥ ♥ ♥',{fontFamily:'Arial',fontSize:'21px',color:'#eb9a7b'});
    h.add(this.healthText);
    this.healthTrack=this.add.rectangle(17,89,352,8,0x355044,.95).setOrigin(0);
    this.healthFill=this.add.rectangle(17,89,352,8,0xef9d7d,1).setOrigin(0);
    h.add([this.healthTrack,this.healthFill]);
    this.stats=this.add.text(17,106,'Eliminações: 0/100   •   Fragmentos: 0/10',{fontFamily:'Arial',fontSize:'12px',color:'#f2ead1'});
    this.weaponText=this.add.text(17,125,'Nível 1   •   Arma: Artefato   •   Potência 1',{fontFamily:'Arial',fontSize:'11px',color:'#bdd5c0'});
    h.add([this.stats,this.weaponText]);
    this.eraTrack=this.add.rectangle(17,145,352,4,0x314739).setOrigin(0);
    this.eraFill=this.add.rectangle(17,145,0,4,0xe2c17a).setOrigin(0);
    h.add([this.eraTrack,this.eraFill]);
    this.layoutHud();
  }
  layoutHud(){
    if(!this.hud)return;
    const width=Math.min(390,Math.max(275,this.scale.width-32));
    const track=width-34;
    this.hudBack.setSize(width,154).setDisplaySize(width,154);
    this.healthTrack.setDisplaySize(track,8);
    this.eraTrack.setDisplaySize(track,4);
    this.hudWidth=width;
    this.fixToScreen(this.hud,16,16);
    this.updateHud();
  }
  updateHud(){
    if(!this.survival||!this.stats)return;
    const health=this.survival.health;
    this.healthText.setText('♥ '.repeat(health)+'♡ '.repeat(this.survival.maxHealth-health));
    this.healthFill.setDisplaySize(Math.max(.01,(this.hudWidth-34)*health/this.survival.maxHealth),8);
    this.healthFill.setFillStyle(health<=2?0xe66f6e:0xef9d7d);
    this.stats.setText(`Eliminações: ${Math.min(this.kills,SETTINGS.eraKillGoal)}/${SETTINGS.eraKillGoal}   •   Fragmentos: ${this.fragmentCount}/${SETTINGS.fragmentGoal}`);
    this.weaponText.setText(`Nível ${this.level}  •  Arma: Artefato  •  Potência ${this.power}`);
    this.eraFill.setDisplaySize(Math.max(.01,(this.hudWidth-34)*Math.min(1,this.kills/SETTINGS.eraKillGoal)),4);
    const compact=this.scale.width<470;
    this.stats.setFontSize(compact?10:12);
    this.weaponText.setFontSize(compact?10:11);
  }
  showMessage(message){
    if(this.message?.active)this.message.destroy();
    const m=this.add.text(0,0,message,{
      fontFamily:'Arial',fontSize:'13px',color:'#f0dfaa',backgroundColor:'#101b1b',
      padding:{x:14,y:9},align:'center',wordWrap:{width:Math.max(210,this.scale.width-32)}
    }).setOrigin(.5,0).setDepth(12000);
    this.message=m;
    this.fixToScreen(m,this.scale.width/2,this.messageScreenY());
    this.time.delayedCall(2600,()=>{
      if(m.active)m.destroy();
      if(this.message===m)this.message=null;
    });
  }

  update(_time,delta){
    if(!this.player||this.ended)return;
    this.elapsedMs+=delta;
    const dir={
      x:Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown),
      y:Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown)
    };
    this.player.update(delta,dir,this.world.obstacles,this.map);
    this.creatures.forEach(c=>c.update(delta,this.player,this.navigation,this.creatures));
    this.checkPlayerContact();
    if(this.ended)return;
    // Piscar comunica invulnerabilidade temporária sem impedir movimento ou disparos.
    this.player.sprite.setAlpha(this.survival.isInvulnerable(this.time.now)?(Math.floor(this.time.now/115)%2?.43:1):1);
    this.renderRouteDebug();
    this.autoShoot();
    this.updateProjectiles(delta);
    this.collectFragments();
    this.spawnTimer+=delta;
    if(this.spawnTimer>7000&&this.creatures.filter(c=>c.alive).length<8){
      this.spawnTimer=0;this.spawnCreature(this.kills+this.creatures.length);
    }
    this.updateHud();
  }
  checkPlayerContact(){
    if(this.survival.isInvulnerable(this.time.now))return;
    const attacker=this.creatures.find(c=>c.alive&&Math.hypot(c.x-this.player.x,c.y-this.player.y)<SETTINGS.contactRadius);
    if(!attacker)return;
    const result=this.survival.takeHit(this.time.now,1);
    if(!result.applied)return;
    this.addFloatingNumber(this.player.x,this.player.y-68,'−1','#ff9d8d');
    this.makeImpact(this.player.x,this.player.y-20,0xffab95,24);
    this.cameras.main.shake(120,.002);
    this.player.sprite.setTintFill(0xffb1a1);
    this.time.delayedCall(110,()=>{if(this.player?.sprite?.active)this.player.sprite.clearTint();});
    // Pequeno recuo, sem atravessar rochas nem sair da arena.
    const dx=this.player.x-attacker.x,dy=this.player.y-attacker.y;
    const distance=Math.hypot(dx,dy)||1;
    const nx=this.player.x+dx/distance*23,ny=this.player.y+dy/distance*23;
    if(this.navigation.isOpen(nx,ny)&&this.player.insideMap(nx,ny,this.map)&&!this.player.collides(nx,ny,this.world.obstacles)){
      this.player.x=nx;this.player.y=ny;
      this.player.sprite.setPosition(nx,ny);
      this.player.shadow.setPosition(nx,ny+12);
    }
    this.updateHud();
    if(result.defeated)this.endRun();
  }
  endRun(){
    if(this.ended)return;
    this.ended=true;
    this.player.sprite.setAlpha(1);
    this.scene.pause();
    this.scene.launch('GameOverScene',{
      kills:this.kills,level:this.level,seconds:Math.floor(this.elapsedMs/1000)
    });
  }
  addFloatingNumber(x,y,text,color){
    const label=this.add.text(x,y,text,{
      fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color,
      stroke:'#172920',strokeThickness:4
    }).setOrigin(.5).setDepth(y+1050);
    this.tweens.add({targets:label,y:y-36,alpha:0,duration:570,ease:'Sine.easeOut',onComplete:()=>label.destroy()});
  }
  makeImpact(x,y,color=0xb8f7d7,radius=12){
    const flash=this.add.circle(x,y,radius,color,.65).setDepth(y+900);
    const ring=this.add.circle(x,y,radius+5,color,0).setStrokeStyle(2,color,.9).setDepth(y+901);
    this.tweens.add({targets:flash,scale:2.2,alpha:0,duration:200,onComplete:()=>flash.destroy()});
    this.tweens.add({targets:ring,scale:2.1,alpha:0,duration:250,onComplete:()=>ring.destroy()});
  }
  renderRouteDebug(){
    this.routeGraphics.clear();
    if(!this.debugRoutes)return;
    const g=this.routeGraphics;g.lineStyle(2,0xffdc78,.78);
    this.creatures.filter(c=>c.alive).forEach(c=>{
      const points=c.path.slice(c.pathIndex);
      if(!points.length)return;
      g.beginPath();g.moveTo(c.x,c.y);
      points.forEach(point=>g.lineTo(point.x,point.y));g.strokePath();
      points.forEach(p=>{g.fillStyle(0xffdf8d,.85);g.fillCircle(p.x,p.y,4);});
    });
  }
  autoShoot(){
    const now=this.time.now;
    if(now-this.lastAttack<SETTINGS.attackCooldown)return;
    const range=SETTINGS.attackRange*(1+(this.power-1)*.2);
    const target=this.creatures.filter(c=>c.alive&&Phaser.Math.Distance.Between(c.x,c.y,this.player.x,this.player.y)<range)
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
      p.bolt.rotation+=dt*7;
      p.glow.setPosition(p.x,p.y).setDepth(p.y+349);
      const target=this.creatures.find(c=>c.alive&&Phaser.Math.Distance.Between(c.x,c.y-7,p.x,p.y)<19);
      if(target){
        target.damage();
        this.addFloatingNumber(target.x,target.y-58,'1','#f9e3a6');
        this.makeImpact(p.x,p.y,0x8cf7cf,11);
        if(!target.alive){
          this.kills++;
          this.dropFragment(target.x,target.y);
          if(this.kills%10===0)this.showMessage('A atividade aumentou: novas criaturas estão chegando!');
          if(this.kills>=SETTINGS.eraKillGoal&&!this.eraGoalAnnounced){
            this.eraGoalAnnounced=true;
            this.showMessage('Meta de eliminações atingida! Chefe previsto para o próximo ciclo.');
          }
        }
      }
      if(target||p.life<=0){p.bolt.destroy();p.glow.destroy();return false;}
      return true;
    });
  }
  dropFragment(x,y){
    const shard=this.add.star(x,y,4,5,11,0xf1d58f).setDepth(y+250);
    this.tweens.add({targets:shard,y:y-12,yoyo:true,repeat:2,duration:280});
    this.fragments.push(shard);
  }
  collectFragments(){
    if(this.upgrading)return;
    this.fragments=this.fragments.filter(f=>{
      if(!f.active)return false;
      if(Phaser.Math.Distance.Between(f.x,f.y,this.player.x,this.player.y)<35){
        f.destroy();this.fragmentCount++;
        if(this.fragmentCount>=SETTINGS.fragmentGoal)this.openUpgrade();
        return false;
      }
      return true;
    });
  }
  openUpgrade(){
    if(this.upgrading||this.ended)return;
    this.upgrading=true;
    this.fragmentCount=0;
    this.scene.pause();
    this.scene.launch('UpgradeScene',{level:this.level,power:this.power});
  }
}

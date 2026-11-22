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
import { WeaponState, WEAPONS, weaponRewardForKills, createSalvo, attackCooldown } from '../systems/WeaponSystem.js';
import { UpgradeState } from '../systems/UpgradeSystem.js';
import { difficultyForKills, chooseSpawnPoint } from '../systems/DifficultySystem.js';
import { magnetRadius, advanceFragment } from '../systems/MagnetSystem.js';
import { BOSS_CONFIG } from '../systems/BossSystem.js';
import { createBossArt } from '../art/BossArt.js';
import { CretaceousBoss } from '../entities/CretaceousBoss.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#122a24');
    createCharacterArt(this);
    createBossArt(this);
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
    this.onWeaponKey=(event)=>{
      if(event.repeat||this.ended||this.upgrading||!this.scene.isActive())return;
      const previous=this.weapons.active;
      if(event.code==='KeyQ')this.weapons.cycle(-1);
      else if(event.code==='KeyE')this.weapons.cycle(1);
      else if(/^Digit[1-5]$/.test(event.code))this.weapons.select(this.weapons.unlocked[Number(event.code.slice(-1))-1]);
      if(previous!==this.weapons.active){
        this.lastAttack=-Infinity;this.updateHud();this.showMessage(`Arma equipada: ${this.weapons.current.label}`);
      }
    };
    this.input.keyboard.on('keydown',this.onWeaponKey);
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
    this.boss=null;
    this.bossActive=false;
    this.fragments=[];
    this.projectiles=[];
    this.weaponPickups=[];
    this.weapons=new WeaponState();
    this.upgrades=new UpgradeState();
    this.weaponAura=this.add.circle(this.player.x+20,this.player.y-20,5,WEAPONS.artefato.color,.95).setDepth(this.player.y+340);
    this.kills=0;
    this.difficulty=difficultyForKills(0);
    this.spawnSequence=0;
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
    this.createBossHud();
    this.showMessage('CRETÁCEO · Explore, sobreviva e recolha fragmentos');
    this.onResize=size=>{
      this.cameras.main.setZoom(this.getZoom(size.width));
      this.layoutHud();
      this.layoutBossHud();
      if(this.message?.active) this.fixToScreen(this.message,size.width/2,this.messageScreenY());
    };
    this.scale.on('resize',this.onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard.off('keydown',this.onWeaponKey);
      this.input.keyboard.off('keydown-F3',this.onRouteKey);
      this.input.keyboard.off('keydown-ESC',this.onPauseKey);
      this.scale.off('resize',this.onResize);
    });
    // Teste direto do encontro: ?testeChefe=1. Não altera o fluxo normal.
    const bossTest=typeof window!=='undefined' && new URLSearchParams(window.location.search).get('testeChefe')==='1';
    if(bossTest){
      this.kills=SETTINGS.eraKillGoal;
      this.eraGoalAnnounced=true;
      for(let milestone=10;milestone<=90;milestone+=10)this.weapons.collect(weaponRewardForKills(milestone));
      this.weapons.select('orbe');
      this.power=4;
      this.beginBossEncounter();
    }else this.spawnInitialCreatures();
    this.updateHud();
  }

  getZoom(width){return Math.min(1.1,Math.max(.72,width/1200));}
  messageScreenY(){return this.scale.width<960?210:16;}
  spawnInitialCreatures(){for(let i=0;i<this.difficulty.maxAlive;i++)this.spawnCreature(i);}
  /** Geração evita posições sem caminho até o jogador. */
  spawnCreature(id){
    const next=chooseSpawnPoint({navigation:this.navigation,projection:this.projection,
      player:this.player,sequence:this.spawnSequence++,minimumDistance:235});
    if(next)this.creatures.push(new Creature(this,next.x,next.y,id,{
      speedMultiplier:this.difficulty.speedMultiplier,aggression:this.difficulty.aggression
    }));
    return Boolean(next);
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
    this.hudBack=this.add.rectangle(0,0,390,207,0x0d2420,.94).setOrigin(0).setStrokeStyle(1,0x719579,.68);
    h.add(this.hudBack);
    h.add(this.add.rectangle(0,0,5,207,0xd7bd7f).setOrigin(0));
    h.add(this.add.text(17,12,'ERA 01  |  CRETÁCEO',{fontFamily:'Georgia,serif',fontSize:'17px',fontStyle:'bold',color:'#f1deb0'}));
    h.add(this.add.text(17,38,'SOBREVIVA AO MUNDO PRIMORDIAL',{fontFamily:'Arial',fontSize:'10px',color:'#9ec5a9',letterSpacing:1}));
    h.add(this.add.text(17,60,'VIDA',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#c3d9c2'}));
    this.healthText=this.add.text(53,57,'♥ ♥ ♥ ♥ ♥',{fontFamily:'Arial',fontSize:'21px',color:'#eb9a7b'});
    h.add(this.healthText);
    this.healthTrack=this.add.rectangle(17,89,352,8,0x355044,.95).setOrigin(0);
    this.healthFill=this.add.rectangle(17,89,352,8,0xef9d7d,1).setOrigin(0);
    h.add([this.healthTrack,this.healthFill]);
    this.stats=this.add.text(17,106,'Eliminações: 0/100   •   Fragmentos: 0/10',{fontFamily:'Arial',fontSize:'12px',color:'#f2ead1'});
    this.weaponText=this.add.text(17,125,'Nível 1  •  Artefato Verde Nv.1',{fontFamily:'Arial',fontSize:'11px',color:'#bdd5c0'});
    this.inventoryText=this.add.text(17,143,'Q/E troca arma  •  1–5 seleção rápida',{fontFamily:'Arial',fontSize:'10px',color:'#96b9ae'});
    h.add([this.stats,this.weaponText,this.inventoryText]);
    this.threatText=this.add.text(17,163,'PRESSÃO 01  •  8 criaturas  •  6,7 s',{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#e5c17c'});
    h.add(this.threatText);
    this.eraTrack=this.add.rectangle(17,192,352,5,0x314739).setOrigin(0);
    this.eraFill=this.add.rectangle(17,192,0,5,0xe2c17a).setOrigin(0);
    h.add([this.eraTrack,this.eraFill]);
    this.layoutHud();
  }
  layoutHud(){
    if(!this.hud)return;
    const width=Math.min(390,Math.max(275,this.scale.width-32));
    const track=width-34;
    this.hudBack.setSize(width,207).setDisplaySize(width,207);
    this.healthTrack.setDisplaySize(track,8);
    this.eraTrack.setDisplaySize(track,4);
    this.hudWidth=width;
    this.fixToScreen(this.hud,16,16);
    this.updateHud();
  }
  createBossHud(){
    const h=this.bossHud=this.add.container(0,0).setScrollFactor(0).setDepth(11500).setVisible(false);
    h.add(this.add.rectangle(0,0,510,66,0x13261f,.93).setOrigin(.5,0).setStrokeStyle(2,0xd2ab75,.8));
    this.bossTitle=this.add.text(0,8,'CHEFE  •  TRICERÁTOPS ANCESTRAL',{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#f2d59b'}).setOrigin(.5,0);
    this.bossHPTrack=this.add.rectangle(-230,42,460,13,0x384a3e,.96).setOrigin(0);
    this.bossHPFill=this.add.rectangle(-230,42,460,13,0xe6a66f,1).setOrigin(0);
    h.add([this.bossTitle,this.bossHPTrack,this.bossHPFill]);
    this.layoutBossHud();
  }
  layoutBossHud(){
    if(!this.bossHud)return;
    const w=this.scale.width;
    const scale=Math.min(1,w/560);
    this.fixToScreen(this.bossHud,w/2,this.scale.height-88*scale);
    this.bossHud.setScale(this.bossHud.scaleX*scale);
  }
  updateBossHud(){
    if(!this.boss?.alive){this.bossHud?.setVisible(false);return;}
    this.bossHud.setVisible(true);
    this.bossHPFill.setDisplaySize(Math.max(.01,460*this.boss.state.healthRatio),13);
    this.bossHPFill.setFillStyle(this.boss.phase===3?0xf07963:0xe6a66f);
    this.bossTitle.setText(`CHEFE  •  ${BOSS_CONFIG.name}  •  FASE ${this.boss.phase}`);
  }
  updateHud(){
    if(!this.survival||!this.stats)return;
    const health=this.survival.health;
    this.healthText.setText('♥ '.repeat(health)+'♡ '.repeat(this.survival.maxHealth-health));
    this.healthFill.setDisplaySize(Math.max(.01,(this.hudWidth-34)*health/this.survival.maxHealth),8);
    this.healthFill.setFillStyle(health<=2?0xe66f6e:0xef9d7d);
    this.stats.setText(`Eliminações: ${Math.min(this.kills,SETTINGS.eraKillGoal)}/${SETTINGS.eraKillGoal}   •   Fragmentos: ${this.fragmentCount}/${SETTINGS.fragmentGoal}`);
    this.weaponText.setText(`Nível ${this.level}  •  ${this.weapons.current.label} Nv.${this.weapons.tier}  •  Poder ${this.power}`);
    this.weaponText.setColor('#'+this.weapons.current.color.toString(16).padStart(6,'0'));
    this.inventoryText.setText(`${this.weapons.unlocked.length} armas  •  Q/E alternar  •  Ímã ${magnetRadius(this.upgrades.pickupRadius)} px`);
    this.threatText.setText(`PRESSÃO ${String(this.difficulty.stage+1).padStart(2,'0')}  •  ${this.difficulty.maxAlive} criaturas  •  ${(this.difficulty.spawnIntervalMs/1000).toFixed(1)} s`);
    this.eraFill.setDisplaySize(Math.max(.01,(this.hudWidth-34)*Math.min(1,this.kills/SETTINGS.eraKillGoal)),4);
    const compact=this.scale.width<470;
    this.stats.setFontSize(compact?10:12);
    this.weaponText.setFontSize(compact?9:11);
    this.inventoryText.setFontSize(compact?9:10);
    this.threatText.setFontSize(compact?9:10);
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
    this.weaponAura.setPosition(this.player.x+20,this.player.y-20).setDepth(this.player.y+340).setFillStyle(this.weapons.current.color,.95);
    this.creatures.forEach(c=>c.update(delta,this.player,this.navigation,this.creatures));
    this.checkPlayerContact();
    if(this.ended)return;
    // Piscar comunica invulnerabilidade temporária sem impedir movimento ou disparos.
    this.player.sprite.setAlpha(this.survival.isInvulnerable(this.time.now)?(Math.floor(this.time.now/115)%2?.43:1):1);
    this.renderRouteDebug();
    this.autoShoot();
    this.updateProjectiles(delta);
    this.collectWeaponPickups();
    this.collectFragments(delta);
    this.spawnTimer+=delta;
    if(!this.bossActive && this.spawnTimer>=this.difficulty.spawnIntervalMs){
      this.spawnTimer=0;
      if(this.creatures.filter(c=>c.alive).length<this.difficulty.maxAlive)
        this.spawnCreature(this.kills+this.spawnSequence);
    }
    this.updateHud();
    this.updateBossHud();
  }
  checkPlayerContact(){
    if(this.survival.isInvulnerable(this.time.now))return;
    const attacker=this.creatures.find(c=>c.alive&&Math.hypot(c.x-this.player.x,c.y-this.player.y)<(c.contactRadius||SETTINGS.contactRadius));
    if(attacker)this.damagePlayer(attacker,1);
  }
  damagePlayer(attacker,damage=1){
    if(this.ended||this.survival.isInvulnerable(this.time.now))return false;
    const result=this.survival.takeHit(this.time.now,damage);
    if(!result.applied)return false;
    this.addFloatingNumber(this.player.x,this.player.y-68,`−${damage}`,'#ff9d8d');
    this.makeImpact(this.player.x,this.player.y-20,0xffab95,24);
    this.cameras.main.shake(120,.002);
    this.player.sprite.setTintFill(0xffb1a1);
    this.time.delayedCall(110,()=>{if(this.player?.sprite?.active)this.player.sprite.clearTint();});
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
    return true;
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
    if(now-this.lastAttack<attackCooldown(this.weapons.active,this.weapons.tier,this.upgrades.levels.cadencia))return;
    const w=this.weapons.current;
    const range=w.range*this.upgrades.rangeMultiplier*(1+.12*(this.weapons.tier-1));
    const target=this.creatures.filter(c=>c.alive&&Math.hypot(c.x-this.player.x,c.y-this.player.y)<range+(c.isBoss?34:0))
      .sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0];
    if(!target)return;
    this.lastAttack=now;
    const shots=createSalvo({weaponId:this.weapons.active,tier:this.weapons.tier,power:this.power,
      from:{x:this.player.x,y:this.player.y-18},target:{x:target.x,y:target.y-8}});
    for(const spec of shots){
      spec.life+=spec.range*(this.upgrades.rangeMultiplier-1)/Math.hypot(spec.vx,spec.vy)*1000;
      let bolt;
      if(spec.type==='lanca')bolt=this.add.rectangle(spec.x,spec.y,29,8,spec.color).setStrokeStyle(2,0xfff7c2).setRotation(spec.angle);
      else if(spec.type==='orbe')bolt=this.add.circle(spec.x,spec.y,11,spec.color).setStrokeStyle(2,0xffedbd);
      else if(spec.type==='duplo')bolt=this.add.circle(spec.x,spec.y,6,spec.color).setStrokeStyle(2,0xd9f8ff);
      else bolt=this.add.star(spec.x,spec.y,4,3,spec.type==='leque'?10:9,spec.color).setStrokeStyle(1.5,0xf8f1ff);
      bolt.setDepth(spec.y+350);
      const glow=this.add.circle(spec.x,spec.y,spec.type==='orbe'?21:16,spec.color,.23).setDepth(spec.y+349);
      this.projectiles.push({...spec,bolt,glow,hitsRemaining:spec.maxHits,hitCreatures:new Set()});
    }
  }
  updateProjectiles(delta){
    const dt=Math.min(delta,40)/1000;
    this.projectiles=this.projectiles.filter(p=>{
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=delta;
      p.bolt.setPosition(p.x,p.y).setDepth(p.y+350);
      if(p.type!=='lanca')p.bolt.rotation+=dt*7;
      p.glow.setPosition(p.x,p.y).setDepth(p.y+349);
      const target=this.creatures.find(c=>c.alive&&!p.hitCreatures.has(c)&&Math.hypot(c.x-p.x,c.y-8-p.y)<p.hitRadius+(c.isBoss?42:7));
      if(target){
        if(p.splashRadius){
          this.makeImpact(p.x,p.y,p.color,p.splashRadius*.55);
          for(const creature of this.creatures){
            if(creature.alive&&Math.hypot(creature.x-p.x,creature.y-p.y)<p.splashRadius+(creature.isBoss?27:0)){
              this.damageCreature(creature,p.damage,p.color);p.hitCreatures.add(creature);
            }
          }
        }else{
          this.damageCreature(target,p.damage,p.color);p.hitCreatures.add(target);
          this.makeImpact(p.x,p.y,p.color,p.type==='lanca'?18:11);
        }
        p.hitsRemaining--;
      }
      if((target&&p.hitsRemaining<=0)||p.life<=0){p.bolt.destroy();p.glow.destroy();return false;}
      return true;
    });
  }
  damageCreature(target,damage,color){
    if(!target.alive)return;
    target.damage(damage);
    if(target.isBoss){
      this.addFloatingNumber(target.x,target.y-115,String(damage),'#'+color.toString(16).padStart(6,'0'));
      this.updateBossHud();
      if(!target.alive)this.completeEra();
      return;
    }
    this.addFloatingNumber(target.x,target.y-58,String(damage),'#'+color.toString(16).padStart(6,'0'));
    if(!target.alive){
      this.kills++;
      const nextDifficulty=difficultyForKills(this.kills);
      if(nextDifficulty.stage!==this.difficulty.stage){
        this.difficulty=nextDifficulty;
        // As criaturas já presentes também se adaptam à nova pressão.
        for(const c of this.creatures){
          if(!c.alive)continue;
          c.speed=c.baseSpeed*nextDifficulty.speedMultiplier;
          c.aggression=nextDifficulty.aggression;
        }
        this.makeImpact(this.player.x,this.player.y-14,0xe9b875,35);
      }
      this.dropFragment(target.x,target.y);
      const reward=weaponRewardForKills(this.kills);
      if(reward)this.spawnWeaponPickup(reward);
      if(this.kills>=SETTINGS.eraKillGoal&&!this.eraGoalAnnounced){
        this.eraGoalAnnounced=true;
        this.beginBossEncounter();
      }
    }
  }
  beginBossEncounter(){
    if(this.bossActive||this.ended)return;
    this.bossActive=true;
    this.spawnTimer=0;
    // Encontro isolado: os monstros comuns deixam a arena sem pontuar abates.
    for(const c of this.creatures)if(c.alive)c.destroy();
    this.creatures=[];
    for(const p of this.projectiles){p.bolt.destroy();p.glow.destroy();}
    this.projectiles=[];
    const p=chooseSpawnPoint({navigation:this.navigation,projection:this.projection,
      player:this.player,sequence:this.spawnSequence+31,minimumDistance:255});
    const point=p||this.navigation.nearestOpenPoint(this.player.x+270,this.player.y-130);
    if(!point){
      // Evita encontro impossível se o mapa não tiver posição acessível.
      this.bossActive=false;this.showMessage('Não foi possível posicionar o chefe.');return;
    }
    this.boss=new CretaceousBoss(this,point.x,point.y);
    this.creatures.push(this.boss);
    this.showMessage('100 ELIMINAÇÕES! O TRICERÁTOPS ANCESTRAL DESPERTOU!');
    this.makeImpact(point.x,point.y-35,0xe9b879,100);
    this.cameras.main.shake(240,.003);
    this.updateBossHud();
  }
  completeEra(){
    if(this.ended)return;
    this.ended=true;
    this.bossActive=false;
    this.bossHud.setVisible(false);
    this.scene.pause();
    this.scene.launch('EraCompleteScene',{
      kills:this.kills,level:this.level,seconds:Math.floor(this.elapsedMs/1000)
    });
  }
  spawnWeaponPickup(reward){
    // Aparecer numa área navegável e com caminho direto até o protagonista.
    const candidates=[];
    for(const radius of [110,145,90,55])for(let step=0;step<16;step++){
      const angle=step*Math.PI/8+(reward.milestone%30)/30;
      const x=this.player.x+Math.cos(angle)*radius,y=this.player.y+Math.sin(angle)*radius;
      if(this.navigation.isOpen(x,y)&&this.navigation.lineClear(this.player.x,this.player.y,x,y))candidates.push({x,y});
    }
    const p=candidates[reward.milestone%candidates.length]||{x:this.player.x,y:this.player.y};
    const color=WEAPONS[reward.id].color;
    const halo=this.add.circle(p.x,p.y-10,22,color,.1).setStrokeStyle(2,color,.85).setDepth(p.y+420);
    const icon=this.add.star(p.x,p.y-26,6,9,18,color).setStrokeStyle(2,0xffffff,.8).setDepth(p.y+440);
    const label=this.add.text(p.x,p.y-62,`${reward.kind==='nova'?'NOVA ARMA':'EVOLUÇÃO'}\n${WEAPONS[reward.id].label} Nv.${reward.tier}`,
      {fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',align:'center',color:'#fff5d8',stroke:'#153029',strokeThickness:4}).setOrigin(.5).setDepth(p.y+500);
    this.tweens.add({targets:icon,y:p.y-38,yoyo:true,repeat:-1,duration:850});
    this.tweens.add({targets:halo,scale:1.25,alpha:.28,yoyo:true,repeat:-1,duration:1050});
    this.weaponPickups.push({x:p.x,y:p.y,reward,halo,icon,label});
    this.showMessage(`Relíquia encontrada! Apanhe ${WEAPONS[reward.id].label}.`);
  }
  collectWeaponPickups(){
    this.weaponPickups=this.weaponPickups.filter(item=>{
      if(Math.hypot(item.x-this.player.x,item.y-this.player.y)>42)return true;
      if(this.weapons.collect(item.reward)){
        this.lastAttack=-Infinity;
        this.makeImpact(item.x,item.y,WEAPONS[item.reward.id].color,31);
        this.showMessage(`${WEAPONS[item.reward.id].label} Nv.${this.weapons.tier} equipada! Q/E troca a arma.`);
      }
      item.halo.destroy();item.icon.destroy();item.label.destroy();
      return false;
    });
  }
  applyUpgrade(id){
    if(!this.upgrades.apply(id))return false;
    if(id==='velocidade')this.player.speed+=26;
    if(id==='cura'){
      const healed=this.survival.heal(2);
      if(healed)this.addFloatingNumber(this.player.x,this.player.y-76,`+${healed}`,'#92f2b2');
      this.creatures.forEach(c=>{
        if(!c.alive)return;
        const dx=c.x-this.player.x,dy=c.y-this.player.y,d=Math.hypot(dx,dy)||1;
        const nx=c.x+dx/d*65,ny=c.y+dy/d*65;
        if(this.navigation.isOpen(nx,ny)&&this.navigation.lineClear(c.x,c.y,nx,ny)){
          c.x=nx;c.y=ny;c.sprite.setPosition(nx,ny);c.shadow.setPosition(nx,ny+10);
        }
      });
    }
    this.power=this.upgrades.damagePower;
    this.level++;
    this.updateHud();
    return true;
  }
  dropFragment(x,y){
    const sprite=this.add.star(x,y-8,4,5,11,0xf1d58f).setStrokeStyle(1,0xffedb2).setDepth(y+250);
    const glow=this.add.circle(x,y-8,15,0xf4d894,.15).setDepth(y+249);
    this.fragments.push({x,y,sprite,glow,age:0});
  }
  collectFragments(delta=16){
    if(this.upgrading)return;
    const radius=magnetRadius(this.upgrades.pickupRadius);
    this.fragments=this.fragments.filter(f=>{
      if(this.upgrading)return true;
      if(!f.sprite.active)return false;
      f.age+=Math.min(delta,40);
      const pull=advanceFragment(f,this.player,delta,radius);
      f.x=pull.x;f.y=pull.y;
      const bob=Math.sin(f.age/165)*4;
      f.sprite.setPosition(f.x,f.y-8+bob).setDepth(f.y+250).setRotation(f.age/1100);
      f.glow.setPosition(f.x,f.y-8+bob).setDepth(f.y+249);
      f.glow.setAlpha(pull.attracted?.28:.14);
      if(pull.collected){
        f.sprite.destroy();f.glow.destroy();this.fragmentCount++;
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
    this.scene.launch('UpgradeScene',{level:this.level,choices:this.upgrades.choices({health:this.survival.health,maxHealth:this.survival.maxHealth})});
  }
}

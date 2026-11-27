import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ERAS,eraAt,rewardForEraKills,prepareNextEraProgress,snapshotRun,restoreRun,isFinalEra} from '../src/systems/EraSystem.js';
import {difficultyForEra,ERA_BALANCE,chooseSpawnPoint} from '../src/systems/DifficultySystem.js';
import {IsoProjection} from '../src/world/IsoProjection.js';
import {NavigationGrid} from '../src/world/NavigationGrid.js';
import {ExtinctionWorld,EXTINCTION_OBSTACLES} from '../src/world/ExtinctionWorld.js';
import {MODERN_SPECIES,createModernArt,modernCreatureTexture,modernPlayerTexture,modernBossTexture} from '../src/art/ModernArt.js';
import {Creature} from '../src/entities/Creature.js';
import {ModernBoss,} from '../src/entities/ModernBoss.js';
import {ModernBossState,MODERN_BOSSES,modernAttackPlan,modernAttackHits} from '../src/systems/ModernBossSystem.js';
import {WeaponState} from '../src/systems/WeaponSystem.js';
import {SurvivalState} from '../src/core/SurvivalState.js';
import {UpgradeState} from '../src/systems/UpgradeSystem.js';

function draw(){const g={active:true};for(const k of ['setDepth','setOrigin','setPosition','setScale','setTexture','setVisible','setStrokeStyle','setTintFill','clearTint','setAlpha','lineStyle','fillStyle','fillEllipse','strokeEllipse','strokeCircle','fillCircle','fillRect','fillRoundedRect','fillTriangle','fillPoints','beginPath','moveTo','lineTo','closePath','fillPath','strokePath','arc','lineBetween','clear'])g[k]=()=>g;g.destroy=()=>{g.active=false;};return g;}
function mockScene(){return {add:{graphics:draw,ellipse:draw,image:draw,circle:draw,text:draw},time:{now:0,delayedCall(){}},tweens:{add(){}},showMessage(){},makeImpact(){},damagePlayer(){},spawnBossMinions(){return 2;}};}
function createWorld(){const scene=mockScene(),projection=new IsoProjection(96,48,28*48,24),world=new ExtinctionWorld(scene,projection);world.create(34,28);const nav=new NavigationGrid({projection,columns:34,rows:28,obstacles:world.obstacles});return {scene,projection,world,nav};}

test('a décima era é o capítulo final com 100 eliminações',()=>{
 assert.equal(ERAS.length,10);assert.equal(eraAt(9).id,'extincao');assert.equal(eraAt(9).number,10);
 assert.equal(eraAt(9).goal,100);assert.equal(ERAS[10],undefined);
 assert.equal(isFinalEra(8),false);assert.equal(isFinalEra(9),true);assert.equal(isFinalEra(10),false);
});

test('na Extinção a pressão supera a da era espacial, sem crescimento indefinido',()=>{
 assert.equal(ERA_BALANCE[9].maxAlive,26);
 for(const kills of [0,10,50,90]){
   const previous=difficultyForEra(kills,8),current=difficultyForEra(kills,9);
   assert.ok(current.maxAlive>previous.maxAlive);assert.ok(current.speedMultiplier>previous.speedMultiplier);
   assert.ok(current.aggression>previous.aggression);assert.ok(current.spawnIntervalMs<=previous.spawnIntervalMs);
   assert.ok(current.maxAlive<=26);
 }
});

test('relíquias da décima era são independentes e respeitam a meta do chefe',()=>{
 for(let kill=10;kill<=90;kill+=10){
   const reward=rewardForEraKills(9,kill);
   assert.equal(reward.milestone,`era10-${kill}`);
   assert.notEqual(reward.milestone,rewardForEraKills(8,kill).milestone);
 }
 assert.equal(rewardForEraKills(9,100),null);
});

test('solo devastado e perímetro têm geometria e colisões próprias',()=>{
 const {world,projection,nav}=createWorld();const center=projection.toScreen(17,14);
 assert.ok(world.obstacles.length>=120);assert.ok(Object.keys(EXTINCTION_OBSTACLES).length>=6);
 assert.ok(world.obstacles.some(o=>o.type==='spire'));assert.ok(world.obstacles.some(o=>o.type==='riftPylon'));
 assert.equal(nav.isOpen(center.x,center.y),true);
 assert.equal(nav.isOpen(projection.toScreen(-1,4).x,projection.toScreen(-1,4).y),false);
});

test('as oito regiões principais têm caminho seguro para o centro',()=>{
 const {nav,projection}=createWorld(),center=projection.toScreen(17,14);
 for(const coords of [[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]){
  const p=projection.toScreen(...coords),start=nav.isOpen(p.x,p.y)?p:nav.nearestOpenPoint(p.x,p.y);
  assert.ok(start,`início obstruído: ${coords}`);
  const path=nav.findPath(start.x,start.y,center.x,center.y);
  assert.ok(path.length,`sem percurso: ${coords}`);
  let last=start;for(const next of path){assert.ok(nav.lineClear(last.x,last.y,next.x,next.y));last=next;}
 }
});

test('inimigos surgem em posições alcançáveis mesmo com as ruínas',()=>{
 const {nav,projection}=createWorld(),player=projection.toScreen(17,14);
 for(let seq=0;seq<12;seq++){
  const p=chooseSpawnPoint({navigation:nav,projection,player,sequence:seq,minimumDistance:225});
  assert.ok(p);assert.ok(nav.isOpen(p.x,p.y));
  assert.ok(nav.findPath(p.x,p.y,player.x,player.y).length);
 }
});

test('três espécies do colapso têm silhuetas próprias, 3 hits e navegação',()=>{
 const {scene,nav,projection}=createWorld(),target=projection.toScreen(17,14),start=projection.toScreen(6,6);
 const mobs=[0,1,2].map(id=>new Creature(scene,start.x,start.y,id,{era:'extincao',speedMultiplier:1.3,aggression:1.6}));
 assert.deepEqual(mobs.map(m=>m.species),MODERN_SPECIES.extincao);
 assert.ok(mobs.every(m=>m.hp===3 && m.texture(false,0).includes('extincao')));
 const shortest=[Infinity,Infinity,Infinity];
 for(let frame=0;frame<2100;frame++){
  scene.time.now+=16;
  for(let i=0;i<mobs.length;i++){
    mobs[i].update(16,target,nav,mobs);
    assert.ok(nav.isOpen(mobs[i].x,mobs[i].y),`criatura ${i} atravessou obstáculos`);
    shortest[i]=Math.min(shortest[i],Math.hypot(mobs[i].x-target.x,mobs[i].y-target.y));
  }
  if(shortest.every(d=>d<50))break;
 }
 assert.ok(shortest.every(d=>d<50),`criaturas presas: ${shortest}`);
});

test('protagonista, criaturas e chefe têm 64 quadros gerados na décima era',()=>{
 const keys=new Set(),ctx={};for(const name of ['clearRect','save','restore','translate','scale','fillRect','beginPath','ellipse','fill','moveTo','lineTo','closePath','stroke'])ctx[name]=()=>{};
 const scene={textures:{exists(k){return keys.has(k);},createCanvas(k){keys.add(k);return {getContext:()=>ctx,refresh(){}};}}};
 createModernArt(scene,'extincao');assert.equal(keys.size,64);
 assert.ok(keys.has(modernPlayerTexture('extincao','up-left',3)));
 assert.ok(keys.has(modernCreatureTexture('extincao','espectro-de-fenda',true,3)));
 assert.ok(keys.has(modernBossTexture('extincao',true,2)));
 createModernArt(scene,'extincao');assert.equal(keys.size,64);
});

test('Coração da Extinção possui três fases e quatro ataques com espaços seguros',()=>{
 const config=MODERN_BOSSES.extincao,state=new ModernBossState('extincao');
 assert.equal(state.phase,1);state.takeDamage(Math.ceil(config.health*.31));assert.equal(state.phase,2);
 state.takeDamage(Math.ceil(config.health*.36));assert.equal(state.phase,3);
 for(const type of config.attacks){
  assert.ok(config.attackNames[type]);const shapes=modernAttackPlan('extincao',type,{x:100,y:100},{x:420,y:100});
  assert.ok(shapes.length>=1);assert.equal(modernAttackHits(shapes,{x:2500,y:2500}),false);
  assert.ok(shapes.every(s=>['line','circle','ring','cone'].includes(s.kind)));
 }
 const voidShapes=modernAttackPlan('extincao','voidring',{x:100,y:100},{x:420,y:100});
 assert.equal(modernAttackHits(voidShapes,{x:100,y:100}),false);
 assert.equal(modernAttackHits(voidShapes,{x:250,y:100}),true);
 state.takeDamage(config.health);assert.equal(state.alive,false);
});

test('a chuva de cinzas cria zonas residuais que desaparecem ao terminar',()=>{
 const sc=mockScene(),boss=new ModernBoss(sc,500,400,'extincao');
 boss.attack={type:'ashfall',start:0,fireAt:1000,shapes:modernAttackPlan('extincao','ashfall',{x:500,y:400},{x:800,y:400}),executed:false};
 sc.time.now=1000;boss.execute(sc.time.now,{x:800,y:400});
 assert.equal(boss.ashZones.length,3);
 sc.time.now=1300;boss.update(16,{x:800,y:400},{isOpen(){return true;},findPath(){return [];}});
 assert.equal(boss.ashZones.length,3);
 sc.time.now=3600;boss.update(16,{x:800,y:400},{isOpen(){return true;},findPath(){return [];}});
 assert.equal(boss.ashZones.length,0);
 boss.destroy();assert.equal(boss.ashZones.length,0);
});

test('recompensa da nona era abre a décima com vida restaurada e recursos mantidos',()=>{
 const g={totalKills:900,level:45,power:8,elapsedMs:600000,fragmentCount:7,
 survival:new SurvivalState(),weapons:new WeaponState(),upgrades:new UpgradeState()};
 g.survival.takeHit(100,3);g.upgrades.apply('velocidade');
 const progress=snapshotRun(g),next=prepareNextEraProgress(progress,5,10);
 assert.equal(next.health,4);assert.equal(next.nextEra,10);
 const after={totalKills:0,level:1,power:1,elapsedMs:0,fragmentCount:0,
 survival:new SurvivalState(),weapons:new WeaponState(),upgrades:new UpgradeState()};
 assert.equal(restoreRun(after,next),true);assert.equal(after.totalKills,900);
 assert.equal(after.survival.health,4);assert.equal(after.upgrades.levels.velocidade,1);
});

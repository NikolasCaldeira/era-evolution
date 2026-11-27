import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERAS, rewardForEraKills, prepareNextEraProgress, FUTURE_ERA_PREVIEW } from '../src/systems/EraSystem.js';
import { difficultyForEra, ERA_BALANCE, chooseSpawnPoint } from '../src/systems/DifficultySystem.js';
import { IsoProjection } from '../src/world/IsoProjection.js';
import { SpaceWorld, SPACE_OBSTACLES } from '../src/world/SpaceWorld.js';
import { NavigationGrid } from '../src/world/NavigationGrid.js';
import { MODERN_SPECIES, createModernArt, modernPlayerTexture, modernBossTexture } from '../src/art/ModernArt.js';
import { Creature } from '../src/entities/Creature.js';
import { ModernBossState, MODERN_BOSSES, modernAttackPlan, modernAttackHits } from '../src/systems/ModernBossSystem.js';

function graphics(){const g={active:true};for(const name of ['setDepth','setOrigin','setScale','setTexture','setPosition','setVisible','setAlpha','setStrokeStyle','setTintFill','clearTint','lineStyle','fillStyle','fillEllipse','strokeEllipse','strokeCircle','fillCircle','fillRect','fillRoundedRect','fillTriangle','fillPoints','lineBetween','beginPath','moveTo','lineTo','closePath','fillPath','strokePath','arc','clear'])g[name]=()=>g;g.destroy=()=>{g.active=false;};return g;}
function scene(){return {add:{graphics,image:graphics,ellipse:graphics,circle:graphics,text:graphics},time:{now:0,delayedCall(){}},tweens:{add(){}},showMessage(){},makeImpact(){},damagePlayer(){},applyCombatSlow(){},spawnBossMinions(){}};}
function world(){const sc=scene(),proj=new IsoProjection(96,48,28*48,24),map=new SpaceWorld(sc,proj);map.create(34,28);const nav=new NavigationGrid({projection:proj,columns:34,rows:28,obstacles:map.obstacles});return {sc,proj,map,nav};}

test('a nona era é jogável e a décima permanece como capítulo futuro',()=>{
  assert.equal(ERAS.length,9);
  assert.equal(ERAS[8].id,'espacial');
  assert.equal(ERAS[8].number,9);
  assert.equal(ERAS[8].goal,100);
  assert.deepEqual(FUTURE_ERA_PREVIEW.map(x=>x.number),[10]);
});

test('escala de pressão da Era 09 respeita a dificuldade progressiva',()=>{
  assert.equal(ERA_BALANCE[8].maxAlive,25);
  for(const kills of [0,10,50,90]){
    const before=difficultyForEra(kills,7),after=difficultyForEra(kills,8);
    assert.ok(after.maxAlive>before.maxAlive);
    assert.ok(after.speedMultiplier>before.speedMultiplier);
    assert.ok(after.aggression>before.aggression);
    assert.ok(after.spawnIntervalMs<=before.spawnIntervalMs);
  }
});

test('relíquias da Era Espacial são únicas a cada 10 eliminações',()=>{
  for(let k=10;k<=90;k+=10){
    const a=rewardForEraKills(8,k);const b=rewardForEraKills(7,k);
    assert.equal(a.milestone,`era09-${k}`);
    assert.notEqual(a.milestone,b.milestone);
    assert.equal(a.kind,'evolucao');
  }
  assert.equal(rewardForEraKills(8,100),null);
});

test('a base lunar tem obstáculos próprios e o centro permanece desobstruído',()=>{
  const {proj,map,nav}=world(),center=proj.toScreen(17,14);
  assert.ok(map.obstacles.length>=110);
  assert.ok(Object.keys(SPACE_OBSTACLES).length>=6);
  assert.ok(map.obstacles.some(x=>x.type==='dome'));
  assert.ok(map.obstacles.some(x=>x.type==='solarPanel'));
  assert.equal(nav.isOpen(center.x,center.y),true);
  assert.equal(nav.isOpen(proj.toScreen(-1,4).x,proj.toScreen(-1,4).y),false);
});

test('oito acessos da base lunar conduzem ao protagonista sem cortar obstáculos',()=>{
  const {proj,nav}=world(),player=proj.toScreen(17,14);
  for(const tile of [[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]){
    const p=proj.toScreen(...tile),from=nav.isOpen(p.x,p.y)?p:nav.nearestOpenPoint(p.x,p.y);
    assert.ok(from,`sem ponto inicial ${tile}`);
    const path=nav.findPath(from.x,from.y,player.x,player.y);
    assert.ok(path.length,`sem acesso a ${tile}`);
    let previous=from;
    for(const step of path){assert.ok(nav.lineClear(previous.x,previous.y,step.x,step.y));previous=step;}
  }
});

test('spawns da Era 09 surgem em locais alcançáveis e afastados do jogador',()=>{
  const {proj,nav}=world(),player=proj.toScreen(17,14);
  for(let sequence=0;sequence<12;sequence++){
    const spawn=chooseSpawnPoint({navigation:nav,projection:proj,player,sequence,minimumDistance:230});
    assert.ok(spawn);
    assert.ok(nav.isOpen(spawn.x,spawn.y));
    assert.ok(Math.hypot(spawn.x-player.x,spawn.y-player.y)>=230);
    assert.ok(nav.findPath(spawn.x,spawn.y,player.x,player.y).length);
  }
});

test('as três criaturas espaciais continuam com 3 acertos e navegação A*',()=>{
  const {sc,proj,nav}=world(),start=proj.toScreen(6,6),target=proj.toScreen(17,14);
  const mobs=Array.from({length:3},(_,i)=>new Creature(sc,start.x,start.y,i,{era:'espacial',speedMultiplier:1.15,aggression:1.2}));
  assert.deepEqual(mobs.map(m=>m.species),MODERN_SPECIES.espacial);
  assert.ok(mobs.every(m=>m.hp===3&&m.texture(false,0).includes('espacial')));
  const closest=[Infinity,Infinity,Infinity];
  for(let frame=0;frame<1900;frame++){
    sc.time.now+=16;
    for(let i=0;i<3;i++){
      mobs[i].update(16,target,nav,mobs);
      assert.ok(nav.isOpen(mobs[i].x,mobs[i].y),`criatura ${i} atravessou obstáculo`);
      closest[i]=Math.min(closest[i],Math.hypot(mobs[i].x-target.x,mobs[i].y-target.y));
    }
    if(closest.every(d=>d<45))break;
  }
  assert.ok(closest.every(d=>d<45),`aproximação insuficiente: ${closest}`);
});

test('astronauta, criaturas e Sentinela Orbital geram 64 sprites com quadros distintos',()=>{
  const keys=new Set(),c={};for(const f of ['clearRect','save','restore','translate','scale','fillRect','beginPath','ellipse','fill','moveTo','lineTo','closePath','stroke'])c[f]=()=>{};
  const scene={textures:{exists(k){return keys.has(k);},createCanvas(k){keys.add(k);return {getContext:()=>c,refresh(){}};}}};
  createModernArt(scene,'espacial');
  assert.equal(keys.size,64);
  assert.ok(keys.has(modernPlayerTexture('espacial','up-left',3)));
  assert.ok(keys.has(modernBossTexture('espacial',true,2)));
  createModernArt(scene,'espacial');assert.equal(keys.size,64);
});

test('chefe espacial tem três fases, quatro ataques com avisos coerentes e vulnerabilidade',()=>{
  const config=MODERN_BOSSES.espacial,state=new ModernBossState('espacial');
  assert.equal(state.phase,1);
  state.takeDamage(Math.ceil(config.health*.31));assert.equal(state.phase,2);
  state.takeDamage(Math.ceil(config.health*.36));assert.equal(state.phase,3);
  for(const type of config.attacks){
    const shapes=modernAttackPlan('espacial',type,{x:100,y:100},{x:400,y:100});
    assert.ok(shapes.length>0);
    assert.ok(config.attackNames[type]);
    assert.ok(!modernAttackHits(shapes,{x:2000,y:2000}));
    for(const shape of shapes)assert.ok(['line','circle','ring'].includes(shape.kind));
  }
  const gravity=modernAttackPlan('espacial','gravitywell',{x:100,y:100},{x:400,y:100});
  assert.ok(modernAttackHits(gravity,{x:400,y:100}));
  const ring=modernAttackPlan('espacial','plasmaring',{x:100,y:100},{x:400,y:100});
  assert.equal(modernAttackHits(ring,{x:100,y:100}),false);
  assert.equal(modernAttackHits(ring,{x:235,y:100}),true);
  state.takeDamage(config.health);assert.equal(state.alive,false);
});

test('transição para a Era da Extinção ainda não abre fase inexistente',()=>{
  const state={health:3,totalKills:900,level:42};
  const next=prepareNextEraProgress(state,5,10);
  assert.equal(next.health,5);assert.equal(next.nextEra,10);assert.equal(ERAS[9],undefined);
});

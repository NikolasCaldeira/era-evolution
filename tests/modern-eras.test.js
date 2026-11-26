import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ERAS,eraAt,prepareNextEraProgress,rewardForEraKills,FUTURE_ERA_PREVIEW} from '../src/systems/EraSystem.js';
import {ERA_BALANCE,difficultyForEra} from '../src/systems/DifficultySystem.js';
import {ModernWorld,MODERN_WORLDS} from '../src/world/ModernWorld.js';
import {IsoProjection} from '../src/world/IsoProjection.js';
import {NavigationGrid} from '../src/world/NavigationGrid.js';
import {MODERN_SPECIES,createModernArt,modernPlayerTexture,modernCreatureTexture,modernBossTexture} from '../src/art/ModernArt.js';
import {Creature} from '../src/entities/Creature.js';
import {MODERN_BOSSES,ModernBossState,modernAttackPlan,modernAttackHits} from '../src/systems/ModernBossSystem.js';
import {ModernBoss} from '../src/entities/ModernBoss.js';

function graphics(){const o={active:true};for(const f of ['setDepth','setPosition','setScale','setOrigin','setVisible','setTexture','setStrokeStyle','setTintFill','clearTint','clear','lineStyle','lineBetween','strokeCircle','fillStyle','fillCircle','fillRect','fillEllipse','fillRoundedRect','fillPoints','fillTriangle','beginPath','moveTo','lineTo','closePath','fillPath','strokePath','arc'])o[f]=()=>o;o.destroy=()=>{o.active=false;return o;};return o;}
function mockScene(){return {add:{graphics,ellipse:graphics,image:graphics,circle:graphics,text:graphics},time:{now:0,delayedCall(){}},tweens:{add(){}},showMessage(){},makeImpact(){},damagePlayer(){},applyCombatSlow(){},spawnBossMinions(){return 2;}};}
function mapFor(era){const s=mockScene(),proj=new IsoProjection(96,48,28*48,24),world=new ModernWorld(s,proj,era);world.create(34,28);const nav=new NavigationGrid({projection:proj,columns:34,rows:28,obstacles:world.obstacles});return {s,proj,world,nav};}

test('ordem cronológica contém oito eras jogáveis e deixa Espacial e Extinção como planejamento',()=>{
  assert.equal(ERAS.length,8);
  assert.deepEqual(ERAS.slice(5).map(e=>e.id),MODERN_WORLDS);
  assert.deepEqual(ERAS.slice(5).map(e=>e.number),[6,7,8]);
  assert.deepEqual(FUTURE_ERA_PREVIEW.map(e=>e.number),[9,10]);
  assert.ok(ERAS.every(e=>e.goal===100));
});

test('balanceamento aumenta entre eras, preservando teto de criaturas e 3 hits por criatura',()=>{
  assert.deepEqual(ERA_BALANCE.slice(5).map(b=>b.maxAlive),[22,23,24]);
  for(const kills of [0,10,40,90]){
    const d=Array.from({length:8},(_,i)=>difficultyForEra(kills,i));
    for(let i=1;i<d.length;i++){
      assert.ok(d[i].speedMultiplier>d[i-1].speedMultiplier);
      assert.ok(d[i].aggression>d[i-1].aggression);
      assert.ok(d[i].maxAlive<=ERA_BALANCE[i].maxAlive);
    }
  }
});

test('recompensas das Eras VI–VIII não colidem entre si nem com capítulos anteriores',()=>{
  const ids=new Set();
  for(let era=0;era<8;era++)for(let kill=10;kill<=90;kill+=10){
    const reward=rewardForEraKills(era,kill);
    assert.ok(reward);
    assert.ok(!ids.has(String(reward.milestone)));
    ids.add(String(reward.milestone));
  }
  assert.equal(ids.size,72);
  const progress={health:2,totalKills:680,weapons:{active:'orbe'},level:35};
  const next=prepareNextEraProgress(progress,5,8);
  assert.equal(next.health,4);assert.equal(next.totalKills,680);assert.equal(progress.health,2);
});

for(const era of MODERN_WORLDS){
  test(`${era}: cenário isométrico com elementos próprios e todas as regiões principais alcançáveis`,()=>{
    const {proj,world,nav}=mapFor(era),center=proj.toScreen(17,14);
    assert.ok(world.obstacles.length>100);
    assert.ok(new Set(world.obstacles.map(o=>o.type)).size>=4);
    assert.ok(nav.isOpen(center.x,center.y),`centro bloqueado em ${era}`);
    for(const [x,y] of [[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]){
      const p=proj.toScreen(x,y);const start=nav.isOpen(p.x,p.y)?p:nav.nearestOpenPoint(p.x,p.y);
      assert.ok(start,`${era} sem ponto em ${x},${y}`);
      const path=nav.findPath(start.x,start.y,center.x,center.y);
      assert.ok(path.length,`${era} sem rota em ${x},${y}`);
      let cursor=start;for(const dest of path){assert.ok(nav.lineClear(cursor.x,cursor.y,dest.x,dest.y));cursor=dest;}
    }
  });
  test(`${era}: três espécies distintas perseguem jogador sem atravessar obstáculo`,()=>{
    const {s,proj,nav}=mapFor(era),p=proj.toScreen(6,6),target=proj.toScreen(17,14);
    const mobs=[0,1,2].map(i=>new Creature(s,p.x,p.y,i,{era,speedMultiplier:1.2,aggression:1.3}));
    assert.deepEqual(mobs.map(m=>m.species),MODERN_SPECIES[era]);
    for(const mob of mobs)assert.equal(mob.hp,3);
    const distances=mobs.map(()=>Infinity);
    for(let frame=0;frame<2200;frame++){
      s.time.now+=16;
      for(let i=0;i<mobs.length;i++){
        mobs[i].update(16,target,nav,mobs);
        assert.ok(nav.isOpen(mobs[i].x,mobs[i].y),`inimigo ${i} atravessou colisão`);
        distances[i]=Math.min(distances[i],Math.hypot(mobs[i].x-target.x,mobs[i].y-target.y));
      }
      if(distances.every(d=>d<45))break;
    }
    assert.ok(distances.every(d=>d<45),`${era}: inimigos presos: ${distances}`);
  });
  test(`${era}: sprites de jogador, criaturas e chefe com oito direções e quadros diferentes`,()=>{
    const keys=new Set();const context={};for(const f of ['clearRect','save','restore','translate','scale','fillRect','beginPath','ellipse','fill','moveTo','lineTo','closePath','stroke'])context[f]=()=>{};
    const s={textures:{exists:k=>keys.has(k),createCanvas(k){keys.add(k);return {getContext:()=>context,refresh(){}};}}};
    createModernArt(s,era);
    assert.equal(keys.size,64);
    assert.ok(keys.has(modernPlayerTexture(era,'up-left',2)));
    assert.ok(keys.has(modernCreatureTexture(era,MODERN_SPECIES[era][2],true,3)));
    assert.ok(keys.has(modernBossTexture(era,false,1)));
    createModernArt(s,era);assert.equal(keys.size,64);
  });
  test(`${era}: chefe tem três fases, ataques avisados e é derrotável`,()=>{
    const s=mockScene(),state=new ModernBossState(era),config=MODERN_BOSSES[era];
    assert.equal(state.phase,1);
    state.takeDamage(Math.ceil(config.health*.31));assert.equal(state.phase,2);
    state.takeDamage(Math.ceil(config.health*.36));assert.equal(state.phase,3);
    for(const type of new Set(config.attacks)){
      assert.ok(config.attackNames[type]);const origin={x:100,y:100},target={x:410,y:100};
      const shapes=modernAttackPlan(era,type,origin,target);
      assert.ok(shapes.length);
      assert.equal(modernAttackHits(shapes,{x:2000,y:2000}),false);
      assert.ok(shapes.every(shape=>['line','circle','ring','cone'].includes(shape.kind)));
    }
    const b=new ModernBoss(s,300,300,era),nav={isOpen:()=>true,findPath:()=>[{x:520,y:300}]};
    s.time.now=2000;b.update(16,{x:520,y:300},nav);
    assert.ok(b.attack&&b.attack.fireAt>s.time.now);
    s.time.now=b.attack.fireAt+1;b.update(16,{x:520,y:300},nav);
    b.damage(config.health);assert.equal(b.alive,false);
  });
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ERAS,rewardForEraKills,prepareNextEraProgress} from '../src/systems/EraSystem.js';
import {WeaponState} from '../src/systems/WeaponSystem.js';
import {IsoProjection} from '../src/world/IsoProjection.js';
import {CivilizationWorld,CIVILIZATION_WORLDS} from '../src/world/CivilizationWorld.js';
import {NavigationGrid} from '../src/world/NavigationGrid.js';
import {Creature} from '../src/entities/Creature.js';
import {CIVILIZATION_SPECIES,civilizationPlayerTexture,civilizationCreatureTexture,createCivilizationArt,civilizationBossTexture} from '../src/art/CivilizationArt.js';
import {CIVILIZATION_BOSSES,CivilizationBossState,withinBossBeam} from '../src/systems/CivilizationBossSystem.js';

const MOCK_GRAPHICS=['fillStyle','lineStyle','fillRect','beginPath','moveTo','lineTo','closePath','fillPath','strokePath','fillEllipse','fillRoundedRect','fillPoints','fillTriangle','fillCircle','lineBetween','setDepth','strokeCircle'];
function mock(){const o={active:true};for(const p of [...MOCK_GRAPHICS,'setPosition','setTexture','setOrigin','setScale','setVisible','setTintFill','clearTint','destroy'])o[p]=()=>o;return o;}
function scene(){return {add:{graphics:mock,ellipse:mock,image:mock,circle:mock},time:{now:0,delayedCall(){}},tweens:{add(){}}};}

for(const [index,era] of [2,3,4].map(i=>[i,ERAS[i]])){
  test(`Era ${index+1} ${era.id}: mundo tem identidade, colisões e rotas acessíveis`,()=>{
    const projection=new IsoProjection(96,48,28*48,24),w=new CivilizationWorld(scene(),projection,era.id);
    w.create(34,28);assert.ok(w.obstacles.length>=115);
    const nav=new NavigationGrid({projection,columns:34,rows:28,obstacles:w.obstacles});
    const center=projection.toScreen(17,14);assert.ok(nav.isOpen(center.x,center.y));
    for(const tile of [[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]){
      const p=projection.toScreen(...tile),start=nav.isOpen(p.x,p.y)?p:nav.nearestOpenPoint(p.x,p.y);
      assert.ok(start,`sem origem ${tile}`);
      const path=nav.findPath(start.x,start.y,center.x,center.y);
      assert.ok(path.length,`sem rota ${tile}`);
      let prev=start;for(const point of path){assert.ok(nav.lineClear(prev.x,prev.y,point.x,point.y));prev=point;}
    }
  });
  test(`Era ${index+1}: espécies e jogador têm texturas próprias`,()=>{
    const creatures=Array.from({length:3},(_,i)=>new Creature(scene(),300,300,i,{era:era.id}));
    assert.deepEqual(creatures.map(c=>c.species),CIVILIZATION_SPECIES[era.id]);
    assert.equal(new Set(creatures.map(c=>c.texture(false,0))).size,3);
    assert.ok(civilizationPlayerTexture(era.id,'up',1).includes(era.id));
    assert.ok(civilizationCreatureTexture(era.id,creatures[0].species,true,1).includes('left'));
  });
  test(`Era ${index+1}: chefe tem três fases e recompensa própria`,()=>{
    const boss=new CivilizationBossState(era.id);
    assert.equal(boss.phase,1);
    boss.takeDamage(Math.ceil(boss.config.health*.3));assert.equal(boss.phase,2);
    boss.takeDamage(Math.ceil(boss.config.health*.36));assert.equal(boss.phase,3);
    assert.ok([...boss.config.attacks,'summon'].includes(boss.chooseAttack(200)));
    const rewards=Array.from({length:9},(_,i)=>rewardForEraKills(index,(i+1)*10));
    assert.equal(new Set(rewards.map(r=>r.milestone)).size,9);
    const weapon=new WeaponState();rewards.forEach(r=>assert.equal(weapon.collect(r),true));
    assert.ok(weapon.tier>=2*index+1);
  });
}

test('a sequência das eras contém cinco capítulos com três mapas novos distintos',()=>{
  assert.deepEqual(ERAS.slice(2).map(e=>e.id),CIVILIZATION_WORLDS);
  assert.deepEqual(Object.keys(CIVILIZATION_BOSSES),CIVILIZATION_WORLDS);
  const species=Object.values(CIVILIZATION_SPECIES).flat();assert.equal(new Set(species).size,9);
});
test('feixe de chefe acerta ao longo da linha e pode ser esquivado',()=>{
  const a={x:0,y:0},b={x:300,y:0};
  assert.ok(withinBossBeam(a,b,{x:180,y:14}));
  assert.equal(withinBossBeam(a,b,{x:180,y:52}),false);
  assert.equal(withinBossBeam(a,b,{x:350,y:0}),false);
});
test('progresso dos capítulos é preservado, com recuperação de duas vidas',()=>{
  const state={health:2,totalKills:310,weapons:{active:'duplo'},level:22};
  const next=prepareNextEraProgress(state,5,4);
  assert.equal(next.totalKills,310);assert.equal(next.health,4);
  assert.equal(next.nextEra,4);assert.equal(state.health,2);
});
test('arte da Era III, IV e V gera sprites para todas as direções e chefes',()=>{
  const keys=new Set(),ctx={};
  for(const name of ['clearRect','save','restore','translate','scale','beginPath','ellipse','fill','moveTo','lineTo','closePath','stroke','quadraticCurveTo'])ctx[name]=()=>{};
  const s={textures:{exists:k=>keys.has(k),createCanvas(k,w,h){keys.add(k);return {getContext:()=>ctx,refresh(){}};}}};
  for(const era of CIVILIZATION_WORLDS){
    const before=keys.size;createCivilizationArt(s,era);
    assert.equal(keys.size-before,32+3*8+8);
    assert.ok(keys.has(civilizationBossTexture(era,false,0)));
    createCivilizationArt(s,era);assert.equal(keys.size-before,64);
  }
});

// Regressão integrada para as ações de chefe sem dependência de canvas ou DOM.
import {CivilizationBoss} from '../src/entities/CivilizationBoss.js';
test('chefes de todas as civilizações executam avisos, ataques e derrota',()=>{
  function shape(){let o={active:true};for(const m of ['setDepth','setPosition','setScale','setOrigin','setTexture','setStrokeStyle','setTintFill','clearTint','clear','lineStyle','lineBetween','strokeCircle','fillStyle','fillCircle','fillPoints','beginPath','arc','strokePath'])o[m]=()=>o;o.destroy=()=>{o.active=false;return o;};return o;}
  for(const era of CIVILIZATION_WORLDS){
    const scene={time:{now:0,delayedCall(){}},creatures:[],tweens:{add(){}},add:{graphics:shape,ellipse:shape,image:shape,text:shape},
      makeImpact(){},showMessage(){},damagePlayer(){},spawnBossMinions(){return 2;}};
    const boss=new CivilizationBoss(scene,300,300,era),target={x:530,y:320};
    const nav={isOpen:()=>true,findPath:()=>[{x:530,y:320}]};
    scene.time.now=2000;boss.update(16,target,nav);
    assert.ok(boss.attack);assert.ok(boss.attack.fireAt>scene.time.now);
    scene.time.now=boss.attack.fireAt+1;boss.update(16,target,nav);
    assert.ok(!boss.attack||boss.attack.executed, 'o ataque deve ser executado e limpo, ou manter a investida ativa');
    boss.damage(boss.config.health);assert.equal(boss.alive,false);
  }
});

test('criaturas das três eras movimentam-se de forma acessível em seu mapa',()=>{
  for(const era of CIVILIZATION_WORLDS){
    const s=scene(),projection=new IsoProjection(96,48,28*48,24),world=new CivilizationWorld(s,projection,era);
    world.create(34,28);
    const nav=new NavigationGrid({projection,columns:34,rows:28,obstacles:world.obstacles});
    const start=projection.toScreen(5,5),end=projection.toScreen(17,14),position=nav.nearestOpenPoint(start.x,start.y);
    const mob=new Creature(s,position.x,position.y,0,{era,speedMultiplier:1.2,aggression:1.1});
    let shortest=Infinity;
    for(let frame=0;frame<1600;frame++){
      s.time.now+=16;mob.update(16,end,nav,[mob]);
      assert.ok(nav.isOpen(mob.x,mob.y),`${era}: invasão de obstáculo`);
      shortest=Math.min(shortest,Math.hypot(mob.x-end.x,mob.y-end.y));
      if(shortest<35)break;
    }
    assert.ok(shortest<35,`${era}: perseguição não alcançou o jogador (${shortest})`);
  }
});

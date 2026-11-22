import {test} from 'node:test';
import assert from 'node:assert/strict';
import {difficultyForKills, behaviorForCreature, chooseSpawnPoint} from '../src/systems/DifficultySystem.js';
import { IsoProjection } from '../src/world/IsoProjection.js';
import { WorldGenerator } from '../src/world/WorldGenerator.js';
import { NavigationGrid } from '../src/world/NavigationGrid.js';
import { Creature } from '../src/entities/Creature.js';

function drawable() {return {active:true,setDepth(){return this},setPosition(){return this},setAlpha(){return this},setScale(){return this},setTexture(){return this},setOrigin(){return this},setVisible(){return this},setTintFill(){return this},clearTint(){return this},destroy(){return this}}}
function graphics(){const o={};for(const k of ['fillStyle','lineStyle','beginPath','moveTo','lineTo','lineBetween','closePath','fillPath','strokePath','fillEllipse','fillRoundedRect','fillRect','fillPoints','fillTriangle','fillCircle','setDepth'])o[k]=()=>o;return o;}
function world(){const scene={add:{graphics,ellipse:drawable,image:drawable,circle:drawable},tweens:{add(){}},time:{now:0,delayedCall(){}}};const projection=new IsoProjection(96,48,28*48,24);const generator=new WorldGenerator(scene,projection);generator.create(34,28);const navigation=new NavigationGrid({projection,columns:34,rows:28,obstacles:generator.obstacles});return {scene,projection,navigation};}

test('pressão aumenta a cada 10 eliminações sem saltos ou retrocessos',()=>{
  let previous=difficultyForKills(0);
  assert.equal(previous.stage,0);
  for(let kills=1;kills<=130;kills++){
    const d=difficultyForKills(kills);
    assert.ok(d.maxAlive>=previous.maxAlive);
    assert.ok(d.speedMultiplier>=previous.speedMultiplier);
    assert.ok(d.spawnIntervalMs<=previous.spawnIntervalMs);
    if(kills<100)assert.equal(d.stage,Math.floor(kills/10));
    previous=d;
  }
});

test('parâmetros iniciais e finais permanecem moderados e limitados',()=>{
  const early=difficultyForKills(0),late=difficultyForKills(100);
  assert.equal(early.maxAlive,8);
  assert.equal(late.maxAlive,17);
  assert.equal(late.stage,9);
  assert.ok(late.spawnIntervalMs>=2350);
  assert.ok(late.speedMultiplier<1.5);
  assert.equal(difficultyForKills(-100).stage,0);
});

test('espécies possuem estilos diferenciados e mantêm três pontos de vida',()=>{
  const {scene,projection}=world();const p=projection.toScreen(17,14);
  assert.deepEqual([0,1,2].map(behaviorForCreature),['investida','resistente','flanqueador']);
  for(let id=0;id<3;id++){
    const mob=new Creature(scene,p.x,p.y,id,{speedMultiplier:1.28,aggression:1.5});
    assert.equal(mob.hp,3);
    assert.equal(mob.behavior,behaviorForCreature(id));
    assert.ok(mob.speed>mob.baseSpeed);
  }
});

test('nascimentos evitam o jogador e têm caminho navegável mesmo próximo de rochas',()=>{
  const {projection,navigation}=world();
  for(const targetTile of [[17,14],[16,11],[12,12],[26,18],[8,10]]){
    const player=projection.toScreen(...targetTile);
    for(let n=0;n<18;n++){
      const p=chooseSpawnPoint({navigation,projection,player,sequence:n,minimumDistance:210});
      assert.ok(p,`nasceu vazio na sequência ${n}`);
      assert.ok(navigation.isOpen(p.x,p.y));
      assert.ok(Math.hypot(player.x-p.x,player.y-p.y)>=210);
      assert.ok(navigation.findPath(p.x,p.y,player.x,player.y).length>0);
    }
  }
});

test('rotas no setor superior alcançam o personagem e respeitam pedras',()=>{
  const {projection,navigation,scene}=world();
  const player=projection.toScreen(17,14);
  for(const tile of [[24,2],[25,3],[22,4],[28,5],[19,7]]){
    let start=projection.toScreen(...tile);
    if(!navigation.isOpen(start.x,start.y))start=navigation.nearestOpenPoint(start.x,start.y);
    assert.ok(start,`sem ponto próximo de ${tile}`);
    const enemy=new Creature(scene,start.x,start.y,2);
    let closest=Infinity;
    for(let i=0;i<3100;i++){
      scene.time.now+=16;
      enemy.update(16,player,navigation,[enemy]);
      assert.ok(navigation.isOpen(enemy.x,enemy.y),`saiu da área no passo ${i}`);
      closest=Math.min(closest,Math.hypot(enemy.x-player.x,enemy.y-player.y));
      if(closest<38)break;
    }
    assert.ok(closest<38,`ficou bloqueado em ${JSON.stringify(tile)}: ${closest}`);
  }
});

test('criatura retoma aproximação após troca de lado do obstáculo',()=>{
  const {projection,navigation,scene}=world();
  const playerA=projection.toScreen(21,8),playerB=projection.toScreen(13,12);
  const start=projection.toScreen(16,6);
  const enemy=new Creature(scene,start.x,start.y,0);
  let closest=Infinity;
  for(let i=0;i<2200;i++){
    scene.time.now+=16;
    const target=i<430?playerA:playerB;
    enemy.update(16,target,navigation,[enemy]);
    assert.ok(navigation.isOpen(enemy.x,enemy.y));
    if(i>=430)closest=Math.min(closest,Math.hypot(enemy.x-playerB.x,enemy.y-playerB.y));
  }
  assert.ok(closest<38,`desvio dinâmico não chegou: ${closest}`);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IsoProjection } from '../src/world/IsoProjection.js';
import { WorldGenerator } from '../src/world/WorldGenerator.js';
import { NavigationGrid } from '../src/world/NavigationGrid.js';
import { Creature } from '../src/entities/Creature.js';

function makeGraphics() {
  const obj = {};
  const methods = ['fillStyle','lineStyle','beginPath','moveTo','lineTo','lineBetween','closePath','fillPath','strokePath','fillEllipse','fillRoundedRect','fillRect','fillPoints','fillTriangle','fillCircle','setDepth'];
  for (const name of methods) obj[name] = () => obj;
  return obj;
}
function makeDrawable() {
  return {
    active:true,
    setDepth(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;},
    setAlpha(){return this;},setScale(){return this;},setTexture(){return this;},setOrigin(){return this;},setVisible(){return this;},setTintFill(){return this;},clearTint(){return this;},add(){return this;},destroy(){this.active=false;return this;}
  };
}
function makeScene() {
  return {
    add: { graphics:makeGraphics, ellipse:makeDrawable, container:makeDrawable, image:makeDrawable, circle:makeDrawable },
    tweens:{ add:() => {} },time:{now:0,delayedCall:()=>{}}
  };
}
function makeWorld() {
  const projection = new IsoProjection(96,48,28*48,24);
  const scene = makeScene();
  const world = new WorldGenerator(scene,projection);
  world.create(34,28);
  const nav = new NavigationGrid({ projection, columns:34, rows:28, obstacles:world.obstacles });
  return {nav,projection,scene,world};
}

function testPath(nav,start,end) {
  const path=nav.findPath(start.x,start.y,end.x,end.y);
  assert.ok(path.length > 0, `Expected a path from ${JSON.stringify(start)} to ${JSON.stringify(end)}`);
  let last=start;
  for(const [i,point] of path.entries()) {
    assert.equal(nav.isOpen(point.x,point.y),true,`waypoint ${i} is blocked`);
    assert.ok(nav.lineClear(last.x,last.y,point.x,point.y),`segment ${i} crosses obstacle`);
    last=point;
  }
  assert.ok(Math.hypot(last.x-end.x,last.y-end.y)<36,`route does not approach target`);
  return path;
}

test('árvore central bloqueia linha reta, mas possui rota alternativa',()=>{
  const {nav,projection} = makeWorld();
  const start=projection.toScreen(8,10), end=projection.toScreen(18,10);
  assert.equal(nav.lineClear(start.x,start.y,end.x,end.y),false);
  const path=testPath(nav,start,end);
  assert.ok(path.length >= 2);
});

test('um monstro consegue desviar e chegar ao jogador sem cruzar obstáculos',()=>{
  const {nav,projection,scene} = makeWorld();
  const start=projection.toScreen(8,10), target=projection.toScreen(18,10);
  const monster=new Creature(scene,start.x,start.y,0);
  let walked=0;
  for (let frame=0; frame<1200; frame++) {
    scene.time.now += 16;
    const previous={x:monster.x,y:monster.y};
    monster.update(16,target,nav,[monster]);
    assert.ok(nav.isOpen(monster.x,monster.y),`monstro atravessou obstáculo em frame ${frame}`);
    walked+=Math.hypot(monster.x-previous.x,monster.y-previous.y);
    if (Math.hypot(monster.x-target.x,monster.y-target.y)<31) break;
  }
  assert.ok(walked>120);
  assert.ok(Math.hypot(monster.x-target.x,monster.y-target.y)<34,`monstro parou em (${monster.x},${monster.y})`);
});

test('diversos pontos de partida alcançam jogador mesmo com obstáculos no caminho',()=>{
  const {nav,projection} = makeWorld();
  const target=projection.toScreen(17,14);
  for(const tile of [[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]){
    const from=projection.toScreen(...tile);
    const spawn = nav.isOpen(from.x,from.y) ? from : nav.nearestOpenPoint(from.x,from.y);
    assert.ok(spawn);
    testPath(nav,spawn,target);
  }
});

test('não é possível traçar rota atravessando a borda da arena',()=>{
  const {nav,projection} = makeWorld();
  const middle=projection.toScreen(17,14), outside=projection.toScreen(-1,4);
  assert.equal(nav.isOpen(outside.x,outside.y),false);
  assert.equal(nav.lineClear(middle.x,middle.y,outside.x,outside.y),false);
});

test('a navegação admite aproximação dos limites superiores, respeitando o perímetro',()=>{
  const {nav,projection} = makeWorld();
  const from=projection.toScreen(15,12);
  const nearTop=projection.toScreen(4,3);
  testPath(nav,from,nearTop);
});

test('criatura recalcula o percurso quando o jogador troca de lado do obstáculo',()=>{
  const {nav,projection,scene}=makeWorld();
  const from=projection.toScreen(7,12);
  const destinations=[projection.toScreen(18,10),projection.toScreen(11,16)];
  const mob=new Creature(scene,from.x,from.y,3);
  let closest=Infinity;
  for(let frame=0;frame<1400;frame++) {
    scene.time.now+=16;
    const target=frame<450?destinations[0]:destinations[1];
    mob.update(16,target,nav,[mob]);
    assert.ok(nav.isOpen(mob.x,mob.y),`criatura em área bloqueada no frame ${frame}`);
    if(frame>=450) closest=Math.min(closest,Math.hypot(mob.x-target.x,mob.y-target.y));
  }
  assert.ok(closest<32,'criatura não se aproximou do novo destino');
});

test('várias criaturas podem circundar obstáculos sem se sobrepor indefinidamente',()=>{
  const {nav,projection,scene}=makeWorld();
  const target=projection.toScreen(18,10);
  const positions=[[8,10],[8,11],[9,10],[7,11]].map(([x,y])=>projection.toScreen(x,y));
  const mobs=positions.map((p,i)=>new Creature(scene,p.x,p.y,i));
  let closeCount=0;
  for (let frame=0;frame<1500;frame++){
    scene.time.now+=16;
    for(const mob of mobs){
      mob.update(16,target,nav,mobs);
      assert.ok(nav.isOpen(mob.x,mob.y));
    }
    closeCount=mobs.filter(m=>Math.hypot(m.x-target.x,m.y-target.y)<38).length;
    if(closeCount===mobs.length)break;
  }
  assert.equal(closeCount,mobs.length,'algumas criaturas ficaram bloqueadas');
});

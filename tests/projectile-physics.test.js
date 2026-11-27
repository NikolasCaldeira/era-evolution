import test from 'node:test';
import assert from 'node:assert/strict';
import {getAimPoint,advanceShot,pointSegmentDistanceSquared,projectileHitsCreature,splashHitsCreature,segmentDistanceSquared} from '../src/systems/ProjectilePhysics.js';
import {createSalvo} from '../src/systems/WeaponSystem.js';
const creature=(x,y,isBoss=false)=>({x,y,isBoss,alive:true});

test('disparo mira no corpo, não exclusivamente nos pés',()=>{
  assert.deepEqual(getAimPoint(creature(200,100)),{x:200,y:73});
  assert.deepEqual(getAimPoint(creature(200,100,true)),{x:200,y:40});
});
test('segmento varrido registra contato com criatura distante',()=>{
  const mob=creature(180,130);
  assert.equal(projectileHitsCreature({x:145,y:96},{x:210,y:96},9,mob),true);
  assert.equal(projectileHitsCreature({x:145,y:15},{x:210,y:15},9,mob),false);
});
test('projétil passando só pelo desenho do monstro também causa dano',()=>{
  assert.equal(projectileHitsCreature({x:50,y:67},{x:150,y:67},7,creature(100,100)),true);
});
test('distância entre segmentos colineares porém separados não é zero',()=>{
  const d=segmentDistanceSquared({x:0,y:0},{x:0,y:0},{x:100,y:0},{x:100,y:20});
  assert.equal(d,10000);
});
test('colisão com chefe tem cápsula maior que criatura comum',()=>{
  assert.equal(projectileHitsCreature({x:0,y:25},{x:200,y:25},6,creature(100,100,true)),true);
  assert.equal(projectileHitsCreature({x:0,y:25},{x:200,y:25},6,creature(100,100)),false);
});
test('impactos em área alcançam a silhueta próxima, não um alvo distante',()=>{
  assert.equal(splashHitsCreature({x:105,y:80},creature(100,100),32),true);
  assert.equal(splashHitsCreature({x:500,y:80},creature(100,100),32),false);
});
test('duração física mantém o alcance a 18, 30 e 60 FPS',()=>{
  const spec=createSalvo({weaponId:'lanca',from:{x:0,y:0},target:{x:600,y:0}})[0];
  for(const frameMs of [16.6667,33.3333,55.5556]){
    const p={x:spec.x,y:spec.y,vx:spec.vx,vy:spec.vy,life:spec.range/Math.hypot(spec.vx,spec.vy)*1000};
    const desired=spec.range;
    let travelled=0;
    while(p.life>0){
      const step=Math.min(frameMs,p.life,24);
      const result=advanceShot(p,step);
      travelled+=result.distance;p.x=result.x;p.y=result.y;p.life=Math.max(0,p.life-step);
    }
    assert.ok(Math.abs(travelled-desired)<.001,`range at ${frameMs} ms was ${travelled}`);
  }
});
test('segmento varrido evita pular inimigos em frames mais lentos',()=>{
  const mob=creature(200,100);
  const start={x:150,y:73},end={x:245,y:73};
  assert.equal(projectileHitsCreature(start,end,8,mob),true);
});
test('distância ponto segmento calcula a projeção correta',()=>{
  assert.equal(pointSegmentDistanceSquared(5,5,0,0,10,0),25);
});

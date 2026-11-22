import {test} from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_CONFIG, BOSS_ATTACKS, BossState } from '../src/systems/BossSystem.js';

test('o chefe começa vivo, com vida própria e três fases previsíveis',()=>{
  const boss = new BossState();
  assert.equal(boss.health,BOSS_CONFIG.maxHealth);
  assert.equal(boss.phase,1);
  boss.takeDamage(30);
  assert.equal(boss.phase,2);
  boss.takeDamage(30);
  assert.equal(boss.phase,3);
  assert.equal(boss.alive,true);
});
test('não acumula dano após o fim e nunca fica com vida negativa',()=>{
  const boss=new BossState(8);
  assert.deepEqual(boss.takeDamage(0),{applied:false,defeated:false,phase:1});
  assert.equal(boss.takeDamage(20).defeated,true);
  assert.equal(boss.health,0);
  assert.equal(boss.takeDamage(5).applied,false);
});
test('anuncia três padrões de ataque, que aceleram nas últimas fases',()=>{
  const boss=new BossState();
  const attacks=Array.from({length:9},()=>boss.nextAttack(190));
  assert.ok(BOSS_ATTACKS.every(a=>attacks.includes(a)));
  const first=boss.windupFor('charge'),cooldown=boss.cooldownMs();
  boss.takeDamage(60);
  assert.equal(boss.phase,3);
  assert.ok(boss.windupFor('charge')<first);
  assert.ok(boss.cooldownMs()<cooldown);
});
test('pisada é priorizada de perto e investida aparece de longe',()=>{
  const b=new BossState();
  assert.equal(b.nextAttack(75),'stomp');
  b.nextAttack(300);
  assert.equal(b.nextAttack(400),'charge');
});

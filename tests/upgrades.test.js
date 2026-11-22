import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UpgradeState, UPGRADES } from '../src/systems/UpgradeSystem.js';

test('melhoria apresenta três opções diferentes',()=>{
  const u=new UpgradeState();
  const options=u.choices({health:3,maxHealth:5,random:()=>.1});
  assert.equal(options.length,3);
  assert.equal(new Set(options).size,3);
  assert.ok(options.every(key=>UPGRADES[key]));
});

test('recuperação não aparece quando vida está cheia',()=>{
  const u=new UpgradeState();
  for(let i=0;i<20;i++) assert.ok(!u.choices({health:5,maxHealth:5,random:()=>i/20}).includes('cura'));
});

test('melhorias alteram alcance, coleta e potência',()=>{
  const u=new UpgradeState();
  assert.equal(u.apply('alcance'),true);
  assert.equal(u.apply('ima'),true);
  assert.equal(u.apply('potencia'),true);
  assert.equal(u.rangeMultiplier,1.17);
  assert.equal(u.pickupRadius,57);
  assert.equal(u.damagePower,2);
});

test('melhoria inválida é rejeitada e tudo reinicia na nova expedição',()=>{
  const u=new UpgradeState();
  assert.equal(u.apply('vitoria-automatica'),false);
  u.apply('potencia');u.apply('velocidade');u.reset();
  assert.equal(u.damagePower,1);
  assert.equal(u.levels.velocidade,0);
});

test('cadência limitada não aparece em sorteio se já atingiu o teto',()=>{
  const u=new UpgradeState();
  for(let i=0;i<4;i++)u.apply('cadencia');
  assert.equal(u.apply('cadencia'),false);
  assert.ok(!u.choices({health:5,maxHealth:5,random:()=>0}).includes('cadencia'));
});

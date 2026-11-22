import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SurvivalState } from '../src/core/SurvivalState.js';
import { SETTINGS } from '../src/core/Settings.js';

test('personagem começa com vida máxima configurada',()=>{
  const s=new SurvivalState({maxHealth:SETTINGS.maxHealth,invulnerabilityMs:SETTINGS.damageInvulnerabilityMs});
  assert.equal(s.health,5);
  assert.equal(s.alive,true);
  assert.equal(s.isInvulnerable(0),false);
});

test('primeiro contato causa dano e ativa invulnerabilidade',()=>{
  const s=new SurvivalState({maxHealth:5,invulnerabilityMs:1250});
  assert.deepEqual(s.takeHit(1000),{applied:true,defeated:false});
  assert.equal(s.health,4);
  assert.equal(s.isInvulnerable(1500),true);
});

test('contatos repetidos durante o escudo não consomem vida',()=>{
  const s=new SurvivalState({maxHealth:5,invulnerabilityMs:1250});
  s.takeHit(1000);
  assert.equal(s.takeHit(1100).applied,false);
  assert.equal(s.takeHit(2249).applied,false);
  assert.equal(s.health,4);
  assert.equal(s.takeHit(2250).applied,true);
  assert.equal(s.health,3);
});

test('morte ocorre exatamente ao atingir zero, sem vida negativa',()=>{
  const s=new SurvivalState({maxHealth:2,invulnerabilityMs:100});
  s.takeHit(10);
  const result=s.takeHit(110);
  assert.deepEqual(result,{applied:true,defeated:true});
  assert.equal(s.health,0);
  assert.equal(s.alive,false);
  assert.equal(s.takeHit(1000).applied,false);
  assert.equal(s.health,0);
});

test('nova expedição reinicia vida e escudo',()=>{
  const s=new SurvivalState({maxHealth:2,invulnerabilityMs:500});
  s.takeHit(20);
  s.takeHit(520);
  assert.equal(s.alive,false);
  s.reset();
  assert.equal(s.health,2);
  assert.equal(s.alive,true);
  assert.equal(s.isInvulnerable(521),false);
});

test('recuperação cura até o máximo, mas não ressuscita',()=>{
  const s=new SurvivalState({maxHealth:5,invulnerabilityMs:0});
  s.takeHit(0);s.takeHit(1);s.takeHit(2);
  assert.equal(s.heal(2),2);
  assert.equal(s.health,4);
  assert.equal(s.heal(5),1);
  assert.equal(s.health,5);
  for(let i=0;i<5;i++)s.takeHit(3+i);
  assert.equal(s.heal(3),0);
  assert.equal(s.health,0);
});

test('valida entradas inválidas sem alterar o estado',()=>{
  const s=new SurvivalState();
  assert.throws(()=>s.takeHit(NaN));
  assert.equal(s.takeHit(1,0).applied,false);
  assert.equal(s.heal(-2),0);
  assert.equal(s.health,5);
  assert.throws(()=>new SurvivalState({maxHealth:0}));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screenAnchor } from '../src/core/ScreenAnchor.js';

test('zoom normal mantém HUD na posição de tela',()=>{
  assert.deepEqual(screenAnchor(1280,720,1,16,16),{x:16,y:16,scale:1});
});

test('HUD não fica cortado ao utilizar zoom aumentado',()=>{
  const p=screenAnchor(1600,900,1.1,16,16);
  assert.ok(p.x>16);
  assert.ok(p.y>16);
  assert.equal(Math.round(800+(p.x-800)*1.1),16);
  assert.equal(Math.round(450+(p.y-450)*1.1),16);
});

test('mensagem central mantém posição com zoom reduzido',()=>{
  const p=screenAnchor(800,600,.72,400,16);
  assert.equal(p.x,400);
  assert.equal(Math.round(300+(p.y-300)*.72),16);
  assert.ok(p.scale>1);
});

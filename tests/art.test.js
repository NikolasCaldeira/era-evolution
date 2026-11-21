import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterArt, playerTexture, creatureTexture, creaturesList } from '../src/art/CharacterArt.js';

function fakeCanvasContext(){
  const ctx={};
  for(const method of ['beginPath','ellipse','fill','stroke','moveTo','lineTo','closePath','bezierCurveTo','clearRect','save','restore','translate','scale']){
    ctx[method]=()=>{};
  }
  return ctx;
}

test('arte do protagonista gera oito direções e quatro fases do caminhar',()=>{
  const names=new Set();
  for(const direction of ['down','down-right','right','up-right','up','up-left','left','down-left']){
    for(let frame=0;frame<4;frame++)names.add(playerTexture(direction,frame));
  }
  assert.equal(names.size,32);
});

test('três criaturas usam silhuetas e nomes de texturas próprios',()=>{
  assert.deepEqual(creaturesList,['compsognato','anquilossauro','pterossauro']);
  const names=new Set();
  for(const species of creaturesList)for(const isLeft of [true,false])for(let frame=0;frame<4;frame++){
    names.add(creatureTexture(species,isLeft,frame));
  }
  assert.equal(names.size,24);
});

test('gerador de arte cria e atualiza todos os 56 quadros sem depender de assets externos',()=>{
  const created=new Set();let refreshed=0;
  const scene={textures:{
    exists:key=>created.has(key),
    createCanvas:(key)=>{
      created.add(key);
      return {getContext:fakeCanvasContext,refresh:()=>{refreshed++;}};
    }
  }};
  createCharacterArt(scene);
  assert.equal(created.size,56);
  assert.equal(refreshed,56);
  // Recomeçar a cena não deve repetir texturas nem lançar erro.
  createCharacterArt(scene);
  assert.equal(created.size,56);
  assert.equal(refreshed,56);
});

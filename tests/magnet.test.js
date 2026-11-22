import {test} from 'node:test';
import assert from 'node:assert/strict';
import { magnetRadius, advanceFragment, FRAGMENT_COLLECT_DISTANCE } from '../src/systems/MagnetSystem.js';
import { UpgradeState } from '../src/systems/UpgradeSystem.js';

const player={x:200,y:200};
test('a atração cresce junto com a melhoria do ímã',()=>{
  const upgrades=new UpgradeState();
  const base=magnetRadius(upgrades.pickupRadius);
  upgrades.apply('ima');
  const stronger=magnetRadius(upgrades.pickupRadius);
  assert.ok(stronger>base);
  const far={x:200+base+4,y:200};
  assert.equal(advanceFragment(far,player,16,base).attracted,false);
  assert.equal(advanceFragment(far,player,16,stronger).attracted,true);
});
test('fragmentos distantes permanecem imóveis e não são recolhidos sem contato',()=>{
  const original={x:10,y:10};
  const result=advanceFragment(original,player,16,70);
  assert.deepEqual({x:result.x,y:result.y},original);
  assert.equal(result.collected,false);
});
test('fragmentos atraídos voam progressivamente até o personagem',()=>{
  let fragment={x:280,y:200};
  let steps=0;
  while(steps<120){
    const next=advanceFragment(fragment,player,16,120);
    assert.ok(next.x<=fragment.x);
    fragment=next;
    steps++;
    if(next.collected)break;
  }
  assert.ok(steps>1,'não deve teleportar diretamente');
  assert.ok(steps<120,'fragmento deve chegar ao personagem');
  assert.ok(Math.hypot(fragment.x-player.x,fragment.y-player.y)<=FRAGMENT_COLLECT_DISTANCE);
});
test('movimento respeita o limite de dt e não ultrapassa o personagem',()=>{
  const near=advanceFragment({x:226,y:200},player,1000,100);
  assert.ok(near.x>=200 && near.x<226);
  assert.equal(near.collected,true);
});

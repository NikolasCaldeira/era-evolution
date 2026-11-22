import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FROST_TRAIL,FrostTrailState} from '../src/systems/FrostTrailSystem.js';
import {DASH,DashState,threatForEra,threatHits} from '../src/systems/ActiveCombatSystem.js';
import {difficultyForEra} from '../src/systems/DifficultySystem.js';

test('rastro glacial dura vários segundos e desencadeia stun -> slow -> recuperação',()=>{
  assert.ok(FROST_TRAIL.durationMs>=5500);
  const frost=new FrostTrailState();assert.equal(frost.touch('patch-1',1000),true);
  assert.equal(frost.phase(1001),'stun');assert.equal(frost.movementMultiplier(1100),0);
  const afterStun=1000+FROST_TRAIL.stunMs;
  assert.equal(frost.phase(afterStun),'recuperando');
  const start=frost.movementMultiplier(afterStun);
  const mid=frost.movementMultiplier(afterStun+FROST_TRAIL.slowMs/2);
  const end=frost.movementMultiplier(afterStun+FROST_TRAIL.slowMs);
  assert.ok(start>0&&start<mid&&mid<end);assert.equal(end,1);
});
test('o jogador não fica preso por retrigger infinito enquanto permanece no mesmo patch',()=>{
  const f=new FrostTrailState();assert.equal(f.touch(5,100),true);
  assert.equal(f.touch(5,101),false);assert.equal(f.touch(5,4000),false);
  assert.equal(f.movementMultiplier(100+FROST_TRAIL.stunMs+FROST_TRAIL.slowMs+1),1);
  assert.equal(f.touch(6,4500),true);
  f.reset();assert.equal(f.touch(5,5200),true);
});
test('esquiva tem recarga e é reinicializada por partida',()=>{
  const state=new DashState();assert.equal(state.use(100),true);
  assert.equal(state.use(101),false);assert.ok(state.remaining(101)>0);
  assert.equal(state.canUse(100+DASH.cooldownMs),true);
  assert.equal(new DashState().canUse(0),true);
});
test('ataques de área obrigam movimento ou esquiva nas Eras III a V',()=>{
  assert.equal(threatForEra(0,0),null);assert.equal(threatForEra(1,0),null);
  assert.ok(threatForEra(0,5).warningMs>900);assert.ok(threatForEra(1,9).intervalMs>9000);
  for(const era of [2,3,4]){
    const rules=threatForEra(era,6);
    assert.ok(rules.warningMs>=800);
    assert.ok(rules.intervalMs>rules.warningMs);
    assert.equal(threatHits({x:100,y:90},{x:100,y:90},rules.radius),true);
    assert.equal(threatHits({x:100,y:90},{x:100+rules.radius+10,y:90},rules.radius),false);
  }
  assert.ok(threatForEra(4,8).intervalMs<threatForEra(2,8).intervalMs);
});
test('pressão por era cresce sobre o mesmo estágio e preserva os 10 estágios',()=>{
  for(const kills of [0,10,50,90]){
    const all=Array.from({length:5},(_,i)=>difficultyForEra(kills,i));
    for(let i=1;i<all.length;i++){
      assert.ok(all[i].speedMultiplier>all[i-1].speedMultiplier);
      assert.ok(all[i].maxAlive>=all[i-1].maxAlive);
      assert.ok(all[i].spawnIntervalMs<=all[i-1].spawnIntervalMs);
      assert.equal(all[i].stage,all[0].stage);
    }
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS, WeaponState, weaponRewardForKills, createSalvo, attackCooldown } from '../src/systems/WeaponSystem.js';

const origin={x:200,y:150};
const right={x:400,y:150};
const up={x:200,y:0};

test('arma inicial é exclusiva e reinicia sem progresso permanente',()=>{
  const s=new WeaponState();
  assert.deepEqual(s.unlocked,['artefato']);
  assert.equal(s.active,'artefato');
  s.collect(weaponRewardForKills(10));
  s.reset();
  assert.deepEqual(s.unlocked,['artefato']);
  assert.deepEqual(s.levels,{artefato:1});
});

test('um prêmio de arma aparece a cada dez eliminações até 90',()=>{
  for(let kill=1;kill<=100;kill++){
    const r=weaponRewardForKills(kill);
    if(kill%10===0 && kill<100){assert.equal(r.milestone,kill);assert.ok(WEAPONS[r.id]);}
    else assert.equal(r,null);
  }
});

test('quatro novos modelos são desbloqueados antes das versões aprimoradas',()=>{
  const s=new WeaponState();
  for(let kill=10;kill<=40;kill+=10){const r=weaponRewardForKills(kill);assert.equal(r.kind,'nova');assert.ok(s.collect(r));}
  assert.deepEqual(s.unlocked,['artefato','duplo','lanca','leque','orbe']);
  for(let kill=50;kill<=90;kill+=10){const r=weaponRewardForKills(kill);assert.equal(r.kind,'evolucao');assert.ok(s.collect(r));}
  assert.equal(s.levels.artefato,2);
  assert.equal(s.levels.orbe,2);
  assert.equal(s.unlocked.length,5);
});

test('não é possível recolher a mesma relíquia duas vezes',()=>{
  const s=new WeaponState();const r=weaponRewardForKills(10);
  assert.equal(s.collect(r),true);assert.equal(s.collect(r),false);
  assert.equal(s.unlocked.length,2);
});

test('seleção direta e troca Q/E ciclam apenas entre armas desbloqueadas',()=>{
  const s=new WeaponState();
  assert.equal(s.select('orbe'),false);
  s.collect(weaponRewardForKills(10));s.collect(weaponRewardForKills(20));
  assert.equal(s.cycle(1),'artefato');
  assert.equal(s.cycle(-1),'lanca');
  assert.equal(s.select('duplo'),true);
});

test('artefato dispara somente um projétil na direção do alvo',()=>{
  const result=createSalvo({from:origin,target:right});
  assert.equal(result.length,1);
  assert.equal(result[0].type,'artefato');
  assert.ok(result[0].vx>0);
  assert.ok(Math.abs(result[0].vy)<1e-8);
  assert.equal(result[0].damage,1);
});

test('gêmeos atiram dois cristais com ângulos diferentes',()=>{
  const results=createSalvo({weaponId:'duplo',from:origin,target:right});
  assert.equal(results.length,2);
  assert.ok(results[0].vy<0&&results[1].vy>0);
});

test('lança atravessa três criaturas e evolui para quatro',()=>{
  const base=createSalvo({weaponId:'lanca',from:origin,target:up,tier:1})[0];
  const upgraded=createSalvo({weaponId:'lanca',from:origin,target:up,tier:2})[0];
  assert.equal(base.maxHits,3);assert.equal(upgraded.maxHits,4);
  assert.ok(base.vy<0);
});

test('leque distribui três projéteis em torno da direção principal',()=>{
  const shots=createSalvo({weaponId:'leque',from:origin,target:right});
  assert.equal(shots.length,3);
  assert.ok(shots[0].angle<shots[1].angle&&shots[1].angle<shots[2].angle);
});

test('orbe tem impacto em área com raio aumentado no nível 2',()=>{
  const base=createSalvo({weaponId:'orbe',from:origin,target:right,tier:1})[0];
  const upgraded=createSalvo({weaponId:'orbe',from:origin,target:right,tier:2})[0];
  assert.equal(base.splashRadius,42);
  assert.ok(upgraded.splashRadius>base.splashRadius);
});

test('projéteis continuam a mirar corretamente em 360 graus',()=>{
  for(const target of [{x:100,y:150},{x:300,y:150},{x:200,y:20},{x:200,y:350},{x:0,y:0}]){
    const shot=createSalvo({weaponId:'lanca',from:origin,target})[0];
    const dot=(shot.vx*(target.x-origin.x)+shot.vy*(target.y-origin.y));
    assert.ok(dot>0);
  }
});

test('evoluções reduzem cadência e aumentam dano sem valores fracionários',()=>{
  assert.ok(attackCooldown('leque',2,2)<attackCooldown('leque',1,0));
  assert.ok(attackCooldown('leque',9,99)>=230);
  assert.equal(createSalvo({from:origin,target:right,power:3})[0].damage,1);
  assert.equal(createSalvo({from:origin,target:right,power:4})[0].damage,2);
});

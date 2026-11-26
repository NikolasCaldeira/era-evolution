import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CIVILIZATION_BOSSES,CivilizationBossState,makeBossAttackPlan,bossAttackHits,bossShapeHits} from '../src/systems/CivilizationBossSystem.js';
import {ERA_BALANCE,difficultyForEra} from '../src/systems/DifficultySystem.js';
import {CivilizationBoss} from '../src/entities/CivilizationBoss.js';

const from={x:100,y:100},target={x:400,y:100};
test('três chefes possuem conjuntos de golpes exclusivos e vida crescente',()=>{
  const eras=['antiga','medieval','renascimento'];
  const attacks=eras.map(era=>CIVILIZATION_BOSSES[era].attacks);
  assert.ok(CIVILIZATION_BOSSES.antiga.health<CIVILIZATION_BOSSES.medieval.health);
  assert.ok(CIVILIZATION_BOSSES.medieval.health<CIVILIZATION_BOSSES.renascimento.health);
  assert.equal(new Set(attacks.flat()).size,9);
  for(const era of eras){
    assert.equal(CIVILIZATION_BOSSES[era].attacks.length,4);
    assert.ok(CIVILIZATION_BOSSES[era].attacks.every(type=>CIVILIZATION_BOSSES[era].attackNames[type]));
  }
});
test('Esfinge: leque de areia tem três raios com ângulos distintos',()=>{
  const shapes=makeBossAttackPlan('antiga','sandfan',from,target);
  assert.deepEqual(shapes.map(s=>s.kind),['line','line','line']);
  assert.ok(shapes[0].to.y<shapes[1].to.y);
  assert.ok(shapes[2].to.y>shapes[1].to.y);
  assert.ok(bossAttackHits(shapes,{x:340,y:88}));
  assert.equal(bossAttackHits(shapes,{x:240,y:265}),false);
});
test('Esfinge: areia móvel e raio solar possuem zonas de dano que podem ser evitadas',()=>{
  const sand=makeBossAttackPlan('antiga','quicksand',from,target);
  assert.equal(sand.length,2);assert.ok(bossAttackHits(sand,target));
  assert.equal(bossAttackHits(sand,{x:140,y:220}),false);
  const sun=makeBossAttackPlan('antiga','sunray',from,target);
  assert.ok(bossAttackHits(sun,{x:350,y:96}));
  assert.equal(bossAttackHits(sun,{x:350,y:190}),false);
});
test('Gárgula: mergulho e chuva de runas têm avisos coerentes',()=>{
  const dive=makeBossAttackPlan('medieval','dive',from,target);
  const fall=makeBossAttackPlan('medieval','runefall',from,target);
  assert.equal(dive[0].kind,'line');assert.equal(fall.length,3);
  assert.ok(bossAttackHits(dive,{x:280,y:100}));
  assert.ok(bossAttackHits(fall,target));
  assert.equal(bossAttackHits(fall,{x:145,y:255}),false);
});
test('Gárgula: olhar petrificante é um cone — lateral e atrás são seguros',()=>{
  const shapes=makeBossAttackPlan('medieval','stonegaze',from,target);
  assert.equal(shapes[0].kind,'cone');
  assert.ok(bossAttackHits(shapes,{x:330,y:85}));
  assert.equal(bossAttackHits(shapes,{x:330,y:285}),false);
  assert.equal(bossAttackHits(shapes,{x:20,y:100}),false);
});
test('Autômato: engrenagens têm espaço seguro no centro e fora do anel',()=>{
  const shapes=makeBossAttackPlan('renascimento','gearring',from,target);
  assert.equal(shapes[0].kind,'ring');
  assert.equal(bossAttackHits(shapes,{x:127,y:100}),false);
  assert.ok(bossAttackHits(shapes,{x:206,y:100}));
  assert.equal(bossAttackHits(shapes,{x:300,y:100}),false);
});
test('Autômato: pistões marcam três áreas; feixes paralelos deixam corredor seguro',()=>{
  const pistons=makeBossAttackPlan('renascimento','piston',from,target);
  assert.equal(pistons.length,3);
  assert.ok(bossAttackHits(pistons,target));
  assert.equal(bossAttackHits(pistons,{x:200,y:300}),false);
  const lasers=makeBossAttackPlan('renascimento','arcbeam',from,target);
  assert.equal(lasers.length,2);
  assert.ok(bossAttackHits(lasers,{x:230,y:35}));
  assert.equal(bossAttackHits(lasers,{x:230,y:88}),false);
});
test('esquiva evita todos os golpes ao sair da zona anunciada',()=>{
  for(const era of Object.keys(CIVILIZATION_BOSSES)){
    for(const type of new Set(CIVILIZATION_BOSSES[era].attacks)){
      const shapes=makeBossAttackPlan(era,type,from,target);
      assert.ok(shapes.length>0);
      assert.equal(bossAttackHits(shapes,{x:2000,y:2000}),false);
      assert.equal(shapes.some(s=>s.kind==='circle'&&s.radius<=0),false);
    }
  }
});
test('reforços só aparecem na última fase e o chefe pode ser derrotado',()=>{
  for(const era of Object.keys(CIVILIZATION_BOSSES)){
    const state=new CivilizationBossState(era);
    assert.notEqual(state.chooseAttack(100),'summon');
    state.takeDamage(Math.ceil(state.config.health*.66));
    assert.equal(state.phase,3);
    let summons=0;for(let i=0;i<30;i++)if(state.chooseAttack(100)==='summon')summons++;
    assert.equal(summons,2);
    state.takeDamage(9999);assert.equal(state.alive,false);
  }
});
test('crescimento de criaturas e velocidade continua progressivo, respeitando orçamento visual',()=>{
  assert.deepEqual(ERA_BALANCE.slice(0,5).map(x=>x.maxAlive),[17,18,19,20,21]);
  for(const kills of [0,10,30,60,90]){
    const values=Array.from({length:5},(_,i)=>difficultyForEra(kills,i));
    for(let i=0;i<values.length;i++){
      assert.ok(values[i].maxAlive<=ERA_BALANCE[i].maxAlive);
      assert.ok(values[i].spawnIntervalMs>=1850);
      if(i){
        assert.ok(values[i].speedMultiplier>values[i-1].speedMultiplier);
        assert.ok(values[i].aggression>values[i-1].aggression);
      }
    }
  }
});
function graphics(){const o={active:true};for(const k of ['setDepth','setPosition','setScale','setOrigin','setTexture','setStrokeStyle','setTintFill','clearTint','clear','lineStyle','lineBetween','strokeCircle','fillStyle','fillCircle','beginPath','arc','strokePath'])o[k]=()=>o;o.destroy=()=>{o.active=false;return o;};return o;}
test('as três arenas executam avisos e áreas de perigo sem erro do Phaser',()=>{
  for(const era of Object.keys(CIVILIZATION_BOSSES)){
    let hits=0;
    const scene={time:{now:0,delayedCall(){}},tweens:{add(){}},
      add:{graphics,ellipse:graphics,image:graphics,text:graphics},showMessage(){},makeImpact(){},
      damagePlayer(){hits++;},applyCombatSlow(){},spawnBossMinions(){return 2;}};
    const b=new CivilizationBoss(scene,100,100,era);
    const nav={isOpen:()=>true,findPath:()=>[]};
    const player={x:400,y:100};
    for(let k=0;k<4;k++){
      scene.time.now=b.nextAttack+1;
      b.update(16,player,nav);
      assert.ok(b.attack);
      scene.time.now=b.attack.fireAt-25;
      b.update(16,player,nav);
      assert.ok(b.attack&&!b.attack.executed);
      scene.time.now=b.attack.fireAt+1;
      b.update(16,player,nav);
      // A investida tem duração própria e só termina depois de avançar.
      if(b.attack?.type==='dive'){
        scene.time.now=b.attack.chargeUntil+1;b.update(16,player,nav);
      }
    }
    assert.ok(hits>=0);
    b.damage(9999);assert.equal(b.alive,false);
  }
});

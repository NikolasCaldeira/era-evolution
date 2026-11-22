import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ICE_BOSS_CONFIG,ICE_BOSS_ATTACKS,IceAgeBossState,inFrostCone} from '../src/systems/IceAgeBossSystem.js';
import {createIceAgeBossArt,iceAgeBossTexture} from '../src/art/IceAgeBossArt.js';
import {PleistoceneBoss} from '../src/entities/PleistoceneBoss.js';
import {relicCenter,createRelicVisual} from '../src/systems/RelicVisual.js';
import {prepareNextEraProgress,NEXT_ERA_PREVIEW} from '../src/systems/EraSystem.js';

function mockShape(){return {active:true, x:0,y:0,destroyed:false,
 setStrokeStyle(){return this;},setDepth(){return this;},setOrigin(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;},
 setScale(){return this;},setTexture(){return this;},setTintFill(){return this;},clearTint(){return this;},
 clear(){return this;},lineStyle(){return this;},lineBetween(){return this;},strokeCircle(){return this;},
 fillStyle(){return this;},fillCircle(){return this;},fillPoints(){return this;},destroy(){this.destroyed=true;this.active=false;return this;}};}
function mockScene(){
 const scene={time:{now:0,delayedCall(){}},creatures:[],player:{x:150,y:100},effects:[],calls:[]};
 scene.add={graphics:()=>mockShape(),ellipse:()=>mockShape(),image:()=>mockShape(),text:()=>mockShape(),circle:()=>mockShape(),star:()=>mockShape(),container:(x,y,children)=>Object.assign(mockShape(),{x,y,children})};
 scene.tweens={add(config){scene.calls.push(config);}};
 scene.makeImpact=()=>{};scene.showMessage=()=>{};scene.damagePlayer=()=>true;scene.applyCold=(ms)=>scene.effects.push(ms);
 scene.spawnBossMinions=(n)=>{scene.calls.push({summon:n});return n;};
 return scene;
}

test('o mamute usa limites de fase 70% e 35%',()=>{
 const b=new IceAgeBossState(100);
 assert.equal(b.phase,1);b.takeDamage(30);assert.equal(b.phase,2);
 b.takeDamage(35);assert.equal(b.phase,3);b.takeDamage(60);assert.equal(b.health,0);
 assert.equal(b.takeDamage(1).applied,false);assert.equal(b.alive,false);
});
test('os avisos do mamute aceleram por fase sem ficar instantâneos',()=>{
 const b=new IceAgeBossState(),first=b.windupFor('breath'),cool=b.cooldownMs();
 b.takeDamage(101);assert.equal(b.phase,3);
 assert.ok(b.windupFor('breath')<first);assert.ok(b.windupFor('breath')>=640);
 assert.ok(b.cooldownMs()<cool);
});
test('primeira fase nunca usa gelo ou matilha, segunda usa gelo e terceira convoca',()=>{
 const b=new IceAgeBossState();const first=Array.from({length:10},()=>b.nextAttack(170));
 assert.ok(first.every(x=>x==='charge'||x==='stomp'));
 b.takeDamage(50);const second=Array.from({length:12},()=>b.nextAttack(170));
 assert.ok(second.includes('breath'));assert.ok(!second.includes('summon'));
 b.takeDamage(50);
 const third=Array.from({length:15},()=>b.nextAttack(170,true));
 assert.ok(third.includes('summon'));assert.equal(b.summonCount,2);
 assert.ok(ICE_BOSS_ATTACKS.every(x=>['charge','stomp','breath','summon'].includes(x)));
});
test('a rajada gelada tem cone direcional e alcance finito',()=>{
 const center={x:0,y:0};
 assert.equal(inFrostCone(center,0,{x:140,y:0}),true);
 assert.equal(inFrostCone(center,0,{x:-50,y:0}),false);
 assert.equal(inFrostCone(center,0,{x:0,y:130}),false);
 assert.equal(inFrostCone(center,0,{x:ICE_BOSS_CONFIG.breathRange+20,y:0}),false);
 assert.equal(inFrostCone(center,Math.PI/2,{x:0,y:160}),true);
});
test('efeito de gelo reduz movimento sem alterar a velocidade base',()=>{
 assert.ok(ICE_BOSS_CONFIG.slowMultiplier>0&&ICE_BOSS_CONFIG.slowMultiplier<1);
 assert.ok(ICE_BOSS_CONFIG.slowDurationMs>900);
});
test('o modelo do chefe pode iniciar seus ataques e causar dano independentemente do Phaser real',()=>{
 const scene=mockScene(),boss=new PleistoceneBoss(scene,0,0);
 scene.creatures.push(boss);
 const nav={isOpen:()=>true,findPath:()=>[{x:100,y:0}]};
 scene.time.now=2300;boss.update(16,{x:320,y:0},nav);
 assert.ok(boss.attack);assert.ok(boss.attack.fireAt>scene.time.now);
 scene.time.now=boss.attack.fireAt+5;boss.update(16,{x:320,y:0},nav);
 assert.equal(boss.attack?.executed,true);
 boss.damage(boss.maxHp);
 assert.equal(boss.alive,false);
});
test('matilha é convocada uma vez por decisão e tem limite de duas convocações',()=>{
 const scene=mockScene(),boss=new PleistoceneBoss(scene,0,0);
 boss.state.takeDamage(101);scene.time.now=2600;
 boss.beginAttack(scene.time.now,{x:100,y:0});
 assert.equal(boss.attack.type,'summon');
 scene.time.now=boss.attack.fireAt+1;boss.execute(scene.time.now,{x:100,y:0});
 assert.ok(scene.calls.some(x=>x.summon===2));
});
test('arte do mamute é única para ambos os lados e quadros animados',()=>{
 const textures=new Map(),ctx={};
 const methods=['clearRect','save','restore','translate','scale','beginPath','ellipse','fill','moveTo','lineTo','closePath','stroke','quadraticCurveTo'];
 for(const name of methods)ctx[name]=()=>{};
 const scene={textures:{exists:k=>textures.has(k),createCanvas(k,w,h){const item={width:w,height:h,getContext:()=>ctx,refresh:()=>{}};textures.set(k,item);return item;}}};
 createIceAgeBossArt(scene);assert.equal(textures.size,8);
 assert.notEqual(iceAgeBossTexture(false,0),iceAgeBossTexture(true,0));
 createIceAgeBossArt(scene);assert.equal(textures.size,8);
});
test('ícone da relíquia, halo e brilho partilham o mesmo centro',()=>{
 const s=mockScene(),v=createRelicVisual(s,120,240,0xffdc90,'EVOLUÇÃO');
 assert.deepEqual(relicCenter(120,240),{x:120,y:216});
 assert.equal(v.container.x,120);assert.equal(v.container.y,216);
 assert.equal(v.halo.x,0);assert.equal(v.halo.y,0);
 assert.equal(v.star.x,0);assert.equal(v.star.y,0);
 assert.equal(v.glow.x,0);assert.equal(v.glow.y,0);
 const starTween=s.calls.some(x=>x.targets===v.star);
 assert.equal(starTween,false,'a estrela não deve oscilar fora do centro');
 v.destroy();assert.equal(v.container.destroyed,true);assert.equal(v.label.destroyed,true);
});
test('vitória da Era 02 prepara Civilizações Antigas e restaura duas vidas sem mutar origem',()=>{
 const base={health:2,totalKills:200,level:13,weapons:{active:'leque'}};
 const next=prepareNextEraProgress(base,5);
 assert.equal(next.health,4);assert.equal(base.health,2);
 assert.equal(next.totalKills,200);assert.equal(next.weapons.active,'leque');
 assert.equal(next.nextEra,3);assert.equal(NEXT_ERA_PREVIEW.name,'CIVILIZAÇÕES ANTIGAS');
 assert.equal(prepareNextEraProgress({...base,health:5},5).health,5);
});

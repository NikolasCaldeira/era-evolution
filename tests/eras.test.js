import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ERAS,eraAt,snapshotRun,restoreRun,pleistoceneRewardForKills} from '../src/systems/EraSystem.js';
import {WeaponState,weaponRewardForKills} from '../src/systems/WeaponSystem.js';
import {UpgradeState} from '../src/systems/UpgradeSystem.js';
import {SurvivalState} from '../src/core/SurvivalState.js';
import {IsoProjection} from '../src/world/IsoProjection.js';
import {PleistoceneWorld} from '../src/world/PleistoceneWorld.js';
import {NavigationGrid} from '../src/world/NavigationGrid.js';
import {PLEISTOCENE_SPECIES,pleistocenePlayerTexture,pleistoceneCreatureTexture} from '../src/art/PleistoceneArt.js';
import {Creature} from '../src/entities/Creature.js';

function makeScene(){
 const graphics=()=>{const g={};for(const method of ['fillStyle','lineStyle','fillRect','beginPath','moveTo','lineTo','closePath','fillPath','strokePath','fillEllipse','fillRoundedRect','fillPoints','fillTriangle','fillCircle','lineBetween','setDepth','strokeCircle'])g[method]=()=>g;return g;};
 const item=()=>({active:true,setPosition(){return this;},setDepth(){return this;},setVisible(){return this;},setTexture(){return this;},setScale(){return this;},setOrigin(){return this;},setTintFill(){return this;},destroy(){return this;}});
 return {add:{graphics,ellipse:item,image:item,circle:item},time:{now:0,delayedCall(){}},tweens:{add(){} }};
}
function makeEraWorld(){
 const projection=new IsoProjection(96,48,28*48,24),world=new PleistoceneWorld(makeScene(),projection);
 world.create(34,28);
 return {projection,world,nav:new NavigationGrid({projection,columns:34,rows:28,obstacles:world.obstacles})};
}
function makeGame(){return {totalKills:100,level:15,power:4,elapsedMs:490000,fragmentCount:7,survival:new SurvivalState(),weapons:new WeaponState(),upgrades:new UpgradeState()};}

test('as duas eras têm identidade própria e não apresentam dinossauros no Pleistoceno',()=>{
 assert.equal(ERAS.length,2);assert.equal(eraAt(0).id,'cretaceo');assert.equal(eraAt(1).id,'pleistoceno');
 assert.deepEqual(PLEISTOCENE_SPECIES,['smilodonte','rinoceronte-lanoso','mamute-jovem']);
 assert.equal(eraAt(1).goal,100);
});
test('snapshot preserva vida, nível, armas, aprimoramentos, fragmentos e tempo',()=>{
 const g=makeGame();g.survival.takeHit(100,2);g.weapons.collect(weaponRewardForKills(10));g.weapons.collect(weaponRewardForKills(20));g.upgrades.apply('velocidade');
 const state=snapshotRun(g),next=makeGame();next.totalKills=0;next.weapons.reset();next.upgrades.reset();next.survival.reset();
 assert.equal(restoreRun(next,state),true);
 assert.deepEqual(next.weapons.unlocked,['artefato','duplo','lanca']);
 assert.equal(next.weapons.active,'lanca');assert.equal(next.survival.health,3);assert.equal(next.upgrades.levels.velocidade,1);
 assert.equal(next.level,15);assert.equal(next.totalKills,100);assert.equal(next.fragmentCount,7);assert.equal(next.elapsedMs,490000);
 assert.equal(next.weapons.collectedMilestones.has(20),true);
});
test('estado do Pleistoceno é independente de uma partida reiniciada',()=>{
 const old=makeGame(),progress=snapshotRun(old);progress.weapons.levels.artefato=4;progress.upgrades.cadencia=3;
 assert.equal(new WeaponState().levels.artefato,1);assert.equal(new UpgradeState().levels.cadencia,0);
});
test('recompensas da segunda era são únicas, por década, sem colisão com as anteriores',()=>{
 const w=new WeaponState();for(let k=10;k<=90;k+=10)w.collect(weaponRewardForKills(k));
 assert.equal(w.collect(pleistoceneRewardForKills(10)),true);assert.equal(w.levels.artefato,3);
 assert.equal(w.collect(pleistoceneRewardForKills(10)),false);
 assert.equal(w.collect(pleistoceneRewardForKills(60)),true);assert.equal(w.levels.artefato,4);
 for(let k=1;k<=105;k++)if(k%10!==0||k>90)assert.equal(pleistoceneRewardForKills(k),null);
});
test('Pleistoceno tem obstáculos e acesso ao centro da arena',()=>{
 const {projection,world,nav}=makeEraWorld();
 assert.ok(world.obstacles.length>70);
 assert.ok(world.obstacles.some(o=>o.type==='ice'));
 assert.ok(world.obstacles.some(o=>o.type==='pine'));
 const center=projection.toScreen(17,14);assert.equal(nav.isOpen(center.x,center.y),true);
 assert.equal(nav.isOpen(projection.toScreen(-2,-2).x,projection.toScreen(-2,-2).y),false);
});
test('todas as regiões principais do novo mapa possuem rota até o centro',()=>{
 const {projection,nav}=makeEraWorld(),center=projection.toScreen(17,14);
 for(const xy of [[5,5],[28,5],[5,22],[28,22],[12,4],[22,23],[8,14],[26,13]]){
   const p=projection.toScreen(...xy),from=nav.isOpen(p.x,p.y)?p:nav.nearestOpenPoint(p.x,p.y);
   assert.ok(from,`sem ponto válido ${xy}`);
   assert.ok(nav.findPath(from.x,from.y,center.x,center.y).length>0,`sem caminho ${xy}`);
 }
});
test('criaturas do Pleistoceno usam espécies e texturas diferentes das cretáceas',()=>{
 const scene=makeScene(),animals=[0,1,2].map(i=>new Creature(scene,500,400,i,{era:'pleistoceno'}));
 assert.deepEqual(animals.map(a=>a.species),PLEISTOCENE_SPECIES);
 for(const a of animals){assert.ok(a.texture(false,0).startsWith('era2-'));assert.equal(a.hp,3);}
 assert.ok(pleistocenePlayerTexture('up',1).startsWith('era2-player-'));
 assert.notEqual(pleistoceneCreatureTexture('smilodonte',false,2),pleistoceneCreatureTexture('mamute-jovem',false,2));
});

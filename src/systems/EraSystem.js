/** Capítulos jogáveis: Cretáceo fictício e Pleistoceno. Sem coexistência humana com dinossauros. */
export const ERAS = Object.freeze([
  Object.freeze({id:'cretaceo',number:1,name:'CRETÁCEO',subtitle:'SOBREVIVA AO MUNDO PRIMORDIAL',theme:0x193b30,accent:0xd7bd7f,goal:100}),
  Object.freeze({id:'pleistoceno',number:2,name:'PRÉ-HISTÓRIA',subtitle:'PLEISTOCENO · A ERA DO GELO',theme:0x1d3847,accent:0x9ccae0,goal:100})
]);
export function eraAt(index=0){return ERAS[index]||ERAS[0];}
/** Congela somente os dados de uma partida. A transição não reinicia a jornada. */
export function snapshotRun(game){
  return {
    totalKills:game.totalKills,
    level:game.level,
    power:game.power,
    elapsedMs:game.elapsedMs,
    health:game.survival.health,
    weapons:{unlocked:[...game.weapons.unlocked],levels:{...game.weapons.levels},active:game.weapons.active,milestones:[...game.weapons.collectedMilestones]},
    upgrades:{...game.upgrades.levels},
    fragments:game.fragmentCount
  };
}
export function restoreRun(game,snapshot){
  if(!snapshot)return false;
  game.totalKills=Math.max(0,Math.floor(snapshot.totalKills||0));
  game.level=Math.max(1,Math.floor(snapshot.level||1));
  game.power=Math.max(1,Math.floor(snapshot.power||1));
  game.elapsedMs=Math.max(0,snapshot.elapsedMs||0);
  game.survival.health=Math.max(1,Math.min(game.survival.maxHealth,Math.floor(snapshot.health||1)));
  game.weapons.unlocked=[...snapshot.weapons.unlocked];
  game.weapons.levels={...snapshot.weapons.levels};
  game.weapons.active=game.weapons.unlocked.includes(snapshot.weapons.active)?snapshot.weapons.active:game.weapons.unlocked[0];
  game.weapons.collectedMilestones=new Set(snapshot.weapons.milestones);
  game.upgrades.levels={...snapshot.upgrades};
  game.fragmentCount=Math.max(0,Math.min(9,Math.floor(snapshot.fragments||0)));
  return true;
}
/** Recompensas da Era 02 não reutilizam as chaves do Cretáceo. */
export function pleistoceneRewardForKills(kills){
  if(!Number.isInteger(kills)||kills%10!==0||kills<10||kills>90)return null;
  const ids=['artefato','duplo','lanca','leque','orbe'];
  const index=kills/10-1;
  return {milestone:`era02-${kills}`,id:ids[index%ids.length],tier:index<5?3:4,kind:'evolucao'};
}

/** Metadados de planejamento; a Era 03 ainda não é jogável. */
export const NEXT_ERA_PREVIEW=Object.freeze({number:3,name:'CIVILIZAÇÕES ANTIGAS',status:'em desenvolvimento'});
/** Bônus da vitória da Era 02, sem alterar o snapshot original. */
export function prepareNextEraProgress(progress,maxHealth=5){
  if(!progress)return null;
  return {...progress,health:Math.min(maxHealth,(progress.health||1)+2),nextEra:NEXT_ERA_PREVIEW.number};
}

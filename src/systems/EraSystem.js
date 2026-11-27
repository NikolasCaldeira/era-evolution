/** Eras em ordem histórica; Cretáceo é fantasia temporal, não coexistência de humanos e dinossauros. */
export const ERAS = Object.freeze([
  Object.freeze({id:'cretaceo',number:1,name:'CRETÁCEO',subtitle:'SOBREVIVA AO MUNDO PRIMORDIAL',theme:0x193b30,accent:0xd7bd7f,goal:100}),
  Object.freeze({id:'pleistoceno',number:2,name:'PRÉ-HISTÓRIA',subtitle:'PLEISTOCENO · A ERA DO GELO',theme:0x1d3847,accent:0x9ccae0,goal:100}),
  Object.freeze({id:'antiga',number:3,name:'CIVILIZAÇÕES ANTIGAS',subtitle:'TEMPLOS, DESERTO E MITOS DE PEDRA',theme:0x55432d,accent:0xf0c67c,goal:100}),
  Object.freeze({id:'medieval',number:4,name:'ERA MEDIEVAL',subtitle:'FORTALEZA SOB O CREPÚSCULO',theme:0x313d48,accent:0xb8cce0,goal:100}),
  Object.freeze({id:'renascimento',number:5,name:'RENASCIMENTO',subtitle:'ENGENHOS, ARTE E ALQUIMIA',theme:0x374c45,accent:0xe5b879,goal:100}),
  Object.freeze({id:'industrial',number:6,name:'REVOLUÇÃO INDUSTRIAL',subtitle:'FÁBRICAS, FUMAÇA E ENGENHOS A VAPOR',theme:0x45382f,accent:0xe5b37e,goal:100}),
  Object.freeze({id:'contemporanea',number:7,name:'ERA CONTEMPORÂNEA',subtitle:'CIDADES, MÁQUINAS E NOVOS PERIGOS',theme:0x293c4c,accent:0xb5dfe6,goal:100}),
  Object.freeze({id:'digital',number:8,name:'ERA DIGITAL',subtitle:'CIRCUITOS, SISTEMAS E DADOS CORROMPIDOS',theme:0x193349,accent:0x80e5d3,goal:100}),
  Object.freeze({id:'espacial',number:9,name:'ERA ESPACIAL',subtitle:'BASE LUNAR · SENTINELAS E TEMPESTADES CÓSMICAS',theme:0x19253f,accent:0x9bdef0,goal:100})
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

/** Compatibilidade com capítulos anteriores; agora nove eras jogáveis. */
export const NEXT_ERA_PREVIEW=Object.freeze({number:3,name:'CIVILIZAÇÕES ANTIGAS',status:'jogável'});
export const FUTURE_ERA_PREVIEW=Object.freeze([{number:10,name:'ERA DA EXTINÇÃO'}]);
/** Bônus da vitória da Era 02, sem alterar o snapshot original. */
export function prepareNextEraProgress(progress,maxHealth=5,nextEra=3){
  if(!progress)return null;
  return {...progress,health:Math.min(maxHealth,(progress.health||1)+2),nextEra};
}

/** Recompensas novas por era, com marcos independentes dos capítulos anteriores. */
export function rewardForEraKills(index,kills){
  if(index===0){
    // Compatibilidade: a primeira era disponibiliza desbloqueios de armas.
    const ids=['duplo','lanca','leque','orbe','artefato','duplo','lanca','leque','orbe'];
    if(!Number.isInteger(kills)||kills<10||kills>90||kills%10!==0)return null;
    const i=kills/10-1;
    return {milestone:kills,id:ids[i],tier:i<4?1:2,kind:i<4?'nova':'evolucao'};
  }
  if(index===1)return pleistoceneRewardForKills(kills);
  if(!Number.isInteger(kills)||kills<10||kills>90||kills%10!==0||index<2||index>=ERAS.length)return null;
  const i=kills/10-1,ids=['artefato','duplo','lanca','leque','orbe'];
  return {milestone:`era${String(index+1).padStart(2,'0')}-${kills}`,id:ids[i%5],tier:2*index+1+(i>=5?1:0),kind:'evolucao'};
}

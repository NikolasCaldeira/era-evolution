/** Dificuldade progressiva do Cretáceo. Os inimigos mantêm 3 pontos de vida. */
export const CREATURE_BEHAVIORS = Object.freeze(['investida', 'resistente', 'flanqueador']);
export const MAX_STAGE = 9; // A partir de 100 eliminações, a arena passa para a luta do chefe.
export function difficultyForKills(kills) {
  const stage=Math.max(0,Math.min(MAX_STAGE,Math.floor(Math.max(0,kills)/10)));
  return Object.freeze({
    stage,
    bandStart:stage*10,
    maxAlive:8+stage,
    spawnIntervalMs:Math.max(2350,6700-stage*465),
    speedMultiplier:1+stage*.037,
    aggression:1+stage*.085
  });
}
export function behaviorForCreature(id) {
  return CREATURE_BEHAVIORS[Math.abs(id)%CREATURE_BEHAVIORS.length];
}
/** Determina de forma consistente de onde nascem as criaturas sem teletransporte visível.
 * Não permite posições isoladas por pedras, árvores ou fronteiras do mapa. */
export function chooseSpawnPoint({navigation,projection,player,sequence=0,minimumDistance=250}) {
  const candidates=[];
  // Distribuir os nascimentos pelo mapa e alternar os lados da arena.
  for(let i=0;i<52;i++){
    const x=2+((sequence*13+i*17)%30);
    const y=2+((sequence*7+i*11)%24);
    const point=projection.toScreen(x,y);
    const distance=Math.hypot(point.x-player.x,point.y-player.y);
    if(distance<minimumDistance||!navigation.isOpen(point.x,point.y))continue;
    candidates.push({point,distance});
  }
  // Examinar primeiro os pontos menos distantes, para não alongar a perseguição.
  candidates.sort((a,b)=>a.distance-b.distance);
  for(let i=0;i<Math.min(20,candidates.length);i++){
    const p=candidates[(i*7+sequence)%Math.min(20,candidates.length)].point;
    if(navigation.findPath(p.x,p.y,player.x,player.y).length)return p;
  }
  // Sem uma posição atingível, não gerar inimigo invisível ou bloqueado.
  return null;
}

/** Limites por era: mantém a escalada, mas evita lotação excessiva nas Eras IV–V.
 * O custo da navegação cresce aproximadamente com o número de criaturas;
 * limitar a população melhora a previsibilidade do combate.
 */
export const ERA_BALANCE=Object.freeze([
  Object.freeze({maxAlive:17,extraAlive:0,spawnFactor:1,speedFactor:1,aggressionFactor:1}),
  Object.freeze({maxAlive:18,extraAlive:1,spawnFactor:.95,speedFactor:1.065,aggressionFactor:1.09}),
  Object.freeze({maxAlive:19,extraAlive:2,spawnFactor:.91,speedFactor:1.13,aggressionFactor:1.17}),
  Object.freeze({maxAlive:20,extraAlive:3,spawnFactor:.88,speedFactor:1.18,aggressionFactor:1.26}),
  Object.freeze({maxAlive:21,extraAlive:4,spawnFactor:.85,speedFactor:1.235,aggressionFactor:1.34}),
  Object.freeze({maxAlive:22,extraAlive:5,spawnFactor:.83,speedFactor:1.28,aggressionFactor:1.42}),
  Object.freeze({maxAlive:23,extraAlive:6,spawnFactor:.81,speedFactor:1.33,aggressionFactor:1.50}),
  Object.freeze({maxAlive:24,extraAlive:7,spawnFactor:.80,speedFactor:1.38,aggressionFactor:1.59})
]);
/** Inimigos comuns continuam com três pontos de vida. Escalada por ritmo, IA e posicionamento. */
export function difficultyForEra(kills,eraIndex=0){
  const within=difficultyForKills(kills);
  const era=Math.max(0,Math.min(ERA_BALANCE.length-1,Math.floor(eraIndex)||0));
  const balance=ERA_BALANCE[era];
  return Object.freeze({
    ...within,era,
    maxAlive:Math.min(balance.maxAlive,within.maxAlive+balance.extraAlive),
    spawnIntervalMs:Math.max(1850,Math.round(within.spawnIntervalMs*balance.spawnFactor)),
    speedMultiplier:within.speedMultiplier*balance.speedFactor,
    aggression:within.aggression*balance.aggressionFactor
  });
}

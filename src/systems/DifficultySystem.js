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

/** Mantém progressão de 10 em 10 abates, somando pressão proporcional à era.
 * Inimigos comuns continuam com três pontos de vida; a exigência cresce pelo comportamento. */
export function difficultyForEra(kills,eraIndex=0){
  const within=difficultyForKills(kills),era=Math.max(0,Math.min(4,Math.floor(eraIndex)||0));
  return Object.freeze({
    ...within,era,
    maxAlive:Math.min(24,within.maxAlive+Math.round(era*1.5)),
    spawnIntervalMs:Math.max(1500,Math.round(within.spawnIntervalMs*(1-era*.075))),
    speedMultiplier:within.speedMultiplier*(1+era*.092),
    aggression:within.aggression*(1+era*.13)
  });
}

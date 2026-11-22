/** Ações manuais e ataques que devem ser esquivados: lógica pura e testável. */
export const DASH=Object.freeze({distance:94,cooldownMs:4900,invulnerabilityMs:320});
export class DashState{
  constructor(config=DASH){this.config=config;this.lastUsed=-Infinity;}
  canUse(now){return now-this.lastUsed>=this.config.cooldownMs;}
  use(now){if(!this.canUse(now))return false;this.lastUsed=now;return true;}
  remaining(now){return Math.max(0,this.config.cooldownMs-(now-this.lastUsed));}
}
export function threatForEra(eraIndex,stage=0){
  if(eraIndex<2&&stage<5)return null;
  if(eraIndex<2)return Object.freeze({intervalMs:11500-stage*200,warningMs:1580,radius:35+Math.floor(stage/3)*3,idleTriggerMs:5100});
  const era=eraIndex-2;
  return Object.freeze({
    intervalMs:Math.max(3900,8500-era*1400-Math.min(stage,9)*110),
    warningMs:Math.max(830,1350-era*150),
    radius:Math.min(61,40+era*7+Math.floor(stage/3)*3),
    idleTriggerMs:Math.max(2500,3850-era*450)
  });
}
export function threatHits(target,player,radius){return Math.hypot(target.x-player.x,target.y-player.y)<radius;}

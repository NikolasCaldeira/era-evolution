/** Regras de combate do Mamute Ancestral, independentes do renderizador. */
export const ICE_BOSS_CONFIG = Object.freeze({
  name: 'MAMUTE ANCESTRAL', maxHealth: 138, baseSpeed: 80,
  contactRadius: 67, chargeWindupMs: 1120, stompWindupMs: 1100,
  breathWindupMs: 1250, summonWindupMs: 930,
  chargeDurationMs: 570, stompRadius: 145,
  breathRange: 230, breathHalfAngle: Math.PI/5.7,
  slowDurationMs: 1750, slowMultiplier: .61
});
export const ICE_BOSS_ATTACKS = Object.freeze(['charge', 'stomp', 'breath', 'summon']);

export function inFrostCone(origin,heading,target,range=ICE_BOSS_CONFIG.breathRange,halfAngle=ICE_BOSS_CONFIG.breathHalfAngle){
  const dx=target.x-origin.x,dy=target.y-origin.y;
  const d=Math.hypot(dx,dy);
  if(d>range)return false;
  if(d<.01)return true;
  return (dx*Math.cos(heading)+dy*Math.sin(heading))/d >= Math.cos(halfAngle);
}

export class IceAgeBossState {
  constructor(maxHealth=ICE_BOSS_CONFIG.maxHealth){
    if(!Number.isFinite(maxHealth)||maxHealth<=0)throw new Error('Vida do Mamute inválida');
    this.maxHealth=Math.floor(maxHealth);
    this.health=this.maxHealth;
    this.attackIndex=0;
    this.summonCount=0;
  }
  get alive(){return this.health>0;}
  get phase(){return this.health>this.maxHealth*.70?1:this.health>this.maxHealth*.35?2:3;}
  get healthRatio(){return this.health/this.maxHealth;}
  takeDamage(amount){
    if(!this.alive||!Number.isFinite(amount)||amount<=0)return {applied:false,defeated:!this.alive,phase:this.phase};
    const before=this.phase;
    this.health=Math.max(0,this.health-Math.max(1,Math.floor(amount)));
    return {applied:true,defeated:!this.alive,phase:this.phase,phaseChanged:this.alive&&before!==this.phase};
  }
  nextAttack(distance=210,canSummon=true){
    if(this.phase===3&&canSummon&&this.summonCount<2&&this.attackIndex%4===0){
      this.attackIndex++;this.summonCount++;return 'summon';
    }
    const n=this.attackIndex++;
    if(distance<130&&n%3===0)return 'stomp';
    if(distance>255&&n%2===0)return 'charge';
    const moves=this.phase===1?['charge','stomp']:['charge','breath','stomp','breath'];
    return moves[n%moves.length];
  }
  windupFor(type){return Math.max(640,ICE_BOSS_CONFIG[`${type}WindupMs`]-(this.phase-1)*110);}
  cooldownMs(){return 3500-(this.phase-1)*440;}
}

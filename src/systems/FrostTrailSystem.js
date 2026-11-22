/** Rastro de gelo: imobilização curta seguida de recuperação gradual da velocidade. */
export const FROST_TRAIL = Object.freeze({
  durationMs: 6100,
  radius: 33,
  stunMs: 420,
  slowMs: 2650,
  initialSlow: 0.34
});
export class FrostTrailState {
  constructor(config=FROST_TRAIL){this.config=config;this.reset();}
  reset(){this.stunUntil=-Infinity;this.recoverUntil=-Infinity;this.lastTouched=new Set();}
  /** Cada área gelada ativa o efeito uma única vez: permanecer parado não prende para sempre. */
  touch(patchId,now){
    if(this.lastTouched.has(patchId)||!Number.isFinite(now))return false;
    this.lastTouched.add(patchId);
    if(now<this.stunUntil)return false;
    this.stunUntil=now+this.config.stunMs;
    this.recoverUntil=this.stunUntil+this.config.slowMs;
    return true;
  }
  movementMultiplier(now){
    if(now<this.stunUntil)return 0;
    if(now>=this.recoverUntil)return 1;
    const t=Math.max(0,(now-this.stunUntil)/this.config.slowMs);
    return this.config.initialSlow+(1-this.config.initialSlow)*t;
  }
  phase(now){return now<this.stunUntil?'stun':now<this.recoverUntil?'recuperando':'livre';}
  remaining(now){return Math.max(0,this.recoverUntil-now);}
}

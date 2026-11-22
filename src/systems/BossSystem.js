/** Modelo determinístico do primeiro chefe; permite testes sem renderizador. */
export const BOSS_CONFIG = Object.freeze({
  name: 'TRICERÁTOPS ANCESTRAL',
  maxHealth: 78,
  baseSpeed: 100,
  contactRadius: 55,
  chargeWindupMs: 1050,
  stompWindupMs: 1100,
  volleyWindupMs: 830,
  chargeDurationMs: 560,
  stompRadius: 125
});
export const BOSS_ATTACKS = Object.freeze(['charge', 'stomp', 'volley']);
export class BossState {
  constructor(maxHealth = BOSS_CONFIG.maxHealth) {
    if (!Number.isFinite(maxHealth) || maxHealth <= 0) throw new Error('Vida do chefe inválida');
    this.maxHealth = Math.floor(maxHealth);
    this.health = this.maxHealth;
    this.attackIndex = 0;
  }
  get alive(){ return this.health > 0; }
  get phase(){return this.health > this.maxHealth*.66 ? 1 : this.health > this.maxHealth*.33 ? 2 : 3;}
  get healthRatio(){return this.health / this.maxHealth;}
  takeDamage(amount = 1) {
    if (!this.alive || !Number.isFinite(amount) || amount <= 0) return { applied: false, defeated: !this.alive, phase: this.phase };
    const beforePhase = this.phase;
    this.health = Math.max(0, this.health - Math.max(1,Math.floor(amount)));
    return { applied: true, defeated: !this.alive, phase: this.phase, phaseChanged: this.alive && beforePhase !== this.phase };
  }
  nextAttack(distance=200){
    // Perto do chefe, a pisada defensiva tem prioridade; longe, a investida.
    const index=this.attackIndex++;
    if (distance < 110 && index % 2 === 0) return 'stomp';
    if (distance > 280 && index % 2 === 0) return 'charge';
    return BOSS_ATTACKS[index % BOSS_ATTACKS.length];
  }
  windupFor(attack) {
    const key = `${attack}WindupMs`;
    return Math.max(550, BOSS_CONFIG[key] - (this.phase - 1) * 90);
  }
  cooldownMs(){return 3500-(this.phase-1)*420;}
}

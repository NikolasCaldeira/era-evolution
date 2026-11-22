/** Regras puras de sobrevivência. Tempo em milissegundos (relógio da cena). */
export class SurvivalState {
  constructor({ maxHealth = 5, invulnerabilityMs = 1250 } = {}) {
    if (!Number.isFinite(maxHealth) || maxHealth <= 0 ||
        !Number.isFinite(invulnerabilityMs) || invulnerabilityMs < 0) {
      throw new Error('Parâmetros de sobrevivência inválidos');
    }
    this.maxHealth = Math.floor(maxHealth);
    this.invulnerabilityMs = invulnerabilityMs;
    this.reset();
  }

  reset() {
    this.health = this.maxHealth;
    this.invulnerableUntil = -Infinity;
  }

  get alive() { return this.health > 0; }
  isInvulnerable(now) { return this.alive && now < this.invulnerableUntil; }

  takeHit(now, damage = 1) {
    if (!Number.isFinite(now)) throw new Error('Tempo inválido');
    if (!Number.isFinite(damage) || damage <= 0) return { applied: false, defeated: !this.alive };
    if (!this.alive || this.isInvulnerable(now)) return { applied: false, defeated: !this.alive };
    this.health = Math.max(0, this.health - Math.ceil(damage));
    this.invulnerableUntil = now + this.invulnerabilityMs;
    return { applied: true, defeated: !this.alive };
  }

  heal(amount = 1) {
    if (!this.alive || !Number.isFinite(amount) || amount <= 0) return 0;
    const before = this.health;
    this.health = Math.min(this.maxHealth, this.health + Math.floor(amount));
    return this.health - before;
  }
}

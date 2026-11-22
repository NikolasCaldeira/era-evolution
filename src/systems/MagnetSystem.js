/**
 * Atração de fragmentos em espaço 2D (sem Phaser).
 * A melhoria Ímã aumenta a zona onde os fragmentos começam a deslocar-se.
 * Os fragmentos precisam efetivamente chegar perto do sobrevivente para serem coletados.
 */
export const FRAGMENT_COLLECT_DISTANCE = 20;
export function magnetRadius(pickupRadius) {
  return Math.max(40, Math.round(pickupRadius * 2.2));
}
export function advanceFragment(fragment, player, deltaMs, attractionRadius) {
  const x = fragment.x, y = fragment.y;
  const dx = player.x - x, dy = player.y - y;
  const dist = Math.hypot(dx, dy);
  if (dist <= FRAGMENT_COLLECT_DISTANCE) return { x, y, attracted: true, collected: true };
  if (dist >= attractionRadius || attractionRadius <= FRAGMENT_COLLECT_DISTANCE) {
    return { x, y, attracted: false, collected: false };
  }
  const dt = Math.min(Math.max(deltaMs, 0), 50) / 1000;
  // Aceleração gradual conforme o fragmento se aproxima, sem teletransporte.
  const pull = 120 + 370 * (1 - dist / attractionRadius);
  const step = Math.min(Math.max(0, dist - FRAGMENT_COLLECT_DISTANCE / 2), pull * dt);
  const nx = x + dx / dist * step, ny = y + dy / dist * step;
  return { x: nx, y: ny, attracted: true, collected: Math.hypot(player.x - nx, player.y - ny) <= FRAGMENT_COLLECT_DISTANCE };
}

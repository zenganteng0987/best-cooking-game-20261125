// orders.js — pesanan masuk, timer pesanan, nyawa, dan level.
// Pesanan yang kehabisan waktu membuat koki kehilangan satu hati.

import { recipesForLevel } from './recipes.js';

export const MAX_ORDERS = 4;
export const START_HEARTS = 3;
export const SHIFT_SECONDS = 180;

export function spawnOrder(state) {
  const pool = recipesForLevel(state.level);
  const recipe = pool[Math.floor(state.rng() * pool.length)];
  const timeMax = Math.max(35, 70 - state.level * 4);
  state.orders.push({
    id: state.nextOrderId,
    recipe,
    timeLeft: timeMax,
    timeMax,
  });
  state.nextOrderId += 1;
  state.events.push({ type: 'order', recipe: recipe.id });
}

// Interval antar pesanan makin rapat tiap level.
export function spawnIntervalForLevel(level) {
  return Math.max(7, 13 - level);
}

export function updateOrders(state, dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.spawnTimer = spawnIntervalForLevel(state.level);
  }
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      state.orders.splice(i, 1);
      state.hearts -= 1;
      state.combo = 0;
      state.events.push({ type: 'expired', recipe: order.recipe.id });
      if (state.hearts <= 0) {
        state.screen = 'over';
        state.overReason = 'Pesanan menumpuk dan pelanggan pergi.';
      }
    }
  }
  state.shiftLeft -= dt;
  if (state.shiftLeft <= 0) {
    state.shiftLeft = 0;
    state.screen = 'over';
    state.overReason = 'Shift selesai! Dapur tutup dengan manis.';
  }
}

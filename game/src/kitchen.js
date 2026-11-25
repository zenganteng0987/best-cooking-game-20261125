// kitchen.js — denah dapur dan semua aksi di stasiun.
// Stasiun: peti bahan, talenan, kompor, meja saji, jendela antar, tempat sampah.
// Koki hanya bisa membawa satu barang; piring di meja saji menampung tiga bahan.

import { INGREDIENTS, findRecipeForPlate } from './recipes.js';

export const KITCHEN_WIDTH = 1280;
export const KITCHEN_HEIGHT = 720;
export const FLOOR_TOP = 192;

const CRATE_KINDS = ['nasi', 'mie', 'telur', 'ayam', 'sayur', 'kecap'];

export function buildStations() {
  const stations = [];
  // Peti bahan di deret atas, di bawah papan order.
  const crateWidth = 160;
  const crateGap = 40;
  const totalWidth = CRATE_KINDS.length * crateWidth + (CRATE_KINDS.length - 1) * crateGap;
  let x = (KITCHEN_WIDTH - totalWidth) / 2;
  for (const kind of CRATE_KINDS) {
    stations.push({
      id: 'crate-' + kind,
      kind: 'crate',
      ingredient: kind,
      x,
      y: 202,
      w: crateWidth,
      h: 66,
      label: INGREDIENTS[kind].name,
      item: null,
      progress: 0,
      state: 'empty',
    });
    x += crateWidth + crateGap;
  }
  // Dua talenan di dinding kiri.
  stations.push({ id: 'chop-1', kind: 'chop', x: 28, y: 320, w: 122, h: 92, label: 'Talenan', item: null, progress: 0, state: 'empty' });
  stations.push({ id: 'chop-2', kind: 'chop', x: 28, y: 470, w: 122, h: 92, label: 'Talenan', item: null, progress: 0, state: 'empty' });
  // Dua kompor di dinding kanan.
  stations.push({ id: 'stove-1', kind: 'stove', x: 1130, y: 320, w: 122, h: 92, label: 'Kompor', item: null, progress: 0, state: 'empty' });
  stations.push({ id: 'stove-2', kind: 'stove', x: 1130, y: 470, w: 122, h: 92, label: 'Kompor', item: null, progress: 0, state: 'empty' });
  // Meja saji di bawah tengah, jendela antar di kanan bawah, tong sampah kiri bawah.
  stations.push({ id: 'plate', kind: 'plate', x: 470, y: 624, w: 340, h: 72, label: 'Meja Saji', item: null, progress: 0, state: 'empty' });
  stations.push({ id: 'serve', kind: 'serve', x: 920, y: 624, w: 300, h: 72, label: 'Jendela Antar', item: null, progress: 0, state: 'empty' });
  stations.push({ id: 'trash', kind: 'trash', x: 60, y: 624, w: 120, h: 72, label: 'Sampah', item: null, progress: 0, state: 'empty' });
  return stations;
}

export function stationById(stations, id) {
  return stations.find((s) => s.id === id) || null;
}

export function stationCenter(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

// Stasiun terdekat dari koki, bila cukup dekat untuk dipakai.
export function nearestStation(state, maxDistance) {
  let best = null;
  let bestDistance = maxDistance;
  for (const station of state.stations) {
    const center = stationCenter(station);
    const dx = state.chef.x - center.x;
    const dy = state.chef.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = station;
    }
  }
  return best;
}

// Apakah titik (px,py) menabrak stasiun padat (semua kecuali jendela antar
// yang menempel dinding bawah dan peti yang menempel dinding atas tetap padat).
export function hitsStation(stations, px, py, radius) {
  for (const station of stations) {
    if (
      px + radius > station.x &&
      px - radius < station.x + station.w &&
      py + radius > station.y &&
      py - radius < station.y + station.h
    ) {
      return station;
    }
  }
  return null;
}

// Kemajuan talenan dan kompor; kompor yang dibiarkan terlalu lama menggosongkan.
export function updateStations(state, dt) {
  for (const station of state.stations) {
    if (station.state !== 'working' || !station.item) continue;
    station.progress += dt;
    const need = INGREDIENTS[station.item.kind].prepTime;
    if (station.progress >= need) {
      station.state = 'done';
      station.progress = need;
      state.events.push({ type: 'done', station: station.id });
    }
  }
  for (const station of state.stations) {
    if (station.kind !== 'stove' || station.state !== 'done' || !station.item) continue;
    station.burnTimer = (station.burnTimer || 0) + dt;
    if (station.burnTimer > 6) {
      station.state = 'burnt';
      station.item.prep = 'burnt';
      state.events.push({ type: 'burnt', station: station.id });
    }
  }
}

// Satu aksi pakai (tombol E / Spasi / klik stasiun dekat).
// Mengembalikan pesan singkat untuk bilah petunjuk; '' bila tidak ada aksi.
export function interactWithStation(state, station) {
  const chef = state.chef;
  if (!station) return '';
  if (station.kind === 'crate') {
    if (chef.holding) return 'Tangan sudah penuh.';
    const ingredient = INGREDIENTS[station.ingredient];
    chef.holding = {
      kind: station.ingredient,
      prep: ingredient.prep === 'none' ? 'ready' : 'raw',
    };
    state.events.push({ type: 'pickup' });
    return 'Mengambil ' + ingredient.name + '.';
  }
  if (station.kind === 'chop' || station.kind === 'stove') {
    const wantPrep = station.kind === 'chop' ? 'chop' : 'cook';
    if (station.state === 'empty' && chef.holding) {
      const ingredient = INGREDIENTS[chef.holding.kind];
      if (chef.holding.prep !== 'raw' || ingredient.prep !== wantPrep) {
        return station.kind === 'chop'
          ? 'Bahan ini tidak dicincang di sini.'
          : 'Bahan ini tidak dimasak di sini.';
      }
      station.item = chef.holding;
      station.progress = 0;
      station.burnTimer = 0;
      station.state = 'working';
      chef.holding = null;
      state.events.push({ type: 'place' });
      return station.kind === 'chop' ? 'Mencincang…' : 'Memasak…';
    }
    if ((station.state === 'done' || station.state === 'burnt') && !chef.holding) {
      const finished = station.item.prep === 'burnt'
        ? 'burnt'
        : (wantPrep === 'chop' ? 'chopped' : 'cooked');
      chef.holding = { kind: station.item.kind, prep: finished };
      station.item = null;
      station.progress = 0;
      station.burnTimer = 0;
      station.state = 'empty';
      state.events.push({ type: 'pickup' });
      return finished === 'burnt' ? 'Gosong! Buang ke tong sampah.' : 'Siap dibawa.';
    }
    if (station.state === 'working') return 'Tunggu sebentar lagi…';
    if (chef.holding) return 'Tangan sudah penuh.';
    return 'Tidak ada yang bisa diambil.';
  }
  if (station.kind === 'plate') {
    if (chef.holding && chef.holding.kind === 'dish') return 'Hidangan jadi jangan ditaruh di sini.';
    if (chef.holding && chef.holding.prep !== 'raw' && chef.holding.prep !== 'burnt') {
      if (state.plate.length >= 3) return 'Piring sudah penuh tiga bahan.';
      state.plate.push(chef.holding);
      chef.holding = null;
      state.events.push({ type: 'plate' });
      const recipe = findRecipeForPlate(state.plate);
      if (recipe) {
        state.platedDish = recipe;
        state.events.push({ type: 'dish-ready', recipe: recipe.id });
        return recipe.name + ' selesai dirakit! Bawa ke jendela antar.';
      }
      return 'Bahan masuk ke piring.';
    }
    if (!chef.holding && state.platedDish) {
      chef.holding = { kind: 'dish', recipe: state.platedDish.id };
      state.plate = [];
      state.platedDish = null;
      state.events.push({ type: 'pickup' });
      return 'Membawa hidangan siap antar.';
    }
    if (chef.holding) return 'Bahan mentah atau gosong tidak bisa masuk piring.';
    return 'Piring masih kosong.';
  }
  if (station.kind === 'serve') {
    if (chef.holding && chef.holding.kind === 'dish') {
      servePlate(state, chef.holding.recipe);
      chef.holding = null;
      return '';
    }
    return 'Bawa hidangan yang sudah jadi ke sini.';
  }
  if (station.kind === 'trash') {
    if (chef.holding) {
      chef.holding = null;
      state.events.push({ type: 'trash' });
      return 'Dibuang.';
    }
    if (state.plate.length > 0 || state.platedDish) {
      state.plate = [];
      state.platedDish = null;
      state.events.push({ type: 'trash' });
      return 'Piring dikosongkan.';
    }
    return 'Tidak ada yang dibuang.';
  }
  return '';
}

// Antar hidangan: cocok dengan order = poin penuh + tip; tanpa order = poin kecil.
export function servePlate(state, recipeId) {
  const orderIndex = state.orders.findIndex((o) => o.recipe.id === recipeId);
  const recipe = state.orders[orderIndex]
    ? state.orders[orderIndex].recipe
    : null;
  if (orderIndex >= 0) {
    const order = state.orders[orderIndex];
    const timeBonus = Math.round(50 * (order.timeLeft / order.timeMax));
    const comboBonus = state.combo * 15;
    const points = recipe.price + timeBonus + comboBonus;
    state.score += points;
    state.coins += points;
    state.combo += 1;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;
    state.served += 1;
    state.orders.splice(orderIndex, 1);
    state.events.push({ type: 'served', points, recipe: recipeId, combo: state.combo });
    state.level = 1 + Math.floor(state.served / 4);
  } else {
    state.score += 30;
    state.coins += 30;
    state.events.push({ type: 'served-late', points: 30, recipe: recipeId });
  }
}

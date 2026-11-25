// shots.js — adegan deterministik untuk screenshot (?shot=cover|play|serve|rush).
// Setiap adegan menyusun state lengkap: papan order terisi, bahan di counter,
// satu hidangan sedang dirakit, timer berjalan, dan satu piring siap diantar.
// Juga menyediakan RNG ber-seed agar permainan biasa bisa diulang.

import { RECIPES } from './recipes.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function orderFor(state, recipeId, timeLeft, timeMax) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return { id: state.nextOrderId, recipe, timeLeft, timeMax };
}

function placeOnStation(state, stationId, kind, prep, progress, stationState) {
  const station = state.stations.find((s) => s.id === stationId);
  if (!station) return;
  station.item = { kind, prep };
  station.progress = progress;
  station.state = stationState;
  station.burnTimer = 0;
}

// Adegan cover: semua elemen kriteria #1 dalam satu frame.
function sceneCover(state) {
  state.screen = 'playing';
  state.score = 1240;
  state.coins = 1240;
  state.hearts = 3;
  state.level = 3;
  state.combo = 3;
  state.bestCombo = 5;
  state.served = 9;
  state.shiftLeft = 96;
  state.spawnTimer = 6;
  state.nextOrderId = 10;
  state.orders = [
    orderFor(state, 'nasi-emas', 38, 70),
    orderFor(state, 'mie-pelangi', 24, 62),
    orderFor(state, 'sup-ceria', 52, 58),
  ];
  state.nextOrderId = 13;
  state.chef.x = 620;
  state.chef.y = 560;
  state.chef.holding = { kind: 'telur', prep: 'chopped' };
  state.plate = [
    { kind: 'nasi', prep: 'cooked' },
    { kind: 'kecap', prep: 'ready' },
  ];
  state.platedDish = null;
  state.serveShowcase = 'nasi-emas';
  placeOnStation(state, 'stove-1', 'mie', 'raw', 1.8, 'working');
  placeOnStation(state, 'chop-1', 'ayam', 'raw', 2.5, 'done');
  state.hint = 'Rakit Nasi Emas: tambah Telur cincang ke Meja Saji, lalu antar!';
}

// Adegan play: awal permainan, koki membawa nasi mentah ke kompor.
function scenePlay(state) {
  state.screen = 'playing';
  state.score = 120;
  state.coins = 120;
  state.hearts = 3;
  state.level = 1;
  state.combo = 1;
  state.bestCombo = 1;
  state.served = 1;
  state.shiftLeft = 168;
  state.spawnTimer = 9;
  state.nextOrderId = 4;
  state.orders = [orderFor(state, 'nasi-emas', 58, 70)];
  state.nextOrderId = 5;
  state.chef.x = 900;
  state.chef.y = 420;
  state.chef.holding = { kind: 'nasi', prep: 'raw' };
  state.plate = [];
  state.platedDish = null;
  state.serveShowcase = null;
  placeOnStation(state, 'chop-1', 'telur', 'raw', 1.2, 'working');
  state.hint = 'Bawa Nasi ke Kompor untuk dimasak.';
}

// Adegan serve: koki di jendela antar membawa hidangan jadi.
function sceneServe(state) {
  state.screen = 'playing';
  state.score = 860;
  state.coins = 860;
  state.hearts = 3;
  state.level = 2;
  state.combo = 2;
  state.bestCombo = 4;
  state.served = 6;
  state.shiftLeft = 121;
  state.spawnTimer = 5;
  state.nextOrderId = 8;
  state.orders = [
    orderFor(state, 'mie-pelangi', 41, 66),
    orderFor(state, 'ayam-manis', 55, 62),
  ];
  state.nextOrderId = 10;
  state.chef.x = 1070;
  state.chef.y = 580;
  state.chef.holding = { kind: 'dish', recipe: 'mie-pelangi' };
  state.plate = [];
  state.platedDish = null;
  state.serveShowcase = null;
  placeOnStation(state, 'stove-2', 'nasi', 'raw', 2.4, 'working');
  placeOnStation(state, 'chop-2', 'sayur', 'raw', 2.0, 'done');
  state.hint = 'Antar Mie Pelangi ke Jendela Antar sekarang!';
}

// Adegan rush: level tinggi, timer mepet, kedua kompor dan talenan sibuk.
function sceneRush(state) {
  state.screen = 'playing';
  state.score = 3120;
  state.coins = 3120;
  state.hearts = 1;
  state.level = 5;
  state.combo = 5;
  state.bestCombo = 7;
  state.served = 18;
  state.shiftLeft = 42;
  state.spawnTimer = 3;
  state.nextOrderId = 20;
  state.orders = [
    orderFor(state, 'ayam-manis', 8, 50),
    orderFor(state, 'nasi-emas', 19, 50),
    orderFor(state, 'mie-pelangi', 27, 50),
    orderFor(state, 'telur-pelangi', 44, 50),
  ];
  state.nextOrderId = 24;
  state.chef.x = 640;
  state.chef.y = 470;
  state.chef.holding = { kind: 'ayam', prep: 'chopped' };
  state.plate = [
    { kind: 'nasi', prep: 'cooked' },
    { kind: 'kecap', prep: 'ready' },
  ];
  state.platedDish = null;
  state.serveShowcase = null;
  placeOnStation(state, 'stove-1', 'mie', 'raw', 2.2, 'working');
  placeOnStation(state, 'stove-2', 'nasi', 'raw', 1.1, 'working');
  placeOnStation(state, 'chop-1', 'sayur', 'raw', 2.0, 'done');
  placeOnStation(state, 'chop-2', 'telur', 'raw', 0.8, 'working');
  state.hint = 'RUSH! Pesanan Ayam Manis tinggal 8 detik — cepat antar!';
}

const SCENES = { cover: sceneCover, play: scenePlay, serve: sceneServe, rush: sceneRush };

export function applyShotScene(state, name) {
  const scene = SCENES[name];
  if (!scene) return false;
  scene(state);
  return true;
}

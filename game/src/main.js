// main.js — titik masuk Dapur Pelangi: state, loop game, gerak koki,
// tabrakan dengan meja, dan mode uji mandiri (?selftest=1) untuk headless.

import { buildStations, hitsStation, interactWithStation, nearestStation, stationById, stationCenter, updateStations } from './kitchen.js';
import { spawnOrder, updateOrders, START_HEARTS, SHIFT_SECONDS } from './orders.js';
import { createInput, moveDirection } from './input.js';
import { ensureAudio, playSound } from './audio.js';
import { renderGame } from './render.js';
import { applyShotScene, mulberry32 } from './shots.js';
import { RECIPES } from './recipes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const input = createInput(canvas);

const CHEF_SPEED = 260;
const CHEF_RADIUS = 20;
const USE_DISTANCE = 140;

function createState(rng) {
  return {
    screen: 'title',
    score: 0,
    coins: 0,
    hearts: START_HEARTS,
    level: 1,
    served: 0,
    combo: 0,
    bestCombo: 0,
    shiftLeft: SHIFT_SECONDS,
    spawnTimer: 4,
    nextOrderId: 1,
    orders: [],
    stations: buildStations(),
    chef: { x: 640, y: 450, holding: null },
    plate: [],
    platedDish: null,
    serveShowcase: null,
    overReason: '',
    hint: 'WASD / panah: jalan   •   E / Spasi: pakai stasiun   •   Klik: jalan ke titik itu',
    events: [],
    rng,
  };
}

function seedFromParams() {
  const seed = Number.parseInt(params.get('seed') || '', 10);
  if (Number.isFinite(seed)) return mulberry32(seed);
  return Math.random;
}

let state = createState(seedFromParams());
let moveTarget = null;
const shotMode = params.get('shot') || '';

if (shotMode) {
  applyShotScene(state, shotMode);
}

function startGame() {
  ensureAudio();
  state = createState(seedFromParams());
  state.screen = 'playing';
  spawnOrder(state);
  moveTarget = null;
}

function playEventSounds() {
  for (const event of state.events) {
    if (event.type === 'pickup') playSound('pickup');
    else if (event.type === 'place') playSound('place');
    else if (event.type === 'done') playSound('done');
    else if (event.type === 'served') playSound('served');
    else if (event.type === 'expired') playSound('expired');
    else if (event.type === 'burnt') playSound('burnt');
    else if (event.type === 'trash') playSound('trash');
    else if (event.type === 'order') playSound('order');
    else if (event.type === 'dish-ready') playSound('done');
  }
  state.events.length = 0;
}

function moveChef(dt) {
  const chef = state.chef;
  let dir = moveDirection(input);
  if (dir.x === 0 && dir.y === 0 && moveTarget) {
    const dx = moveTarget.x - chef.x;
    const dy = moveTarget.y - chef.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 8) {
      moveTarget = null;
    } else {
      dir = { x: dx / distance, y: dy / distance };
    }
  }
  if (dir.x !== 0 || dir.y !== 0) {
    const nextX = chef.x + dir.x * CHEF_SPEED * dt;
    if (!hitsStation(state.stations, nextX, chef.y, CHEF_RADIUS)) {
      chef.x = Math.max(24, Math.min(1256, nextX));
    }
    const nextY = chef.y + dir.y * CHEF_SPEED * dt;
    if (!hitsStation(state.stations, chef.x, nextY, CHEF_RADIUS)) {
      chef.y = Math.max(216, Math.min(700, nextY));
    }
  }
}

function consumeClick() {
  if (!input.clickTarget) return;
  const point = input.clickTarget;
  input.clickTarget = null;
  ensureAudio();
  if (state.screen !== 'playing') {
    if (state.screen === 'title' || state.screen === 'over') startGame();
    return;
  }
  // Klik di atas stasiun yang dekat = pakai stasiun itu.
  for (const station of state.stations) {
    if (
      point.x >= station.x - 24 && point.x <= station.x + station.w + 24 &&
      point.y >= station.y - 24 && point.y <= station.y + station.h + 24
    ) {
      const center = stationCenter(station);
      const dx = state.chef.x - center.x;
      const dy = state.chef.y - center.y;
      if (Math.sqrt(dx * dx + dy * dy) < 190) {
        const message = interactWithStation(state, station);
        if (message) state.hint = message;
        playEventSounds();
        return;
      }
      break;
    }
  }
  moveTarget = point;
}

function update(dt) {
  if (state.screen !== 'playing') return;
  consumeClick();
  if (input.pressedUse) {
    input.pressedUse = false;
    ensureAudio();
    const station = nearestStation(state, USE_DISTANCE);
    if (station) {
      const message = interactWithStation(state, station);
      if (message) state.hint = message;
    } else {
      state.hint = 'Mendekatlah ke stasiun dulu.';
      playSound('error');
    }
  }
  moveChef(dt);
  updateStations(state, dt);
  updateOrders(state, dt);
  playEventSounds();
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (input.pressedStart) {
    input.pressedStart = false;
    if (state.screen === 'title' || state.screen === 'over') startGame();
  }
  if (!shotMode) update(dt);
  const t = shotMode ? 1.0 : now / 1000;
  renderGame(ctx, state, t);
  requestAnimationFrame(frame);
}

// ---- Uji mandiri (?selftest=1): memainkan satu pesanan penuh lewat fungsi
// yang sama dengan input pemain, lalu menulis PASS/FAIL ke #selftest. ----
function runSelfTest() {
  const results = [];
  function check(name, ok) {
    results.push((ok ? 'PASS ' : 'FAIL ') + name);
  }
  function useStation(id) {
    const station = stationById(state.stations, id);
    const center = stationCenter(station);
    state.chef.x = center.x;
    state.chef.y = center.y + 90;
    const message = interactWithStation(state, station);
    playEventSounds();
    return message;
  }
  try {
    startGame();
    state.orders = [{ id: 99, recipe: RECIPES[0], timeLeft: 60, timeMax: 60 }];
    check('game starts playing', state.screen === 'playing');
    useStation('crate-nasi');
    check('pick up raw rice', state.chef.holding && state.chef.holding.kind === 'nasi' && state.chef.holding.prep === 'raw');
    useStation('stove-1');
    check('rice placed on stove', stationById(state.stations, 'stove-1').state === 'working');
    updateStations(state, 3.5);
    check('rice finished cooking', stationById(state.stations, 'stove-1').state === 'done');
    useStation('stove-1');
    check('pick up cooked rice', state.chef.holding && state.chef.holding.prep === 'cooked');
    useStation('plate');
    check('rice on plate', state.plate.length === 1);
    useStation('crate-kecap');
    useStation('plate');
    check('sauce on plate', state.plate.length === 2);
    useStation('crate-telur');
    useStation('chop-1');
    updateStations(state, 3.0);
    useStation('chop-1');
    check('pick up chopped egg', state.chef.holding && state.chef.holding.prep === 'chopped');
    useStation('plate');
    check('dish assembled (Nasi Emas)', state.platedDish && state.platedDish.id === 'nasi-emas');
    useStation('plate');
    check('carry finished dish', state.chef.holding && state.chef.holding.kind === 'dish');
    const scoreBefore = state.score;
    useStation('serve');
    check('serve scores points', state.score > scoreBefore && state.served === 1);
    state.orders = [{ id: 100, recipe: RECIPES[1], timeLeft: 0.5, timeMax: 60 }];
    const heartsBefore = state.hearts;
    updateOrders(state, 1.0);
    check('expired order costs a heart', state.hearts === heartsBefore - 1 && state.orders.length === 0);
    check('canvas renders', canvas.width === 1280 && canvas.height === 720);
  } catch (err) {
    results.push('FAIL exception: ' + err.message);
  }
  const failed = results.some((line) => line.startsWith('FAIL'));
  const box = document.getElementById('selftest');
  if (box) box.textContent = results.join('\n');
  document.title = failed ? 'SELFTEST FAIL' : 'SELFTEST PASS';
}

if (params.get('selftest') === '1') {
  runSelfTest();
}

requestAnimationFrame(frame);

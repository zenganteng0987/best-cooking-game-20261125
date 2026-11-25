// render.js — semua gambar dapur digambar dengan canvas 2D.
// Tidak ada gambar luar: lantai, meja, bahan, dan koki digambar dari bentuk.

import { INGREDIENTS, RECIPES } from './recipes.js';
import { stationCenter } from './kitchen.js';

const W = 1280;
const H = 720;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, bold) {
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + size + 'px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Ikon bahan: mangkuk nasi, mie, telur, ayam, sayur, botol kecap.
export function drawIngredientIcon(ctx, kind, prep, x, y, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'nasi') {
    ctx.fillStyle = prep === 'burnt' ? '#3a2c1c' : '#fff8dc';
    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = prep === 'burnt' ? '#2a1f12' : '#e8d9a0';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.45, s * 0.95, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'mie') {
    ctx.strokeStyle = prep === 'burnt' ? '#4a3418' : '#f2b705';
    ctx.lineWidth = s * 0.28;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, i * s * 0.35);
      ctx.quadraticCurveTo(0, i * s * 0.35 - s * 0.4, s * 0.8, i * s * 0.35);
      ctx.stroke();
    }
    ctx.fillStyle = '#c94f2e';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.55, s * 0.9, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'telur') {
    ctx.fillStyle = prep === 'chopped' ? '#ffe9a8' : '#fffdf5';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.95, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = prep === 'burnt' ? '#3a2c1c' : '#ff9f1c';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'ayam') {
    ctx.fillStyle = prep === 'burnt' ? '#3a2c1c' : '#d97b4f';
    ctx.beginPath();
    ctx.ellipse(-s * 0.15, -s * 0.1, s * 0.7, s * 0.55, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3e0';
    ctx.lineWidth = s * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * 0.25);
    ctx.lineTo(s * 0.9, s * 0.7);
    ctx.stroke();
  } else if (kind === 'sayur') {
    ctx.fillStyle = prep === 'burnt' ? '#3a3a22' : '#7ec850';
    for (let i = 0; i < 3; i += 1) {
      const angle = -Math.PI / 2 + (i - 1) * 0.7;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * s * 0.45, Math.sin(angle) * s * 0.45, s * 0.5, s * 0.28, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = prep === 'burnt' ? '#2c2c14' : '#4e9a2e';
    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'kecap') {
    ctx.fillStyle = prep === 'burnt' ? '#2a1a10' : '#6b3f1d';
    roundRect(ctx, -s * 0.35, -s * 0.7, s * 0.7, s * 1.1, s * 0.15);
    ctx.fill();
    ctx.fillRect(-s * 0.18, -s * 1.0, s * 0.36, s * 0.35);
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(-s * 0.35, -s * 0.25, s * 0.7, s * 0.4);
  } else if (kind === 'dish') {
    drawPlateIcon(ctx, 0, 0, size);
  }
  ctx.restore();
}

function drawPlateIcon(ctx, x, y, size) {
  const s = size / 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f5b942';
  ctx.beginPath();
  ctx.arc(x - s * 0.3, y - s * 0.1, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7ec850';
  ctx.beginPath();
  ctx.arc(x + s * 0.35, y + s * 0.15, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff8a5c';
  ctx.beginPath();
  ctx.arc(x + s * 0.1, y - s * 0.35, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawSteam(ctx, x, y, t) {
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const offset = Math.sin(t * 2 + i * 2) * 4;
    ctx.beginPath();
    ctx.moveTo(x - 14 + i * 14 + offset, y);
    ctx.quadraticCurveTo(x - 14 + i * 14 - offset, y - 10, x - 14 + i * 14 + offset, y - 18);
    ctx.stroke();
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = '#b98a5a';
  ctx.fillRect(0, 192, W, H - 192);
  ctx.fillStyle = '#a87a4e';
  const tile = 64;
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 20; col += 1) {
      if ((row + col) % 2 === 0) {
        ctx.fillRect(col * tile, 192 + row * tile, tile, tile);
      }
    }
  }
  ctx.fillStyle = '#8a6a4a';
  ctx.fillRect(0, 192, W, 6);
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = '#f5b942';
  ctx.fillRect(0, 92, W, 4);
  text(ctx, 'DAPUR PELANGI', 24, 34, 34, '#ffd94d', 'left', true);
  text(ctx, 'Dapur kecil, pesanan besar', 24, 66, 15, '#e8d9b0', 'left');
  text(ctx, 'SKOR  ' + state.score, 560, 34, 26, '#ffffff', 'left', true);
  text(ctx, 'KOIN  ' + state.coins, 560, 66, 16, '#ffd94d', 'left');
  let hearts = '';
  for (let i = 0; i < 3; i += 1) hearts += i < state.hearts ? '♥ ' : '♡ ';
  text(ctx, hearts, 800, 34, 28, '#ff6b6b', 'left', true);
  text(ctx, 'LEVEL ' + state.level, 800, 66, 16, '#ffffff', 'left');
  const minutes = Math.floor(state.shiftLeft / 60);
  const seconds = Math.floor(state.shiftLeft % 60);
  const shiftText = 'SHIFT ' + minutes + ':' + String(seconds).padStart(2, '0');
  const shiftColor = state.shiftLeft <= 30 ? '#ff6b6b' : '#ffffff';
  text(ctx, shiftText, 1010, 34, 26, shiftColor, 'left', true);
  text(ctx, state.combo > 1 ? 'KOMBO x' + state.combo : 'KOMBO —', 1010, 66, 16, '#ffd94d', 'left');
}

function drawOrderCard(ctx, order, x, y, w, h) {
  const urgent = order.timeLeft <= 12;
  ctx.fillStyle = urgent ? '#5c1f1f' : '#fff8e7';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#ff6b6b' : '#d9b36c';
  ctx.lineWidth = 3;
  ctx.stroke();
  const recipe = order.recipe;
  text(ctx, recipe.name.toUpperCase(), x + 12, y + 20, 17, urgent ? '#ffd9d9' : '#5a3a1a', 'left', true);
  const chipY = y + 50;
  recipe.needs.forEach((need, i) => {
    const parts = need.split(':');
    const chipX = x + 12 + i * 80;
    ctx.fillStyle = urgent ? '#7a2e2e' : '#f3e2b8';
    roundRect(ctx, chipX, chipY - 14, 76, 28, 8);
    ctx.fill();
    drawIngredientIcon(ctx, parts[0], parts[1], chipX + 14, chipY, 18);
    const label = parts[0] === 'nasi' ? 'Nasi' : parts[0] === 'mie' ? 'Mie' : parts[0] === 'telur' ? 'Telur' : parts[0] === 'ayam' ? 'Ayam' : parts[0] === 'sayur' ? 'Sayur' : 'Kecap';
    text(ctx, label, chipX + 26, chipY, 12, urgent ? '#ffffff' : '#5a3a1a', 'left', true);
  });
  const barW = w - 28;
  const frac = Math.max(0, order.timeLeft / order.timeMax);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, x + 14, y + h - 16, barW, 8, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7ec850' : frac > 0.25 ? '#f5b942' : '#ff6b6b';
  roundRect(ctx, x + 14, y + h - 16, barW * frac, 8, 4);
  ctx.fill();
  text(ctx, Math.ceil(order.timeLeft) + ' dtk', x + w - 14, y + 20, 16, urgent ? '#ffb3b3' : '#8a6a3a', 'right', true);
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(0, 96, W, 96);
  text(ctx, 'PAPAN PESANAN', 24, 120, 15, '#ffd94d', 'left', true);
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan — bersiaplah di dapur…', 200, 148, 18, '#e8d9b0', 'left');
    return;
  }
  const cardW = 258;
  const gap = 12;
  state.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, 200 + i * (cardW + gap), 106, cardW, 78);
  });
}

function drawStationBase(ctx, station, fill, stroke) {
  ctx.fillStyle = fill;
  roundRect(ctx, station.x, station.y, station.w, station.h, 10);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawProgressBar(ctx, station, t, below) {
  const need = station.item ? INGREDIENTS[station.item.kind].prepTime : 1;
  const frac = Math.min(1, station.progress / need);
  const barW = station.w - 20;
  const barX = station.x + 10;
  const barY = below ? station.y + station.h + 6 : station.y - 16;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, barX, barY, barW, 10, 5);
  ctx.fill();
  ctx.fillStyle = station.state === 'done' ? '#7ec850' : '#f5b942';
  roundRect(ctx, barX, barY, barW * frac, 10, 5);
  ctx.fill();
  if (station.state === 'done') {
    ctx.fillStyle = '#7ec850';
    ctx.beginPath();
    ctx.arc(station.x + station.w - 8, station.y + 8, 14, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, '✓', station.x + station.w - 8, station.y + 9, 16, '#ffffff', 'center', true);
  }
  if (station.state === 'burnt') {
    text(ctx, 'GOSONG!', station.x + station.w / 2, barY - 8, 15, '#ff6b6b', 'center', true);
  }
}

function drawStation(ctx, station, state, t) {
  const center = stationCenter(station);
  if (station.kind === 'crate') {
    drawStationBase(ctx, station, '#7a4a21', '#5a3413');
    ctx.fillStyle = '#a8763e';
    ctx.fillRect(station.x + 6, station.y + 6, station.w - 12, 18);
    drawIngredientIcon(ctx, station.ingredient, 'raw', center.x - 34, center.y + 8, 34);
    text(ctx, station.label, center.x + 6, center.y - 6, 17, '#ffffff', 'left', true);
    text(ctx, INGREDIENTS[station.ingredient].hint, center.x + 6, center.y + 16, 12, '#ffd9a0', 'left');
  } else if (station.kind === 'chop') {
    drawStationBase(ctx, station, '#d9b36c', '#a87a4e');
    text(ctx, 'TALENAN', center.x, station.y + 16, 14, '#5a3a1a', 'center', true);
    ctx.fillStyle = '#f3e2b8';
    roundRect(ctx, station.x + 12, station.y + 28, station.w - 24, 44, 6);
    ctx.fill();
    if (station.item) {
      drawIngredientIcon(ctx, station.item.kind, station.state === 'done' ? 'chopped' : 'raw', center.x, station.y + 50, 36);
      if (station.state === 'working') drawProgressBar(ctx, station, t);
      if (station.state === 'done') drawProgressBar(ctx, station, t);
    } else {
      text(ctx, 'taruh bahan di sini', center.x, station.y + 50, 12, '#8a6a3a', 'center');
    }
  } else if (station.kind === 'stove') {
    drawStationBase(ctx, station, '#4a4a55', '#2e2e38');
    text(ctx, 'KOMPOR', center.x, station.y + 16, 14, '#ffffff', 'center', true);
    ctx.fillStyle = '#2e2e38';
    ctx.beginPath();
    ctx.arc(center.x, station.y + 52, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = station.state === 'working' ? '#ff8a3c' : '#6a6a75';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (station.item) {
      drawIngredientIcon(ctx, station.item.kind, station.state === 'done' ? 'cooked' : 'raw', center.x, station.y + 52, 34);
      if (station.state === 'working') {
        // Uap naik ke atas kompor, bar kemajuan di bawahnya: label KOMPOR tetap bersih.
        drawSteam(ctx, center.x, station.y - 4, t);
        drawProgressBar(ctx, station, t, true);
      }
      if (station.state === 'done') drawProgressBar(ctx, station, t, true);
      if (station.state === 'burnt') drawProgressBar(ctx, station, t, true);
    }
  } else if (station.kind === 'plate') {
    drawStationBase(ctx, station, '#e8e0d0', '#b8a888');
    if (state.platedDish) {
      // Label dipendekkan saat hidangan jadi, supaya uap tidak menabrak teks.
      text(ctx, 'MEJA SAJI', station.x + 12, station.y + 14, 13, '#5a3a1a', 'left', true);
      drawPlateIcon(ctx, center.x, station.y + 44, 44);
      drawSteam(ctx, center.x, station.y + 18, t);
      text(ctx, state.platedDish.name + ' SIAP!', center.x + 40, station.y + 44, 16, '#2e7d32', 'left', true);
    } else {
      text(ctx, 'MEJA SAJI — rakit hidangan di sini', center.x, station.y + 14, 13, '#5a3a1a', 'center', true);
      if (state.plate.length > 0) {
      state.plate.forEach((item, i) => {
        const px = center.x - 60 + i * 55;
        drawPlateIcon(ctx, px, station.y + 44, 40);
        drawIngredientIcon(ctx, item.kind, item.prep, px, station.y + 44, 22);
      });
      text(ctx, state.plate.length + ' / 3 bahan', center.x + 90, station.y + 44, 14, '#5a3a1a', 'left');
    } else {
      drawPlateIcon(ctx, center.x, station.y + 44, 40);
      text(ctx, 'piring kosong', center.x + 40, station.y + 44, 14, '#8a6a3a', 'left');
      }
    }
  } else if (station.kind === 'serve') {
    drawStationBase(ctx, station, '#3f6fb5', '#2a4d80');
    text(ctx, 'JENDELA ANTAR', center.x, station.y + 14, 13, '#ffffff', 'center', true);
    if (state.serveShowcase) {
      const recipe = RECIPES.find((r) => r.id === state.serveShowcase);
      drawPlateIcon(ctx, center.x - 60, station.y + 44, 44);
      drawSteam(ctx, center.x - 80, station.y + 18, t);
      text(ctx, (recipe ? recipe.name : 'Hidangan') + ' SIAP DIANTAR', center.x - 28, station.y + 44, 16, '#ffffff', 'left', true);
    } else {
      text(ctx, 'antar hidangan jadi ke sini', center.x, station.y + 44, 14, '#cfe0ff', 'center');
    }
  } else if (station.kind === 'trash') {
    drawStationBase(ctx, station, '#6a6a6a', '#4a4a4a');
    text(ctx, '🗑', center.x, station.y + 30, 26, '#ffffff', 'center');
    text(ctx, 'Sampah', center.x, station.y + 56, 13, '#ffffff', 'center', true);
  }
}

function drawChef(ctx, chef, t) {
  const bob = Math.sin(t * 6) * 1.5;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Badan + celemek.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 6, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f6fb5';
  roundRect(ctx, -13, -2, 26, 22, 6);
  ctx.fill();
  // Kepala + topi koki.
  ctx.fillStyle = '#ffcf9e';
  ctx.beginPath();
  ctx.arc(0, -18, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-7, -30, 8, 0, Math.PI * 2);
  ctx.arc(0, -33, 9, 0, Math.PI * 2);
  ctx.arc(7, -30, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -32, 26, 6);
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.arc(-4.5, -18, 1.8, 0, Math.PI * 2);
  ctx.arc(4.5, -18, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (chef.holding) {
    ctx.save();
    ctx.translate(chef.x, chef.y - 46);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9b36c';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (chef.holding.kind === 'dish') {
      drawPlateIcon(ctx, 0, 0, 30);
    } else {
      drawIngredientIcon(ctx, chef.holding.kind, chef.holding.prep, 0, 0, 28);
    }
    ctx.restore();
  }
}

function drawHintBar(ctx, state) {
  // Strip tipis di tepi bawah layar, di bawah semua stasiun.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, 200, 698, 880, 20, 8);
  ctx.fill();
  text(ctx, state.hint || 'WASD / panah: jalan   •   E / Spasi: pakai stasiun   •   Klik: jalan ke titik itu', 640, 708, 13, '#ffffff', 'center');
}

function drawTitleScreen(ctx, state, t) {
  ctx.fillStyle = 'rgba(46,33,24,0.82)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'DAPUR PELANGI', 640, 190, 72, '#ffd94d', 'center', true);
  text(ctx, 'Dapur kecil, pesanan besar — masak cepat sebelum pelanggan pergi!', 640, 250, 22, '#ffffff', 'center');
  text(ctx, '1. Ambil bahan dari peti di atas', 640, 320, 20, '#ffe9b0', 'center');
  text(ctx, '2. Cincang di talenan, masak di kompor', 640, 352, 20, '#ffe9b0', 'center');
  text(ctx, '3. Rakit tiga bahan di Meja Saji jadi hidangan', 640, 384, 20, '#ffe9b0', 'center');
  text(ctx, '4. Antar ke Jendela Antar sebelum timer pesanan habis', 640, 416, 20, '#ffe9b0', 'center');
  text(ctx, 'Hati-hati: masakan yang kelamaan di kompor jadi gosong!', 640, 448, 18, '#ff9d9d', 'center');
  const pulse = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.globalAlpha = pulse;
  text(ctx, 'Tekan ENTER atau KLIK untuk mulai memasak', 640, 530, 26, '#ffffff', 'center', true);
  ctx.globalAlpha = 1;
  text(ctx, 'WASD / panah bergerak  •  E / Spasi memakai stasiun  •  3 hati  •  shift 3 menit', 640, 580, 16, '#e8d9b0', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(46,33,24,0.85)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'DAPUR TUTUP', 640, 220, 64, '#ffd94d', 'center', true);
  text(ctx, state.overReason || '', 640, 280, 22, '#ffffff', 'center');
  text(ctx, 'SKOR AKHIR: ' + state.score, 640, 350, 34, '#ffffff', 'center', true);
  text(ctx, 'Hidangan terantar: ' + state.served + '    •    Kombo terbaik: x' + state.bestCombo + '    •    Level: ' + state.level, 640, 400, 20, '#ffe9b0', 'center');
  text(ctx, 'Tekan ENTER atau KLIK untuk masak lagi', 640, 480, 24, '#ffffff', 'center', true);
}

export function renderGame(ctx, state, t) {
  ctx.clearRect(0, 0, W, H);
  drawFloor(ctx);
  for (const station of state.stations) drawStation(ctx, station, state, t);
  drawChef(ctx, state.chef, t);
  drawOrderBoard(ctx, state);
  drawHud(ctx, state);
  if (state.screen === 'playing') drawHintBar(ctx, state);
  if (state.screen === 'title') drawTitleScreen(ctx, state, t);
  if (state.screen === 'over') drawGameOver(ctx, state);
}

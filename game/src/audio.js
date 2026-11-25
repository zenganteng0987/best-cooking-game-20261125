// audio.js — bunyi sederhana dari WebAudio (oscillator saja, tanpa file).
// AudioContext baru dibuat setelah gestur pertama, sesuai aturan browser.

let audioContext = null;
let muted = false;

export function ensureAudio() {
  if (audioContext) {
    if (audioContext.state === 'suspended') audioContext.resume();
    return;
  }
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioContext = new Ctor();
  } catch (err) {
    audioContext = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function beep(freq, duration, type, volume, when) {
  if (!audioContext || muted) return;
  const start = audioContext.currentTime + (when || 0);
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume || 0.12, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playSound(name) {
  if (!audioContext || muted) return;
  if (name === 'pickup') beep(520, 0.08, 'triangle', 0.1);
  else if (name === 'place') beep(340, 0.1, 'triangle', 0.1);
  else if (name === 'chop') { beep(180, 0.06, 'square', 0.08); beep(220, 0.06, 'square', 0.08, 0.07); }
  else if (name === 'done') { beep(660, 0.12, 'sine', 0.12); beep(880, 0.16, 'sine', 0.12, 0.1); }
  else if (name === 'served') { beep(523, 0.12, 'sine', 0.14); beep(659, 0.12, 'sine', 0.14, 0.1); beep(784, 0.2, 'sine', 0.14, 0.2); }
  else if (name === 'expired') { beep(220, 0.25, 'sawtooth', 0.08); beep(160, 0.3, 'sawtooth', 0.08, 0.15); }
  else if (name === 'order') beep(440, 0.1, 'sine', 0.08);
  else if (name === 'burnt') { beep(140, 0.2, 'sawtooth', 0.1); beep(110, 0.25, 'sawtooth', 0.1, 0.12); }
  else if (name === 'trash') beep(200, 0.08, 'square', 0.07);
  else if (name === 'error') beep(150, 0.15, 'square', 0.09);
}

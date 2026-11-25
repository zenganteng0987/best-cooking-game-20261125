// input.js — keyboard (WASD / panah + E / Spasi) dan mouse (klik untuk jalan,
// klik stasiun dekat untuk memakai). Tidak ada sentuhan ke jaringan.

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    clickTarget: null, // {x, y} di koordinat kanvas 1280x720
    clickedStation: null,
    pressedUse: false,
    pressedStart: false,
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault();
    }
    if (key === 'e' || key === ' ') input.pressedUse = true;
    if (key === 'enter') input.pressedStart = true;
    input.keys.add(key);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });
  canvas.addEventListener('pointerdown', (event) => {
    input.clickTarget = canvasPoint(event);
    input.clickedStation = null;
  });

  return input;
}

// Arah gerak dari tombol yang sedang ditekan; {x, y} ternormalisasi.
export function moveDirection(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('a') || input.keys.has('arrowleft')) x -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) x += 1;
  if (input.keys.has('w') || input.keys.has('arrowup')) y -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) y += 1;
  if (x === 0 && y === 0) return { x: 0, y: 0 };
  const length = Math.sqrt(x * x + y * y);
  return { x: x / length, y: y / length };
}

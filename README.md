# Dapur Pelangi — Game Masak

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/zenganteng0987/best-cooking-game-20261125/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/zenganteng0987/best-cooking-game-20261125/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

Game masak top-down orisinal yang jalan offline di desktop Chrome: kamu koki di
dapur kecil **Dapur Pelangi**. Pesanan masuk lewat papan pesanan, kamu ambil bahan
dari peti, cincang di talenan, masak di kompor, rakit tiga bahan jadi hidangan di
Meja Saji, lalu antar ke Jendela Antar sebelum timer pesanan habis.

## Cara main

- **WASD / panah**: gerakkan koki. **Klik** di lantai: koki jalan ke titik itu.
- **E / Spasi** (atau klik stasiun saat dekat): pakai stasiun — ambil bahan,
  taruh di talenan/kompor, angkat hasil olahan, taruh ke piring, antar hidangan.
- **Klik stasiun** yang dekat juga langsung memakainya.
- Masakan yang kelamaan di kompor jadi **gosong** — buang ke tong sampah.
- Pesanan yang kehabisan waktu mengurangi **1 hati** (3 hati). Shift 3 menit:
  layani sebanyak mungkin pesanan, jaga kombo tetap naik.

## Resep

| Hidangan | Bahan |
| --- | --- |
| Nasi Emas | Nasi matang + Telur cincang + Kecap |
| Mie Pelangi | Mie rebus + Ayam cincang + Sayur cincang |
| Sup Ceria | Sayur cincang + Mie rebus + Telur cincang |
| Ayam Manis | Ayam cincang + Nasi matang + Kecap |
| Telur Pelangi | Telur cincang + Sayur cincang + Nasi matang |

Tiap level naik, pesanan datang lebih cepat dan resepnya lebih beragam. Skor =
harga hidangan + bonus kecepatan + bonus kombo.

## Main lokal

```sh
node serve.ts
```

Lalu buka http://localhost:8080.

## Struktur source

- `game/index.html` — halaman game
- `game/css/kitchen.css` — tampilan halaman
- `game/src/main.js` — state, loop game, gerak koki, uji mandiri
- `game/src/recipes.js` — bahan dan resep
- `game/src/kitchen.js` — denah dapur dan aksi stasiun
- `game/src/orders.js` — pesanan, timer, nyawa, level
- `game/src/render.js` — semua gambar canvas
- `game/src/input.js` — keyboard dan mouse
- `game/src/audio.js` — bunyi WebAudio
- `game/src/shots.js` — adegan deterministik untuk screenshot

Repo GitHub: `zenganteng0987/best-cooking-game-20261125`

Referral code make.fun: `7z4nfrpv`

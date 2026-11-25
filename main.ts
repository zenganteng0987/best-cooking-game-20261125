// main.ts — Dapur Pelangi: program penyerahan entry (Node 22, stdlib saja).
//
// Tugasnya satu: menyalin game/ dan screenshots/ dari repo ini ke direktori
// keluaran, lalu menulis dossier.json di sana dengan buildDossier dari
// vendor/makefun-game.ts (salinan kit yang tidak diubah).
//
// Di luar grader, direktori keluaran diganti lewat MAKEFUN_OUTPUT_DIR:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Di dalam grader, MAKEFUN_OUTPUT_DIR tidak disetel dan keluaran jatuh ke /output.
// Program ini deterministik: dua kali jalan menulis byte yang sama.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Folder repo ini: tempat main.ts berada.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Batas-batas yang dipakai buildDossier, sama dengan yang dipakai gate.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(source, target) {
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
// screenshots/ selalu ada di keluaran, walau repo belum punya gambar:
// bentuk /output tetap stabil dan buildDossier selalu menemukan foldernya.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
}

const dossierText = buildDossier(outputDir, dossierOptions);
writeFileSync(join(outputDir, 'dossier.json'), dossierText);

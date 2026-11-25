// recipes.js — bahan dan resep Dapur Pelangi.
// Setiap bahan punya satu cara olah: cincang di talenan, masak di kompor,
// atau langsung pakai (kecap). Resep adalah kombinasi tiga bahan olahan.

export const INGREDIENTS = {
  nasi: {
    id: 'nasi',
    name: 'Nasi',
    color: '#fff3c4',
    prep: 'cook',
    prepTime: 3.0,
    hint: 'Masak di kompor',
  },
  mie: {
    id: 'mie',
    name: 'Mie',
    color: '#ffd94d',
    prep: 'cook',
    prepTime: 3.0,
    hint: 'Rebus di kompor',
  },
  telur: {
    id: 'telur',
    name: 'Telur',
    color: '#fffdf5',
    prep: 'chop',
    prepTime: 2.5,
    hint: 'Cincang di talenan',
  },
  ayam: {
    id: 'ayam',
    name: 'Ayam',
    color: '#e8a06a',
    prep: 'chop',
    prepTime: 2.5,
    hint: 'Cincang di talenan',
  },
  sayur: {
    id: 'sayur',
    name: 'Sayur',
    color: '#7ec850',
    prep: 'chop',
    prepTime: 2.0,
    hint: 'Cincang di talenan',
  },
  kecap: {
    id: 'kecap',
    name: 'Kecap',
    color: '#8a5a2b',
    prep: 'none',
    prepTime: 0,
    hint: 'Langsung pakai',
  },
};

// Satu bahan olahan ditulis "bahan:hasil", contoh "nasi:cooked".
// Hasil olah: cooked (dari kompor), chopped (dari talenan), ready (kecap).
export const RECIPES = [
  {
    id: 'nasi-emas',
    name: 'Nasi Emas',
    needs: ['nasi:cooked', 'telur:chopped', 'kecap:ready'],
    price: 120,
    color: '#f5b942',
  },
  {
    id: 'mie-pelangi',
    name: 'Mie Pelangi',
    needs: ['mie:cooked', 'ayam:chopped', 'sayur:chopped'],
    price: 140,
    color: '#ff8a5c',
  },
  {
    id: 'sup-ceria',
    name: 'Sup Ceria',
    needs: ['sayur:chopped', 'mie:cooked', 'telur:chopped'],
    price: 130,
    color: '#7ec850',
  },
  {
    id: 'ayam-manis',
    name: 'Ayam Manis',
    needs: ['ayam:chopped', 'nasi:cooked', 'kecap:ready'],
    price: 150,
    color: '#d97b4f',
  },
  {
    id: 'telur-pelangi',
    name: 'Telur Pelangi',
    needs: ['telur:chopped', 'sayur:chopped', 'nasi:cooked'],
    price: 110,
    color: '#ffd94d',
  },
];

export function ingredientLabel(item) {
  if (!item) return '';
  if (item.kind === 'dish') {
    const recipe = RECIPES.find((r) => r.id === item.recipe);
    return recipe ? recipe.name : 'Hidangan';
  }
  const base = INGREDIENTS[item.kind];
  if (!base) return item.kind;
  if (item.prep === 'raw') return base.name + ' mentah';
  if (item.prep === 'chopped') return base.name + ' cincang';
  if (item.prep === 'cooked') return base.name + ' matang';
  if (item.prep === 'burnt') return base.name + ' gosong';
  return base.name;
}

export function itemKey(item) {
  return item.kind + ':' + item.prep;
}

// Apakah isi piring (array item) persis sama dengan kebutuhan resep?
export function plateMatchesRecipe(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const have = plate.map(itemKey).sort();
  const want = [...recipe.needs].sort();
  for (let i = 0; i < want.length; i += 1) {
    if (have[i] !== want[i]) return false;
  }
  return true;
}

export function findRecipeForPlate(plate) {
  for (const recipe of RECIPES) {
    if (plateMatchesRecipe(plate, recipe)) return recipe;
  }
  return null;
}

// Resep yang boleh muncul di level ini: awal hanya tiga resep pertama.
export function recipesForLevel(level) {
  if (level <= 1) return RECIPES.slice(0, 3);
  if (level === 2) return RECIPES.slice(0, 4);
  return RECIPES;
}

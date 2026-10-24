const fs = require('fs');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
const noms = [...new Set(JSON.parse(fs.readFileSync('mots.json', 'utf8')).map(norm))].filter(n => n.length >= 3 && n.length <= 8);
const KNOWN = 700; // les 700 noms les plus connus = réponses ; les autres = mots bonus
const cnt = s => { const c = new Array(26).fill(0); for (const ch of s) c[ch.charCodeAt(0) - 65]++; return c; };
const mask = c => c.reduce((m, v, i) => v ? m | (1 << i) : m, 0);
const rank = new Map(noms.map((n, i) => [n, i]));
const fame = w => w.reduce((a, n) => a + rank.get(n), 0) / w.length;
const info = noms.map(n => { const c = cnt(n); return { n, c, m: mask(c) }; });
const SEEDS = noms.slice(0, KNOWN);
const wheels = new Map();
const add = s => {
  if (s.length < 4 || s.length > 8) return;
  const k = s.split('').sort().join('');
  if (wheels.has(k)) return;
  const c = cnt(k), m = mask(c), all = [];
  for (const x of info) {
    if (x.m & ~m) continue;
    let ok = true;
    for (let i = 0; i < 26; i++) if (x.c[i] > c[i]) { ok = false; break; }
    if (ok) { all.push(x.n); if (all.length > 30) return; }
  }
  const known = all.filter(n => rank.get(n) < KNOWN).sort((a, b) => rank.get(a) - rank.get(b));
  if (known.length < 2) return;
  const w = known.slice(0, 8);
  const b = all.filter(n => !w.includes(n)).sort((a, b) => rank.get(a) - rank.get(b)).slice(0, 12);
  wheels.set(k, { w: w.sort((a, b) => a.length - b.length || a.localeCompare(b)), b });
};
for (const a of SEEDS) { add(a); for (const b of SEEDS) if (a < b && a.length + b.length <= 8) add(a + b); }
const MAX = 1000;
const quota = { 4: 80, 5: 140, 6: 260, 7: 260, 8: 260 };
const bySize = {};
for (const [k, v] of wheels) (bySize[k.length] = bySize[k.length] || []).push({ k, w: v.w, b: v.b });
const sample = (arr, q) => {
  arr.sort((x, y) => fame(x.w) - fame(y.w) || x.k.localeCompare(y.k));
  return arr.length <= q ? arr : Array.from({ length: q }, (_, i) => arr[Math.floor(i * arr.length / q)]);
};
let picked = [];
for (const s of [4, 5, 6, 7, 8]) picked = picked.concat(sample(bySize[s] || [], quota[s]).sort((x, y) => fame(x.w) - fame(y.w)));
if (picked.length < MAX) {
  const used = new Set(picked.map(p => p.k));
  const rest = [...wheels].filter(([k]) => !used.has(k)).map(([k, v]) => ({ k, w: v.w, b: v.b }));
  picked = picked.concat(sample(rest, MAX - picked.length)).sort((x, y) => x.k.length - y.k.length || fame(x.w) - fame(y.w));
}
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const levels = picked.slice(0, MAX).map((p, i) => {
  const r = rng(i + 1), l = p.k.split('');
  for (let j = l.length - 1; j > 0; j--) { const m = Math.floor(r() * (j + 1)); [l[j], l[m]] = [l[m], l[j]]; }
  return { l, w: p.w, b: p.b };
});
fs.writeFileSync('site/levels.json', JSON.stringify(levels));
const withB = levels.filter(v => v.b.length).length;
console.log(levels.length + ' niveaux (' + wheels.size + ' roues possibles, ' + noms.length + ' noms), ' + withB + ' avec mots bonus');

// Règle : la roue contient exactement les lettres du nom le plus long du niveau.
// Réponses = ce nom + les noms les plus connus formés avec ces lettres (8 max) ; le reste = mots bonus.
const fs = require('fs');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
const noms = [...new Set(JSON.parse(fs.readFileSync('mots.json', 'utf8')).map(norm))].filter(n => n.length >= 3 && n.length <= 8);
const cnt = s => { const c = new Array(26).fill(0); for (const ch of s) c[ch.charCodeAt(0) - 65]++; return c; };
const rank = new Map(noms.map((n, i) => [n, i]));
const fame = w => w.reduce((a, n) => a + rank.get(n), 0) / w.length;
const info = noms.map(n => ({ n, c: cnt(n) }));
const MAX = 1000, MAX_ANSWERS = 8, MAX_BONUS = 12, KNOWN = 700;
const seen = new Set(), cands = [];
for (const a of noms) {
  if (a.length < 4) continue;
  const k = a.split('').sort().join('');
  if (seen.has(k)) continue;
  seen.add(k);
  const c = cnt(k);
  const all = info.filter(x => x.c.every((v, i) => v <= c[i])).map(x => x.n);
  if (all.length < 2 || all.length > 40) continue;
  const full = all.filter(n => n.length === k.length);
  const rest = all.filter(n => n.length < k.length).sort((x, y) => rank.get(x) - rank.get(y));
  const known = rest.filter(n => rank.get(n) < KNOWN); // noms connus = réponses ; noms rares = mots bonus
  const w = full.concat((known.length ? known : rest).slice(0, Math.max(1, MAX_ANSWERS - full.length)));
  if (w.length < 2) continue;
  const b = all.filter(n => !w.includes(n)).sort((x, y) => rank.get(x) - rank.get(y)).slice(0, MAX_BONUS);
  w.sort((x, y) => x.length - y.length || x.localeCompare(y));
  cands.push({ k, w, b });
}
const picked = cands.sort((x, y) => fame(x.w) - fame(y.w)).slice(0, MAX)
  .sort((x, y) => x.k.length - y.k.length || fame(x.w) - fame(y.w));
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const levels = picked.map((p, i) => {
  const r = rng(i + 1), l = p.k.split('');
  for (let j = l.length - 1; j > 0; j--) { const m = Math.floor(r() * (j + 1)); [l[j], l[m]] = [l[m], l[j]]; }
  return { l, w: p.w, b: p.b };
});
fs.writeFileSync('site/levels.json', JSON.stringify(levels));
console.log(levels.length + ' niveaux, ' + levels.filter(v => v.b.length).length + ' avec mots bonus');

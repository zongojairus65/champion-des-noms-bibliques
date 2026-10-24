// Extrait les noms propres (personnes et lieux) d'une Bible française JSON -> mots.json
const fs = require('fs');
const bible = JSON.parse(fs.readFileSync(process.argv[2] || 'fr.json', 'utf8').replace(/^\uFEFF/, ''));
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
const cap = new Map(), low = new Set();
const isCap = w => /^[A-ZÉÈÊÀÂÎÔÛÇ][a-zéèêëàâîïôûùç-]+$/.test(w);
for (const b of bible) for (const ch of b.chapters) for (const v of ch) {
  const toks = v.replace(/[«»"“”()\[\]]/g, ' ').split(/\s+/).filter(Boolean);
  toks.forEach((t, i) => {
    const base = t.replace(/[.,;:!?]+$/, '').replace(/^(l'|d'|qu'|l’|d’)/i, '');
    if (!base) return;
    if (/^[a-zéèêëàâîïôûùç]/.test(base)) { low.add(base); return; }
    if (!isCap(base)) return;
    const prev = i > 0 ? toks[i - 1] : '';
    if (i === 0 || /[.!?:;]$/.test(prev)) return;
    cap.set(base, (cap.get(base) || 0) + 1);
  });
}
const stop = new Set(['Église', 'Chroniques', 'Pléiades', 'Urim', 'Mammon', 'Auguste', 'Évangile', 'Sabbat']);
const bad = /(iens|ites|éens|ite|ien|ienne|ines|ins|ens|ois|oises|ons|ards|éenne)$/;
const out = [];
const seen = new Set();
for (const [w] of [...cap.entries()].sort((a, b) => b[1] - a[1])) {
  if (low.has(w) || low.has(w.toLowerCase()) || stop.has(w) || bad.test(w)) continue;
  const n = norm(w);
  if (n.length < 3 || n.length > 8 || seen.has(n)) continue;
  seen.add(n); out.push(w);
  if (out.length >= 1500) break;
}
fs.writeFileSync('mots.json', JSON.stringify(out));
console.log(out.length + ' noms écrits dans mots.json');
console.log(out.slice(0, 40).join(', '));
console.log('...', out.slice(700, 730).join(', '));
console.log('...', out.slice(-25).join(', '));

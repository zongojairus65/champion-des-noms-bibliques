// Construit site/noms.json : pour chaque nom utilisé dans les niveaux -> nom affiché, premier verset, sens (si connu).
// Usage : node scripts/build-infos.js fr.json   (fr.json = Bible française au format thiagobodruk/bible)
const fs = require('fs');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
const LIVRES = { gn: 'Genèse', ex: 'Exode', lv: 'Lévitique', nm: 'Nombres', dt: 'Deutéronome', js: 'Josué', jud: 'Juges', rt: 'Ruth',
  '1sm': '1 Samuel', '2sm': '2 Samuel', '1kgs': '1 Rois', '2kgs': '2 Rois', '1ch': '1 Chroniques', '2ch': '2 Chroniques', ezr: 'Esdras', ne: 'Néhémie',
  et: 'Esther', job: 'Job', ps: 'Psaumes', prv: 'Proverbes', ec: 'Ecclésiaste', so: 'Cantique des cantiques', is: 'Ésaïe', jr: 'Jérémie',
  lm: 'Lamentations', ez: 'Ézéchiel', dn: 'Daniel', ho: 'Osée', jl: 'Joël', am: 'Amos', ob: 'Abdias', jn: 'Jonas', mi: 'Michée', na: 'Nahum',
  hk: 'Habacuc', zp: 'Sophonie', hg: 'Aggée', zc: 'Zacharie', ml: 'Malachie', mt: 'Matthieu', mk: 'Marc', lk: 'Luc', jo: 'Jean', act: 'Actes',
  rm: 'Romains', '1co': '1 Corinthiens', '2co': '2 Corinthiens', gl: 'Galates', eph: 'Éphésiens', ph: 'Philippiens', cl: 'Colossiens',
  '1ts': '1 Thessaloniciens', '2ts': '2 Thessaloniciens', '1tm': '1 Timothée', '2tm': '2 Timothée', tt: 'Tite', phm: 'Philémon', hb: 'Hébreux',
  jm: 'Jacques', '1pe': '1 Pierre', '2pe': '2 Pierre', '1jo': '1 Jean', '2jo': '2 Jean', '3jo': '3 Jean', jd: 'Jude', re: 'Apocalypse' };
const bible = JSON.parse(fs.readFileSync(process.argv[2] || 'fr.json', 'utf8').replace(/^\uFEFF/, ''));
const mots = JSON.parse(fs.readFileSync('mots.json', 'utf8'));
const sens = JSON.parse(fs.readFileSync('data/sens.json', 'utf8'));
const levels = JSON.parse(fs.readFileSync('site/levels.json', 'utf8'));
const used = new Set(); levels.forEach(v => { v.w.forEach(w => used.add(w)); v.b.forEach(w => used.add(w)); });
const display = new Map(); // NORM -> nom affiché (premier de la liste)
for (const m of mots) { const k = norm(m); if (used.has(k) && !display.has(k)) display.set(k, m); }
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SURCHARGE = { JOB: 'Job 1:1', DAN: 'Genèse 30:6' }; // quand le premier passage désigne autre chose
const out = {};
for (const [k, nom] of display) {
  const re = new RegExp('(^|[^A-Za-zÀ-ÿ])' + esc(nom) + '(?![A-Za-zÀ-ÿ])');
  let ref = null;
  outer: for (const b of bible) for (let c = 0; c < b.chapters.length; c++) for (let v = 0; v < b.chapters[c].length; v++)
    if (re.test(b.chapters[c][v])) { ref = LIVRES[b.abbrev] + ' ' + (c + 1) + ':' + (v + 1); break outer; }
  out[k] = { n: nom };
  if (SURCHARGE[k]) ref = SURCHARGE[k];
  if (ref) out[k].r = ref;
  if (sens[nom]) out[k].s = sens[nom];
}
fs.writeFileSync('site/noms.json', JSON.stringify(out));
const tot = Object.keys(out).length;
console.log(tot + ' noms, ' + Object.values(out).filter(x => x.r).length + ' avec verset, ' + Object.values(out).filter(x => x.s).length + ' avec sens');

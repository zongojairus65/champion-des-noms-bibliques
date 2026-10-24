const { Client } = require('pg');
const fs = require('fs');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
const can = (w, pool) => {
  const c = {};
  for (const ch of pool) c[ch] = (c[ch] || 0) + 1;
  for (const ch of w) { if (!c[ch]) return false; c[ch]--; }
  return true;
};
(async () => {
  const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();
  const { rows } = await db.query('select nom from mots');
  await db.end();
  const names = [...new Set(rows.map(r => norm(r.nom)))].filter(n => n.length >= 3);
  const mains = names.filter(n => n.length >= 5 && n.length <= 7).sort();
  const day = Math.floor(Date.now() / 864e5);
  const main = mains[day % mains.length];
  const words = names.filter(n => can(n, main)).sort((a, b) => a.length - b.length || a.localeCompare(b));
  const letters = main.split('').sort(() => Math.random() - 0.5);
  fs.writeFileSync('site/level.json', JSON.stringify({ date: new Date().toISOString().slice(0, 10), letters, words }));
  console.log('Niveau du jour :', main, words);
})();

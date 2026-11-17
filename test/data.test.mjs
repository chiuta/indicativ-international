import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as E from '../src/engine.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'data', 'packs');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const real = files.filter((f) => f !== 'example.json');
const pack = (f) => { const r = E.parsePackText(fs.readFileSync(path.join(DIR, f), 'utf8')); assert.ok(!r.error, f + ': ' + r.error); return r.pack; };
const practice = pack('zz-practice.json');
const html = read('index.html');
const app = JSON.parse(read('src/app.json'));
const pkg = JSON.parse(read('package.json'));

/** Obiectul JSON care începe la poziția i (acolada deschisă), ca text. */
function objectAt(text, i) {
  let depth = 0, str = false;
  for (let k = i; k < text.length; k++) {
    const c = text[k];
    if (str) { if (c === '\\') k++; else if (c === '"') str = false; continue; }
    if (c === '"') str = true; else if (c === '{') depth++; else if (c === '}' && --depth === 0) return text.slice(i, k + 1);
  }
  throw new Error('obiect neînchis');
}

test('fiecare fișier din data/packs este un pachet valid, numit după id (în afară de example.json), în forma canonică a motorului', () => {
  assert.ok(real.length >= 1 && files.includes('example.json'), files.join(', '));
  for (const f of files) {
    const text = fs.readFileSync(path.join(DIR, f), 'utf8');
    const p = pack(f);
    assert.deepEqual(E.validatePack(p), [], f);
    if (f !== 'example.json') assert.equal(f, p.id + '.json', 'numele fișierului este id-ul pachetului');
    assert.equal(text, JSON.stringify(E.canonicalPack(p), null, 2) + '\n', f + ': nu este în forma canonică (ordinea cheilor, indentare de 2 spații, rând nou la sfârșit)');
    assert.ok(!text.includes('\r') && !text.charCodeAt(0) !== 0xfeff, f + ': fără CR și fără BOM');
  }
});

test('example.json este un exemplu valid, marcat ca atare, și nu ajunge în pagină', () => {
  const ex = pack('example.json');
  assert.equal(ex.id, 'zz-example');
  assert.equal(ex.country, 'ZZ');
  assert.equal(ex.licence_class, 'example');
  assert.ok(ex.questions.length >= 2);
  const m = /var DATA=/.exec(html);
  assert.ok(m, 'pagina are DATA');
  const data = JSON.parse(objectAt(html, m.index + m[0].length));
  assert.ok(!('zz-example' in data));
});

test('pagina conține exact pachetele din data/packs (fără example.json), cu același conținut, iar numărătorile din app.json și package.json se potrivesc', () => {
  const m = /var DATA=/.exec(html);
  const data = JSON.parse(objectAt(html, m.index + m[0].length));
  assert.deepEqual(Object.keys(data).sort(), real.map((f) => f.replace(/\.json$/, '')).sort());
  for (const f of real) assert.deepEqual(data[f.replace(/\.json$/, '')], E.canonicalPack(pack(f)), f);
  assert.ok(html.length < 5000000, 'pagina are ' + html.length + ' octeți');
  assert.equal(app.version, pkg.version);
  assert.equal(app.data, 'data/packs');
  assert.match(app.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim(), 'indicativ-international.chiuta.ro');
  assert.equal(pkg.engines.node, '>=24');
});

test('pachetul de exersare: 50 de întrebări numerotate de la 1, șase materii, programă folosită în întregime, fără câmpuri de examen oficial', () => {
  const p = practice;
  assert.equal(p.id, 'zz-practice');
  assert.equal(p.country, 'ZZ');
  assert.equal(p.licence_class, 'practice');
  assert.equal(p.lang, 'en');
  assert.equal(p.exam, undefined, 'regulile unui examen real nu sunt inventate');
  assert.equal(p.questions.length, 50);
  assert.deepEqual(p.questions.map((q) => q.id), Array.from({ length: 50 }, (_, i) => 'ZZ-practice-' + String(i + 1).padStart(4, '0')));
  assert.equal(new Set(p.questions.map((q) => q.topic)).size, 6);
  const ids = p.syllabus.map((s) => s.id);
  assert.deepEqual(ids, ['1.1', '1.2', '2.1', '3.1', '4.1', '5.1', '6.1']);
  const used = new Set(p.questions.map((q) => q.syllabus_ref));
  assert.deepEqual([...used].sort(), ids.slice().sort(), 'fiecare punct al programei are cel puțin o întrebare, iar fiecare întrebare are un punct');
  for (const q of p.questions) {
    assert.equal(q.answers.length, 4, q.id);
    assert.ok(q.explanation && q.explanation.length >= 20, q.id + ': explicație');
    assert.equal(q.source, 'Original question written for this project (not from an official bank)', q.id);
    assert.equal(q.fixed_order, undefined, q.id);
  }
  assert.match(p.source, /AI assistant/);
  assert.match(p.source, /Not taken from any official question bank/);
  assert.match(p.source, /not reviewed by an examiner/);
  assert.equal(p.license, 'MIT');
});

test('pachetul de exersare: răspunsurile corecte sunt împărțite pe poziții și nu se trădează prin lungime', () => {
  const pos = [0, 0, 0, 0];
  let longest = 0, shortest = 0;
  for (const q of practice.questions) {
    pos[q.correct]++;
    const L = q.answers.map((a) => a.length), c = L[q.correct];
    if (c === Math.max(...L) && L.filter((x) => x === c).length === 1) longest++;
    if (c === Math.min(...L) && L.filter((x) => x === c).length === 1) shortest++;
  }
  for (const n of pos) assert.ok(n >= 9 && n <= 16, 'poziții: ' + pos.join(' '));
  assert.ok(longest <= 20, 'răspunsul corect este cel mai lung în ' + longest + ' din 50 de întrebări');
  assert.ok(shortest >= 3, 'răspunsul corect este cel mai scurt în ' + shortest + ' întrebări');
  assert.ok(longest >= 5, 'răspunsul corect este cel mai lung în ' + longest);
});

// răspunsurile numerice, recalculate aici independent de pachet, în unități SI: [valoarea, toleranță relativă = rotunjirea din text]
const CALC = {
  1: [11 / 220, 1e-9],                                                   // I = V / R (A)
  2: [13.8 * 2, 1e-9],                                                   // P = V · I (W)
  3: [100 + 150, 1e-9],                                                  // serie (Ω)
  4: [1 / (1 / 100 + 1 / 100), 1e-9],                                    // paralel (Ω)
  5: [(12 * 1000) / (3000 + 1000), 1e-9],                                // divizor de tensiune (V)
  6: [1 / (2 * Math.PI * 159 * 1e-6), 0.01],                             // X_C (Ω); răspunsul este «About 1 kΩ»
  7: [1 / (2 * Math.PI * Math.sqrt(10e-6 * 100e-12)), 0.002],            // f_0 (Hz)
  8: [10 * Math.log10(4), 0.005],                                        // dB
  9: [100 * Math.pow(10, -10 / 10), 1e-9],                               // fracția de putere (%)
  10: [(230 * 20) / 200, 1e-9],                                          // transformator (V)
  11: [Math.sqrt(100 * 50), 0.001],                                      // V_RMS (V)
  14: [299.792458 / 14.2, 0.01],                                         // λ (m)
  15: [299.792458 / 145, 0.04],                                          // λ (m); răspunsul este «About 2 m»
  21: [(299.792458 / 7.1 / 2) * 0.95, 0.005],                            // dipol (m); răspunsul este «About 20 m»
  23: [(1 + Math.sqrt(4 / 100)) / (1 - Math.sqrt(4 / 100)), 1e-9],       // SWR
  24: [3 + 2.15, 1e-9],                                                  // dBd → dBi
  25: [10 * Math.pow(10, 3 / 10), 0.005],                                // ERP (W); răspunsul este «About 20 W»
  33: [2 * 7.1e6, 1e-9]                                                  // a doua armonică (Hz)
};
const UNITS = { 'Ω': 1, 'kΩ': 1e3, 'MΩ': 1e6, mA: 1e-3, A: 1, mV: 1e-3, V: 1, kV: 1e3, mW: 1e-3, W: 1, kW: 1e3, Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, mm: 1e-3, cm: 1e-2, m: 1, km: 1e3, dB: 1, dBi: 1, dBd: 1, '%': 1 };
/** primul număr din text, înmulțit cu unitatea care îl urmează (mA, kΩ, MHz, cm …); null dacă nu e niciun număr */
const si = (s) => {
  const t = String(s).replace(/(\d)[   ](?=\d{3}\b)/g, '$1');
  const m = /(-?\d+(?:\.\d+)?)(?:[   ]+([^\s,;:.()]+))?/.exec(t);
  if (!m) return null;
  const u = m[2] && Object.prototype.hasOwnProperty.call(UNITS, m[2]) ? UNITS[m[2]] : 1;
  return parseFloat(m[1]) * u;
};

test('pachetul de exersare: răspunsurile calculate sunt recalculate aici și se potrivesc, iar celelalte variante diferă clar de ele', () => {
  assert.equal(Object.keys(CALC).length, 18);
  assert.equal(si('2 300 V'), 2300);
  assert.equal(si('15 000 Ω'), 15000);
  assert.equal(si('About 1 kΩ'), 1000);
  assert.equal(si('50 mA'), 0.05);
  assert.equal(si('5.03 MHz'), 5.03e6);
  assert.ok(Math.abs(si('About 70 cm') - 0.7) < 1e-12);
  assert.equal(si('1.5 : 1'), 1.5);
  assert.equal(si('No number here'), null);
  for (const [n, [value, tol]] of Object.entries(CALC)) {
    const q = practice.questions[n - 1];
    assert.equal(q.id, 'ZZ-practice-' + String(n).padStart(4, '0'));
    const right = si(q.answers[q.correct]);
    assert.ok(right !== null, q.id + ': răspunsul corect nu are număr');
    assert.ok(Math.abs(right - value) <= tol * Math.abs(value), q.id + ': în pachet ' + right + ', recalculat ' + value);
    q.answers.forEach((a, i) => {
      if (i === q.correct) return;
      const x = si(a);
      if (x === null) return;
      assert.ok(Math.abs(x - value) > 0.04 * Math.abs(value), q.id + ': varianta «' + a + '» este prea aproape de valoarea corectă ' + value);
    });
  }
  // întrebarea fără număr din aceeași familie: legea inversului pătratului
  const q48 = practice.questions[47];
  assert.match(q48.question, /double your distance/);
  assert.equal(q48.answers[q48.correct], 'It falls to one quarter');
  assert.equal(Math.pow(1 / 2, 2), 0.25);
});

test('formulele din text (_{…}, ^{…}) se descompun fără rest, iar desenele sunt acceptate și au descriere', () => {
  const texts = [];
  for (const q of practice.questions) { texts.push(q.question, q.explanation); q.answers.forEach((a) => texts.push(a)); }
  let marked = 0;
  for (const t of texts) {
    const parts = E.richParts(t);
    assert.equal(parts.map((x) => x.s).join(''), t.replace(/[_^]\{([^{}]+)\}/g, '$1'), 'se pierde text în «' + t + '»');
    for (const x of parts) if (x.k === 't') assert.ok(!/[_^]\{|[{}]/.test(x.s), 'marcaj rămas în «' + x.s + '»');
    marked += parts.filter((x) => x.k !== 't').length;
  }
  assert.ok(marked >= 15, marked + ' formule');
  const figs = practice.questions.filter((q) => q.figure);
  assert.deepEqual(figs.map((q) => q.id.slice(-4)), ['0005', '0028']);
  for (const q of figs) {
    assert.deepEqual(E.figureIssues(q.figure), [], q.id);
    assert.match(q.figure, /^<svg viewBox="/);
    assert.ok(q.figure_alt.length >= 40, q.id + ': descrierea desenului este prea scurtă');
    assert.match(q.question, /shown|figure/i, q.id + ': întrebarea trimite la desen');
  }
  // întrebările care trimit la un desen îl au (și invers)
  for (const q of practice.questions) assert.equal(/\b(shown|in the figure)\b/i.test(q.question), !!q.figure, q.id);
});

test('nicio întrebare nu se repetă (nici după normalizarea majusculelor și a diacriticelor), iar răspunsurile din aceeași întrebare sunt distincte', () => {
  for (const f of files) {
    const p = pack(f);
    const seen = new Map();
    for (const q of p.questions) {
      const k = E.fold(q.question) + '|' + q.answers.map(E.fold).sort().join('|');
      assert.ok(!seen.has(k), f + ': ' + q.id + ' repetă ' + seen.get(k));
      seen.set(k, q.id);
      assert.equal(new Set(q.answers.map(E.fold)).size, q.answers.length, q.id);
    }
    assert.equal(new Set(p.questions.map((q) => q.id)).size, p.questions.length, f + ': id-uri repetate');
  }
  // textele întrebărilor din pachetul de exersare diferă și ca prim cuvinte-cheie: nu există două întrebări identice cu o schimbare de cifră
  const heads = practice.questions.map((q) => E.fold(q.question).replace(/[0-9.,]+/g, '#'));
  assert.equal(new Set(heads).size, heads.length, 'două întrebări diferă doar prin cifre');
});

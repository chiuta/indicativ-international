import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as E from '../src/engine.mjs';
import I18N from '../src/i18n.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ui = fs.readFileSync(path.join(ROOT, 'src', 'ui.js'), 'utf8');
const eng = fs.readFileSync(path.join(ROOT, 'src', 'engine.mjs'), 'utf8');
const practice = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'packs', 'zz-practice.json'), 'utf8'));
const LANGS = ['ro', 'en', 'fr', 'de', 'es', 'it', 'hu', 'pt'];
const keys = Object.keys(I18N.en);
const ph = (s) => [...String(s).matchAll(/\{(\d)\}/g)].map((m) => +m[1]);
const copy = (x) => JSON.parse(JSON.stringify(x));

// Cheile folosite de ambalajul generat (meniu, titlu, buton de deschidere) și nu de ui.js.
const BUILDER = ['nav', 'title', 'open'];

function list(re, src) { const m = src.match(re); assert.ok(m, 'nu găsesc ' + re); return [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]); }
const TABS = list(/var TABS = \[([^\]]*)\]/, ui);

// familii de chei construite în ui.js din prefix + valoare («'tab_' + id»)
const FAMILIES = { tab_: TABS, gd_: [1, 2, 3, 4, 5], lim_: [1, 2, 3, 4, 5, 6] };
const familyKeys = [].concat(...Object.entries(FAMILIES).map(([p, vs]) => vs.map((v) => p + v)));
// chei cerute de motor (issueParts): textul erorii și numele locului
const ENGINE_KEYS = [...new Set([...eng.matchAll(/out\('([a-z_]+)'/g)].map((m) => m[1]).concat([...eng.matchAll(/lk = '([a-z_]+)'/g)].map((m) => m[1])))].sort();

/** Argumentele de la nivelul superior ale apelului care începe imediat după paranteza deschisă de la poziția i. */
function callArgs(src, i) {
  const args = []; let depth = 0, q = '', cur = '';
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (q) { cur += c; if (c === '\\') { cur += src[++k]; } else if (c === q) q = ''; continue; }
    if (c === "'" || c === '"') { q = c; cur += c; continue; }
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) { if (depth === 0) { args.push(cur.trim()); return args; } depth--; }
    if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  throw new Error('apel neînchis');
}

test('toate limbile au exact aceleași chei și aceiași substituenți {n}, fără texte goale', () => {
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(I18N[l]), keys, l + ': chei diferite');
    for (const k of keys) {
      assert.ok(typeof I18N[l][k] === 'string' && I18N[l][k].trim().length > 0, l + '/' + k + ': text gol');
      assert.deepEqual(ph(I18N[l][k]).sort(), ph(I18N.en[k]).sort(), l + '/' + k + ': substituenți diferiți');
    }
  }
  assert.deepEqual(Object.keys(I18N).sort(), LANGS.slice().sort());
  assert.ok(keys.length >= 160, keys.length + ' chei');
});

test('fiecare șir snake_case din ui.js este o cheie de traducere existentă (sau un prefix al unei familii de chei)', () => {
  const lits = [...new Set([...ui.matchAll(/'([a-z]+_[a-z0-9_]*)'/g)].map((m) => m[1]))];
  assert.ok(lits.length > 80, 'puține chei găsite: ' + lits.length);
  const prefixes = lits.filter((s) => s.endsWith('_'));
  assert.deepEqual(prefixes.sort(), Object.keys(FAMILIES).sort(), 'prefixele construite din cod sunt exact cele din FAMILIES');
  for (const k of lits.filter((s) => !s.endsWith('_'))) assert.ok(keys.includes(k), 'cheie lipsă în i18n: ' + k);
  // prefixele sunt folosite doar în apeluri L.t / L.f («L.t('tab_' + id)»)
  const pre = new Set([...ui.matchAll(/L\.[tf]\('([a-z_]+_)' \+/g)].map((m) => m[1]));
  assert.deepEqual([...pre].sort(), Object.keys(FAMILIES).sort());
});

test('familiile dinamice de chei (file, ghid, limite) sunt complete și nu au chei în plus', () => {
  assert.deepEqual(TABS, ['train', 'exam', 'packs', 'guide']);
  for (const k of familyKeys) assert.ok(keys.includes(k), 'lipsește ' + k);
  const extra = keys.filter((k) => /^(tab|gd|lim)_/.test(k) && !familyKeys.includes(k));
  assert.deepEqual(extra, ['gd_h'], 'ui.js afișează doar tab_<fila>, gd_1…gd_5 și lim_1…lim_6, plus titlul ghidului gd_h');
  assert.match(ui, /L\.t\('gd_h'\)/);
  for (const k of familyKeys) assert.deepEqual(ph(I18N.en[k]), [], k + ' nu are substituenți');
  // lungimea ghidului și a limitelor se potrivește cu ce afișează ui.js
  assert.match(ui, /\[1, 2, 3, 4, 5\]\.map\(function \(i\) \{ return h\('li', \{ text: L\.t\('gd_' \+ i\) \}\)/);
  assert.match(ui, /\[1, 2, 3, 4, 5, 6\]\.map\(funct/);
});

test('cheile cerute de motor (issueParts) există în toate limbile', () => {
  assert.ok(ENGINE_KEYS.length >= 18, ENGINE_KEYS.join(' '));
  for (const k of ENGINE_KEYS) assert.ok(keys.includes(k), 'lipsește cheia cerută de motor: ' + k);
  assert.deepEqual(ENGINE_KEYS.filter((k) => /^w_/.test(k)), ['w_exam', 'w_pack', 'w_q', 'w_syl']);
});

// toate codurile pe care le poate scoate motorul, extrase din cod, cu «<loc>:<ce>»
function catalogue() {
  const what = new Set(), codes = [];
  for (const m of eng.matchAll(/out\.push\(w \+ '([a-z_]+)'\)/g)) what.add(m[1]);
  for (const m of eng.matchAll(/q' \+ i \+ ':([a-z_]+)'/g)) what.add(m[1]);
  const figure = [...new Set([...eng.slice(eng.indexOf('export function parseFigure'), eng.indexOf('export function figureIssues')).matchAll(/add\('([a-z_]+)'\)/g)].map((m) => m[1]))];
  assert.ok(figure.length >= 10, 'coduri de desen: ' + figure.join(' '));
  figure.forEach((c) => what.add('figure_' + c));
  what.add('answer_0'); what.add('answer_5');
  for (const w of what) codes.push('q0:' + w, 'q41:' + w);
  for (const w of ['type', 'extra', 'id', 'dup', 'title']) codes.push('syllabus0:' + w, 'syllabus6:' + w);
  for (const m of eng.matchAll(/out\.push\('exam:([a-z_]+)'\)/g)) codes.push('exam:' + m[1]);
  for (const m of eng.matchAll(/out\.push\('pack:([a-z_]+)'\)/g)) codes.push('pack:' + m[1]);
  return { codes: [...new Set(codes)], figure };
}

test('fiecare cod de eroare al motorului se arată ca propoziție: cheile există, iar argumentele se potrivesc cu substituenții', () => {
  const { codes } = catalogue();
  assert.ok(codes.length > 60, codes.length + ' coduri');
  for (const c of codes) {
    const p = E.issueParts(c);
    assert.ok(typeof p === 'object' && p, c);
    assert.ok(keys.includes(p.tk), c + ': cheia ' + p.tk);
    assert.deepEqual(ph(I18N.en[p.tk]), p.ta === undefined ? [] : [0], c + ': ' + p.tk + ' cu argumentul ' + p.ta);
    if (p.lk) {
      assert.ok(keys.includes(p.lk), c + ': cheia ' + p.lk);
      assert.deepEqual(ph(I18N.en[p.lk]), p.la === undefined ? [] : [0], c + ': ' + p.lk + ' cu argumentul ' + p.la);
    } else assert.equal(typeof p.la, 'string', c + ': fără cheie de loc, locul e text');
    // locul: «Întrebarea 1» pentru q0, «Elementul 1» pentru syllabus0
    if (/^q[0-9]+:/.test(c)) { assert.equal(p.lk, 'w_q'); assert.equal(p.la, +/^q([0-9]+):/.exec(c)[1] + 1); }
    if (/^syllabus[0-9]+:/.test(c)) { assert.equal(p.lk, 'w_syl'); assert.equal(p.la, +/^syllabus([0-9]+):/.exec(c)[1] + 1); }
    if (/^pack:/.test(c)) { assert.equal(p.lk, 'w_pack'); assert.equal(p.la, undefined); }
    if (/^exam:/.test(c)) { assert.equal(p.lk, 'w_exam'); assert.equal(p.la, undefined); }
  }
  // nicio cheie «e_*» cerută de motor nu rămâne neatinsă de coduri
  const used = new Set(codes.map((c) => E.issueParts(c).tk));
  for (const k of ENGINE_KEYS.filter((x) => /^e_/.test(x))) assert.ok(used.has(k), 'cheia ' + k + ' nu este cerută de niciun cod');
});

test('codurile pe care validatePack le scoate chiar pe pachete stricate sunt cunoscute de issueParts, iar cele mai multe feluri de greșeli apar', () => {
  const mutate = (fn) => { const p = copy(practice); fn(p); return E.validatePack(p); };
  const cases = {
    'pack:format': (p) => { p.format = 'x'; },
    'pack:version': (p) => { p.version = 2; },
    'pack:id': (p) => { p.id = 'A B'; },
    'pack:title': (p) => { p.title = ''; },
    'pack:country': (p) => { p.country = 'x'; },
    'pack:licence_class': (p) => { p.licence_class = ''; },
    'pack:lang': (p) => { p.lang = 'EN'; },
    'pack:source': (p) => { p.source = ''; },
    'pack:source_url': (p) => { p.source_url = 'http://x'; },
    'pack:license': (p) => { p.license = ''; },
    'pack:extra': (p) => { p.extra = 1; },
    'pack:questions': (p) => { p.questions = []; },
    'pack:syllabus': (p) => { p.syllabus = 'x'; },
    'syllabus0:id': (p) => { p.syllabus[0].id = 'A B'; },
    'syllabus1:dup': (p) => { p.syllabus[1].id = p.syllabus[0].id; },
    'syllabus0:title': (p) => { p.syllabus[0].title = ''; },
    'syllabus0:extra': (p) => { p.syllabus[0].x = 1; },
    'syllabus0:type': (p) => { p.syllabus[0] = 5; },
    'exam:questions': (p) => { p.exam = { questions: 0, minutes: 10, pass_percent: 75, source: 's' }; },
    'exam:too_many': (p) => { p.exam = { questions: 51, minutes: 10, pass_percent: 75, source: 's' }; },
    'exam:minutes': (p) => { p.exam = { questions: 5, minutes: 0, pass_percent: 75, source: 's' }; },
    'exam:pass_percent': (p) => { p.exam = { questions: 5, minutes: 10, pass_percent: 101, source: 's' }; },
    'exam:wrong_penalty': (p) => { p.exam = { questions: 5, minutes: 10, pass_percent: 75, wrong_penalty: 2, source: 's' }; },
    'exam:source': (p) => { p.exam = { questions: 5, minutes: 10, pass_percent: 75, source: '' }; },
    'exam:extra': (p) => { p.exam = { questions: 5, minutes: 10, pass_percent: 75, source: 's', x: 1 }; },
    'q0:id': (p) => { p.questions[0].id = 'x'; },
    'q1:id_dup': (p) => { p.questions[1].id = p.questions[0].id; },
    'q0:topic': (p) => { p.questions[0].topic = ''; },
    'q0:question': (p) => { p.questions[0].question = ''; },
    'q0:answers': (p) => { p.questions[0].answers = ['x']; },
    'q0:answers_dup': (p) => { p.questions[0].answers[1] = p.questions[0].answers[0]; },
    'q0:answer_1': (p) => { p.questions[0].answers[1] = ''; },
    'q0:correct': (p) => { p.questions[0].correct = 9; },
    'q0:explanation': (p) => { p.questions[0].explanation = 5; },
    'q0:source': (p) => { p.questions[0].source = ''; },
    'q0:source_url': (p) => { p.questions[0].source_url = 'x'; },
    'q0:syllabus_ref': (p) => { p.questions[0].syllabus_ref = 'A B'; },
    'q0:syllabus_unknown': (p) => { p.questions[0].syllabus_ref = 'zz-nope'; },
    'q0:lang': (p) => { p.questions[0].lang = 'EN'; },
    'q0:fixed_order': (p) => { p.questions[0].fixed_order = 'x'; },
    'q0:extra': (p) => { p.questions[0].x = 1; },
    'q0:figure_alt_alone': (p) => { p.questions[0].figure_alt = 'x'; },
    'q0:type': (p) => { p.questions[0] = 5; }
  };
  const fig = practice.questions.find((q) => q.figure);
  const figureCases = {
    'q0:figure_root': (p) => { p.questions[0].figure = '<g></g>'; p.questions[0].figure_alt = 'x'; },
    'q0:figure_tag': (p) => { p.questions[0].figure = '<svg viewBox="0 0 10 10"><script></script></svg>'; p.questions[0].figure_alt = 'x'; },
    'q0:figure_alt': (p) => { p.questions[0].figure = fig.figure; }
  };
  for (const [want, fn] of Object.entries(Object.assign({}, cases, figureCases))) {
    const issues = mutate(fn);
    assert.ok(issues.includes(want), want + ' lipsește din ' + JSON.stringify(issues));
    for (const c of issues) { const p = E.issueParts(c); assert.ok(keys.includes(p.tk), c + ' → ' + p.tk); }
  }
  assert.ok(Object.keys(cases).length + Object.keys(figureCases).length >= 40);
  // un pachet stricat «din fabrică» nu strică issueParts
  for (const junk of [null, undefined, 5, '', ':', 'q:', 'q0', 'q-1:x', 'q99999999999999999999:x', '__proto__:x', 'q0:__proto__', 'exam:', 'pack:figure_']) assert.doesNotThrow(() => E.issueParts(junk), String(junk));
});

test('nicio cheie nu rămâne nefolosită (nici în ui.js, nici în motor, nici din familii, nici în ambalaj)', () => {
  const used = new Set(BUILDER.concat(familyKeys, ENGINE_KEYS));
  for (const m of ui.matchAll(/'([a-z]+_[a-z0-9_]*)'/g)) used.add(m[1]);
  for (const m of ui.matchAll(/L\.[tf]\('([a-z_0-9]+)'/g)) used.add(m[1]);
  const orphan = keys.filter((k) => !used.has(k));
  assert.deepEqual(orphan, []);
  const unknown = familyKeys.concat(ENGINE_KEYS).filter((k) => !keys.includes(k));
  assert.deepEqual(unknown, []);
  for (const k of BUILDER) assert.ok(keys.includes(k) && !/_/.test(k), k);
});

test('apelurile L.f dau cel puțin atâtea argumente câți substituenți are textul, iar L.t nu se folosește pe texte cu substituenți', () => {
  let nf = 0, nt = 0;
  for (const m of ui.matchAll(/L\.([tf])\('([a-z_0-9]+)'/g)) {
    const kind = m[1], key = m[2];
    if (!keys.includes(key)) continue;  // prefixe de chei construite, verificate mai sus
    const rest = callArgs(ui, m.index + m[0].length);
    const given = rest.filter((x) => x !== '').length;
    const need = Math.max(-1, ...ph(I18N.en[key]));
    if (kind === 'f') { nf++; assert.ok(given >= need + 1 && given >= 1, 'L.f(' + key + '): ' + given + ' argumente, ' + (need + 1) + ' necesare'); }
    else { nt++; assert.ok(need < 0, 'L.t(' + key + ') folosit pe un text cu substituenți'); }
  }
  assert.ok(nf >= 8 && nt >= 50, nf + ' apeluri L.f, ' + nt + ' apeluri L.t');
  // cheile care au substituenți se afișează doar cu L.f (nu rămâne «{0}» pe ecran)
  const withPh = keys.filter((k) => ph(I18N.en[k]).length);
  assert.ok(withPh.length >= 20, withPh.length + ' chei cu substituenți');
  for (const k of withPh) {
    const viaT = new RegExp("L\\.t\\('" + k + "'").test(ui);
    assert.ok(!viaT, k + ' are substituenți și este afișat cu L.t');
  }
});

test('traducerile nu conțin caractere de control, spații duble sau la capete, nici sedilă în română', () => {
  for (const l of LANGS) for (const k of keys) {
    const s = I18N[l][k];
    assert.ok(!/[\u0000-\u001f\u007f]/.test(s), l + '/' + k + ': caractere de control');
    assert.ok(!/ {2,}/.test(s), l + '/' + k + ': spații duble');
    assert.equal(s, s.trim(), l + '/' + k + ': spații la capete');
    assert.ok(!/[<>]/.test(s), l + '/' + k + ': «<» sau «>» în text');
  }
  for (const k of keys) assert.ok(!/[şţŞŢ]/.test(I18N.ro[k]), 'ro/' + k + ': sedilă');
});

test('numele filelor sunt scurte (încap pe 360 px în opt limbi) și distincte, iar numele butoanelor principale sunt distincte între ele', () => {
  for (const l of LANGS) {
    const names = TABS.map((t) => I18N[l]['tab_' + t]);
    assert.equal(new Set(names).size, TABS.length, l + ': nume repetate ' + names.join(', '));
    for (const n of names) assert.ok(n.length <= 22, l + ': nume prea lung: ' + n);
    const act = ['t_start', 'x_start', 'i_go', 'g_dl', 'g_load', 'x_finish', 'p_export', 'p_reset', 'p_remove', 'x_flag', 'x_clear'].map((k) => I18N[l][k]);
    assert.equal(new Set(act).size, act.length, l + ': butoane cu același nume ' + act.join(', '));
    for (const a of act) assert.ok(a.length <= 40, l + ': buton prea lung: ' + a);
  }
});

test('textele de confirmare sunt diferite de textele butoanelor pe care le confirmă', () => {
  for (const l of LANGS) for (const [a, b] of [['p_reset', 'p_reset_sure'], ['p_remove', 'p_remove_sure'], ['x_finish', 'x_sure_go']]) {
    assert.notEqual(I18N[l][a], I18N[l][b], l + ': ' + a + ' = ' + b);
  }
});

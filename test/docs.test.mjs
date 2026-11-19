import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as E from '../src/engine.mjs';
import I18N from '../src/i18n.mjs';
import { convert } from '../scripts/import_csv.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const LANGS = ['en', 'ro', 'fr', 'it', 'es', 'pt', 'de', 'hu'];
const sfx = (l) => (l === 'en' ? '' : '.' + l);
const GUIDES = ['pack-format', 'contributor-guide', 'verify-against-official-bank'];
const guide = (g, l) => read('docs/' + g + (l === 'ro' ? '.ro' : '') + '.md');
const pkg = JSON.parse(read('package.json'));
const app = JSON.parse(read('src/app.json'));
// ghilimelele cu care generatorul de documentație citează numele din interfață, pe limbi
// căi folosite ca exemplu în ghiduri (fișiere pe care le-ar scrie comenzile din ghid), care nu există în depozit
const EXAMPLE_PATHS = new Set(['data/packs/hu-ham-a.json']);
const QU = { en: ['“', '”'], ro: ['«', '»'], fr: ['« ', ' »'], it: ['«', '»'], es: ['«', '»'], pt: ['«', '»'], de: ['„', '“'], hu: ['„', '”'] };

// Blocuri de cod, fără comentariile de la sfârșitul rândurilor (ele sunt scrise în limba ghidului).
function blocks(t) { return [...t.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].map((m) => ({ info: m[1].trim(), body: m[2].split('\n').map((l) => l.replace(/\s+#.*$/, '')).join('\n') })); }
const h2 = (t) => (t.match(/^## /gm) || []).length;
// numerele dintr-un text, cu separatorul miilor eliminat (1,000 · 1 000 · 1.000)
const numbers = (t) => [...t.replace(/(\d)[ ,.  ](?=\d{3}(?!\d))/g, '$1').matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
// în ghidul în română se traduc textele dintre ghilimele duble dintr-o comandă (titlul, sursa) și locurile de completat («<id-pachet>»); opțiunile și fișierele rămân aceleași
const norm = (t) => t.replace(/"[^"\n]*"/g, '""').replace(/<[^<>\n]*>/g, '<>');
const isCommandBlock = (b) => b.body.split('\n').filter(Boolean).every((l) => /^(node|python3|npm|pip|sha256sum|\s+--)/.test(l));
const marks = (l) => (l.match(/</g) || []).length;
const isJsonBlock = (b) => b.info === 'json' || /^\s*[{"]/.test(b.body);
const parseBlock = (b) => { const t = b.body.trim(); return JSON.parse(t.startsWith('{') ? t : '{' + t + '}'); };
/** structura unui JSON: aceleași chei și tipuri, textele înlocuite cu «s» (exemplele din ghidul în română sunt traduse) */
const shape = (v) => (Array.isArray(v) ? v.map(shape) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).map((k) => [k, shape(v[k])])) : typeof v === 'string' ? 's' : v);
const tally = (a) => a.reduce((m, x) => { m[x] = (m[x] || 0) + 1; return m; }, {});
/** cuvintele unei comenzi de shell, cu ghilimele duble păstrate ca un singur cuvânt */
function words(cmd) { return [...cmd.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => (m[1] !== undefined ? m[1] : m[2])); }
/** comenzile «node scripts/…» și «python3 scripts/…» din blocurile de cod, cu rândurile continuate prin «\» unite */
function commands(t) {
  const out = [];
  for (const b of blocks(t)) for (const c of b.body.replace(/\\\n\s*/g, ' ').split('\n')) if (/^(node|python3) scripts\//.test(c.trim())) out.push(c.trim());
  return out;
}

test('ghidurile există în engleză și română, au aceleași comenzi, aceleași secțiuni, aceeași versiune și trimit unul la altul', () => {
  for (const g of GUIDES) {
    const en = guide(g, 'en'), ro = guide(g, 'ro');
    const be = blocks(en), br = blocks(ro);
    assert.equal(be.length, br.length, g + ': numărul de blocuri de cod');
    be.forEach((x, i) => {
      const where = g + ': blocul de cod ' + (i + 1);
      assert.equal(x.info, br[i].info, where);
      if (isJsonBlock(x)) assert.deepEqual(shape(parseBlock(x)), shape(parseBlock(br[i])), g + ': structura blocului JSON ' + (i + 1));
      else if (isCommandBlock(x)) assert.deepEqual(norm(x.body), norm(br[i].body), where);
      else assert.deepEqual(x.body.split('\n').map(marks), br[i].body.split('\n').map(marks), where + ' (șablon: același număr de rânduri și de locuri de completat)');
    });
    assert.equal(h2(en), h2(ro), g + ': numărul de secțiuni');
    assert.ok(h2(en) >= 5, g + ': ' + h2(en) + ' secțiuni');
    const head = /^(Version|Versiune): (\d+\.\d+\.\d+) · (Last updated|Ultima actualizare): (\d{4}-\d{2}-\d{2}) · \[(Română|English)\]\(([a-z.-]+\.md)\)$/m;
    const a = head.exec(en), b = head.exec(ro);
    assert.ok(a && b, g + ': linia de versiune');
    assert.deepEqual([a[1], a[3], a[5], a[6]], ['Version', 'Last updated', 'Română', g + '.ro.md']);
    assert.deepEqual([b[1], b[3], b[5], b[6]], ['Versiune', 'Ultima actualizare', 'English', g + '.md']);
    assert.equal(a[2], pkg.version); assert.equal(b[2], pkg.version);
    assert.equal(a[4], app.updated); assert.equal(b[4], app.updated);
    assert.match(en, /^# .+ · INDICATIV International$/m); assert.match(ro, /^# .+ · INDICATIV International$/m);
  }
});

test('exemplele JSON din ghidul de format sunt corecte în engleză și în română: pachetul minimal este valid, regulile de examen și programa se potrivesc cu el', () => {
  for (const l of ['en', 'ro']) {
    const js = blocks(guide('pack-format', l)).filter(isJsonBlock).map(parseBlock);
    assert.equal(js.length, 3, l);
    const [minimal, exam, syllabus] = js;
    assert.deepEqual(E.validatePack(minimal), [], l + ': pachetul minimal din ghid');
    assert.ok(minimal.questions.length >= 1);
    // regulile de examen din ghid, pe un pachet cu destule întrebări
    const big = JSON.parse(JSON.stringify(minimal));
    big.questions = Array.from({ length: 60 }, (_, i) => Object.assign({}, minimal.questions[0], { id: 'ZZ-guide-' + String(i + 1).padStart(4, '0'), question: 'Question number ' + (i + 1) + '?' }));
    assert.deepEqual(E.validatePack(Object.assign({}, big, exam)), [], l + ': regulile de examen din ghid');
    assert.ok(exam.exam.questions <= 60);
    // programa din ghid: elementele sunt valide, iar o întrebare le poate cita
    const withSyl = JSON.parse(JSON.stringify(minimal));
    withSyl.syllabus = syllabus.syllabus;
    withSyl.questions[0].syllabus_ref = syllabus.syllabus[0].id;
    assert.deepEqual(E.validatePack(withSyl), [], l + ': programa din ghid');
  }
});

test('ghidurile au aceleași numere în engleză și în română, iar limitele din ghidul de format sunt cele din motor', () => {
  for (const g of GUIDES) assert.deepEqual(tally(numbers(guide(g, 'en'))), tally(numbers(guide(g, 'ro'))), g);
  const pf = guide('pack-format', 'en'), L = E.LIMITS;
  const set = new Set(numbers(pf));
  for (const [k, v] of Object.entries(L)) assert.ok(set.has(String(v)), 'limita ' + k + ' = ' + v + ' nu apare în ghidul de format');
  const must = [
    ['at most ' + L.pack_id + ' characters', 'id-ul pachetului'], ['at most ' + L.title + ' characters', 'titlul'], ['1 to ' + L.questions + ' questions', 'întrebările'],
    [L.answers_min + ' to ' + L.answers_max + ' answers', 'răspunsurile'], ['at most ' + L.question + ' characters', 'întrebarea'], ['at most ' + L.answer + ' characters', 'răspunsul'],
    ['at most ' + L.explanation + ' characters', 'explicația'], ['at most ' + L.figure_nodes + ' elements and ' + L.figure_depth + ' levels deep', 'desenul'],
    [L.packs + ' imported packs at once', 'pachetele importate'], ['3,000,000 characters', 'importul'], ['4,000,000 characters', 'spațiul din browser']
  ];
  assert.equal(L.import_chars, 3000000); assert.equal(L.store_chars, 4000000);
  for (const [phrase, what] of must) assert.ok(pf.includes(phrase), 'ghidul de format nu spune «' + phrase + '» (' + what + ')');
  assert.ok(new RegExp('(^|[^0-9])' + String(L.exam_questions) + '([^0-9]|$)').test(pf) && new RegExp('(^|[^0-9])' + String(L.exam_minutes) + '([^0-9]|$)').test(pf), 'limitele examenului');
  // regulile implicite ale simulatorului și programul de repetare, cum sunt în cod
  assert.deepEqual(E.DEFAULT_EXAM, { questions: 20, minutes: 30, pass_percent: 75, wrong_penalty: 0 });
  assert.deepEqual(E.INTERVALS, [0, 1, 3, 7, 14, 30]);
  assert.match(read('README.md'), /after 1, 3, 7, 14 and 30 days/);
});

test('comenzile din ghiduri există și își folosesc opțiunile reale; comanda de import din ghid rulează cu --check pe un fișier CSV', () => {
  const cmds = [];
  for (const g of GUIDES) for (const l of ['en', 'ro']) for (const c of commands(guide(g, l))) cmds.push({ g, l, c });
  assert.ok(cmds.length >= 8, cmds.length + ' comenzi');
  for (const { g, l, c } of cmds) {
    const w = words(c);
    const script = w[1];
    assert.ok(exists(script), g + '/' + l + ': lipsește ' + script);
    const src = read(script);
    for (const o of w.filter((x) => /^--[a-z-]+$/.test(x))) assert.ok(src.includes(o), g + '/' + l + ': opțiunea ' + o + ' nu există în ' + script);
  }
  // fiecare script din scripts/ este descris în ghidul de contribuție
  const cg = guide('contributor-guide', 'en');
  for (const s of ['validate.py', 'import_csv.mjs', 'pack_report.mjs', 'build.mjs']) assert.ok(cg.includes('scripts/' + s), 'ghidul de contribuție nu pomenește scripts/' + s);
  // comanda de import, exact cum e scrisă în ghid
  const imp = commands(cg).find((c) => c.startsWith('node scripts/import_csv.mjs questions.csv'));
  assert.ok(imp, 'comanda de import');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'indicativ-docs-'));
  const csv = path.join(dir, 'questions.csv');
  fs.writeFileSync(csv, 'question,a,b,c,d,correct,topic\n"Hány ohm egy kilóohm?",1,10,100,1000,D,Alapok\n"Mi az Ohm törvénye?",U=I·R,U=I/R,U=R/I,U=I+R,A,Alapok\n');
  const w = words(imp).slice(2).map((x) => (x === 'questions.csv' ? csv : x)).concat(['--check']);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'import_csv.mjs'), ...w], { encoding: 'utf8', cwd: dir });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stderr, /ok: 2 question\(s\), nothing written/);
  assert.deepEqual(fs.readdirSync(dir), ['questions.csv'], '--check nu scrie nimic');
});

test('coloanele din tabelul ghidului de contribuție sunt exact cele pe care importatorul le acceptă', () => {
  for (const l of ['en', 'ro']) {
    const t = guide('contributor-guide', l);
    const table = t.slice(t.indexOf('|'), t.indexOf('\n\n', t.indexOf('|')));
    const names = [...table.split('\n').slice(2).map((r) => r.split('|')[1] || '').join(' ').matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
    assert.deepEqual(names.slice().sort(), ['a', 'b', 'c', 'd', 'e', 'f', 'correct', 'explanation', 'figure', 'figure_alt', 'fixed_order', 'id', 'question', 'source', 'source_url', 'syllabus_ref', 'topic'].sort(), l);
    const row = { question: 'Q?', a: 'A1', b: 'B1', c: 'C1', d: 'D1', e: 'E1', f: 'F1', correct: 'F', topic: 'T', explanation: 'Because.', source_url: 'https://example.org/x', syllabus_ref: '', figure: '', figure_alt: '', source: 'S', fixed_order: 'yes', id: '' };
    const csv = names.map((n) => n).join(',') + '\n' + names.map((n) => row[n]).join(',') + '\n';
    const r = convert(csv, { id: 'xx-test', title: 'T', country: 'XX', licence_class: 'A', lang: 'en', source: 'S', license: 'MIT' }, false);
    assert.deepEqual(r.problems, [], l);
    assert.equal(r.pack.questions[0].answers.length, 6);
    assert.equal(r.pack.questions[0].correct, 5);
    assert.equal(r.pack.questions[0].fixed_order, true);
  }
});

test('căile din README, CONTRIBUTING, ghiduri și șabloane există, iar legăturile relative duc la fișiere existente', () => {
  const texts = [];
  for (const l of LANGS) for (const b of ['README', 'CONTRIBUTING', 'ISSUES_GOOD_FIRST']) texts.push([b + sfx(l) + '.md', read(b + sfx(l) + '.md')]);
  for (const g of GUIDES) for (const l of ['en', 'ro']) texts.push(['docs/' + g + (l === 'ro' ? '.ro' : '') + '.md', guide(g, l)]);
  for (const f of ['.github/ISSUE_TEMPLATE/new-entry.md', '.github/PULL_REQUEST_TEMPLATE.md']) texts.push([f, read(f)]);
  let nPaths = 0, nLinks = 0;
  for (const [name, t] of texts) {
    for (const m of t.matchAll(/`((?:docs|scripts|data|src|test)\/[A-Za-z0-9_.\-/]+|schema\.json|good-first-issues\.txt|index\.html)`/g)) {
      if (EXAMPLE_PATHS.has(m[1])) continue;
      nPaths++;
      assert.ok(exists(m[1]), name + ': lipsește ' + m[1]);
    }
    const base = path.dirname(name);
    for (const m of t.matchAll(/\]\(([^)#\s]+)\)/g)) {
      if (/^https?:/.test(m[1])) continue;
      nLinks++;
      assert.ok(fs.existsSync(path.join(ROOT, base, m[1])), name + ': legătura ' + m[1] + ' nu duce nicăieri');
    }
  }
  assert.ok(nPaths >= 80 && nLinks >= 100, nPaths + ' căi, ' + nLinks + ' legături');
  // șabloanele de căi cu <…> trimit la directoare care există
  assert.ok(exists('data/packs') && exists('docs') && exists('scripts'));
});

test('README, CONTRIBUTING, CHANGELOG și ISSUES_GOOD_FIRST au aceeași versiune și dată în toate cele opt limbi', () => {
  assert.equal(pkg.version, app.version);
  assert.equal(pkg.version, '0.2.1');
  const WORD = { en: ['Version', 'Last updated'], ro: ['Versiune', 'Ultima actualizare'] };
  for (const l of LANGS) {
    for (const base of ['README', 'CONTRIBUTING']) {
      const t = read(base + sfx(l) + '.md');
      const m = t.match(/^(.+?): (\d+\.\d+\.\d+) · (.+?): (\d{4}-\d{2}-\d{2})$/m);
      assert.ok(m, base + sfx(l) + ': linia de versiune');
      assert.equal(m[2], pkg.version, base + sfx(l)); assert.equal(m[4], app.updated, base + sfx(l));
      if (WORD[l]) assert.deepEqual([m[1], m[3]], WORD[l], base + sfx(l));
    }
    const c = read('CHANGELOG' + sfx(l) + '.md');
    assert.ok(c.includes('## [' + pkg.version + '] - ' + app.updated), 'CHANGELOG' + sfx(l));
    assert.ok(c.indexOf('## [Unreleased]') < c.indexOf('## [' + pkg.version + ']') && c.indexOf('## [' + pkg.version + ']') < c.indexOf('## [0.1.0]'), 'CHANGELOG' + sfx(l) + ': ordinea versiunilor');
  }
});

test('README: adresa, legăturile spre ghiduri și scripturi, cerințele (ES2017, Node.js 24), cifrele și numele din interfață, în toate limbile', () => {
  for (const l of LANGS) {
    const t = read('README' + sfx(l) + '.md');
    assert.ok(t.includes('https://indicativ-international.chiuta.ro'), l);
    for (const f of ['docs/pack-format', 'docs/contributor-guide', 'docs/verify-against-official-bank', 'scripts/validate.py', 'scripts/import_csv.mjs', 'scripts/pack_report.mjs', 'schema.json']) assert.ok((t + read('CONTRIBUTING' + sfx(l) + '.md')).includes(f), 'README/CONTRIBUTING' + sfx(l) + ': ' + f);
    assert.ok(/ES2017/.test(t) && /Node\.js 24/.test(t), 'README' + sfx(l) + ': cerințele');
    assert.ok(/\b50\b/.test(t) && /\b8\b/.test(t), 'README' + sfx(l) + ': 50 de întrebări, 8 pachete');
    for (const k of ['tab_train', 'tab_exam', 'tab_packs', 'x_flag']) assert.ok(t.includes(QU[l][0] + I18N[l][k] + QU[l][1]), 'README' + sfx(l) + ': ' + k);
    const c = read('CONTRIBUTING' + sfx(l) + '.md');
    for (const k of ['tab_packs', 'i_go']) assert.ok(c.includes(QU[l][0] + I18N[l][k] + QU[l][1]), 'CONTRIBUTING' + sfx(l) + ': ' + k);
  }
  assert.equal(pkg.engines.node, '>=24');
});

test('numele din interfață folosite în ghidurile în engleză și română sunt cele din interfață', () => {
  for (const l of ['en', 'ro']) {
    const t = guide('contributor-guide', l);
    for (const k of ['tab_packs', 'i_go']) assert.ok(t.includes(QU[l][0] + I18N[l][k] + QU[l][1]), 'ghidul de contribuție (' + l + '): ' + k);
  }
  // ghidul de format spune la fel
  assert.ok(guide('pack-format', 'en').includes('tab “' + I18N.en.tab_packs + '” → “' + I18N.en.i_go + '”'));
  assert.ok(guide('pack-format', 'ro').includes('fila «' + I18N.ro.tab_packs + '» → «' + I18N.ro.i_go + '»'));
});

test('limitele din README sunt aceleași texte ca în interfață, în fiecare limbă', () => {
  for (const l of LANGS) {
    const t = read('README' + sfx(l) + '.md');
    for (let i = 1; i <= 6; i++) assert.ok(t.includes(I18N[l]['lim_' + i]), 'README' + sfx(l) + ': lim_' + i);
    assert.ok(t.includes('## ' + I18N[l].h_limits), 'README' + sfx(l) + ': titlul');
  }
});

test('sarcinile de început: zece, aceleași în toate limbile, iar good-first-issues.txt are titlurile englezești', () => {
  const issue = (l) => [...read('ISSUES_GOOD_FIRST' + sfx(l) + '.md').matchAll(/^- \[ \] (.+)$/gm)].map((m) => m[1]);
  for (const l of LANGS) assert.equal(issue(l).length, 10, 'ISSUES_GOOD_FIRST' + sfx(l));
  assert.deepEqual(read('good-first-issues.txt').trim().split('\n'), issue('en'));
  assert.ok(read('scripts/create_issues.sh').includes('good-first-issues.txt'));
});

test('fluxul de lucru rulează validarea, testele și verificarea construcției pe Ubuntu 26.04 cu Node.js 26', () => {
  const y = read('.github/workflows/validate.yml');
  assert.match(y, /runs-on: ubuntu-26\.04/);
  assert.match(y, /node-version: 26/);
  for (const c of ['python scripts/validate.py', 'node --test "test/*.test.mjs"', 'node scripts/build.mjs --check', 'pip install jsonschema']) assert.ok(y.includes(c), c);
  assert.ok(!/ubuntu-latest/.test(y));
});

test('șabloanele de pe GitHub trimit la ghiduri, la validator și la construcție', () => {
  const n = read('.github/ISSUE_TEMPLATE/new-entry.md'), p = read('.github/PULL_REQUEST_TEMPLATE.md'), b = read('.github/ISSUE_TEMPLATE/bug.md');
  assert.match(n, /labels: data/); assert.match(b, /labels: bug/);
  for (const f of ['docs/contributor-guide.md', 'docs/pack-format.md', 'docs/verify-against-official-bank.md', 'scripts/import_csv.mjs']) assert.ok(n.includes(f), 'șablonul de issue: ' + f);
  for (const f of ['scripts/validate.py', 'npm test', 'node scripts/build.mjs', 'docs/verify-against-official-bank.md']) assert.ok(p.includes(f), 'șablonul de PR: ' + f);
  assert.ok(p.includes('section 5'));
  // câmpurile înregistrării din șablonul de PR sunt cele din secțiunea 5 a ghidului de verificare
  const rec = (t) => [...t.matchAll(/^([A-Z][A-Za-z -]+?)(?: <name>)?: /gm)].map((m) => m[1]);
  const g5 = guide('verify-against-official-bank', 'en');
  const fromGuide = rec(g5.slice(g5.indexOf('## 5.'), g5.indexOf('## 6.')));
  const fromPr = rec(p.slice(p.indexOf('### Record of the check')));
  assert.deepEqual(fromGuide, ['Official file', 'Questions', 'Compared in full by', 'Method', 'Second check by', 'Differences found and fixed', 'Not checked', 'Exam rules']);
  for (const f of fromPr) assert.ok(fromGuide.includes(f), 'șablonul de PR are câmpul «' + f + '» care nu e în ghid');
  assert.deepEqual(fromPr, ['Official file', 'Questions', 'Compared in full by', 'Method', 'Second check by', 'Not checked']);
});

test('fișierele de proiect: licență MIT, codul de conduită în opt limbi, FUNDING, .gitignore, CNAME și fără dependențe', () => {
  assert.match(read('LICENSE'), /MIT License/);
  for (const l of LANGS) assert.ok(exists('CODE_OF_CONDUCT' + sfx(l) + '.md'), 'CODE_OF_CONDUCT' + sfx(l));
  assert.ok(exists('.github/FUNDING.yml'));
  assert.match(read('.gitignore'), /node_modules/);
  assert.ok(!exists('node_modules'), 'nu sunt dependențe');
  assert.equal(read('CNAME').trim(), 'indicativ-international.chiuta.ro');
  assert.ok(!pkg.dependencies && !pkg.devDependencies, 'package.json fără dependențe');
});

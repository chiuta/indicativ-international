import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as E from '../src/engine.mjs';
import {parseCsv, detectDelimiter, buildPack, convert, describe} from '../scripts/import_csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'import_csv.mjs');
const py = (args, input) => spawnSync('python3', ['-I', path.join(ROOT, 'scripts', 'validate.py'), ...args], {input, encoding: 'utf8', cwd: ROOT});
const O = (over) => Object.assign({id: 'zz-csv', title: 'CSV test', country: 'zz', licence_class: 'practice', lang: 'en', source: 'typed by hand', license: 'MIT'}, over || {});
const csv = (rows, d) => rows.map((r) => r.map((c) => {
  const s = String(c);
  return /["\r\n]/.test(s) || s.indexOf(d || ',') >= 0 ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(d || ',')).join('\n') + '\n';
const HEAD = ['question', 'a', 'b', 'c', 'd', 'correct', 'topic'];
const ROWS = [
  ['What is the unit of frequency?', 'Hertz', 'Watt', 'Volt', 'Ohm', 'A', 'Electricity'],
  ['Which unit measures power?', 'Joule', 'Watt', 'Farad', 'Henry', '2', 'Electricity'],
  ['Which wave travels fastest in a vacuum?', 'Sound', 'Radio', 'Water', 'Seismic', 'b', 'Propagation']
];
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'indicativ-csv-'));

test('parseCsv: ghilimele, ghilimele dublate, linii în celule, CRLF, BOM și linii goale', () => {
  assert.deepEqual(parseCsv('a,b\n1,2\n', ',').map((r) => r.cells), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv('a,b\r\n1,2\r\n', ',').map((r) => r.cells), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv('a,b\n1,2', ',').map((r) => r.cells), [['a', 'b'], ['1', '2']], 'fără linie nouă la sfârșit');
  assert.deepEqual(parseCsv('﻿a,b\n1,2\n', ',').map((r) => r.cells), [['a', 'b'], ['1', '2']], 'BOM');
  assert.deepEqual(parseCsv('"a,b","say ""hi"""\n', ',').map((r) => r.cells), [['a,b', 'say "hi"']]);
  assert.deepEqual(parseCsv('"one\ntwo",x\n"three\r\nfour",y\n', ',').map((r) => r.cells), [['one\ntwo', 'x'], ['three\nfour', 'y']]);
  assert.deepEqual(parseCsv('a,b\n\n\n1,2\n\n', ',').map((r) => r.cells), [['a', 'b'], ['1', '2']], 'liniile goale se sar');
  assert.deepEqual(parseCsv('a,,c\n,,\n', ',').map((r) => r.cells), [['a', '', 'c'], ['', '', '']], 'celulele goale rămân');
  assert.deepEqual(parseCsv('""\n', ',').map((r) => r.cells), [['']], 'o celulă goală între ghilimele este un rând');
  assert.deepEqual(parseCsv('a;b\n1;2\n', ';').map((r) => r.cells), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv('a\tb\n1\t2\n', '\t').map((r) => r.cells), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCsv('', ','), []);
  assert.throws(() => parseCsv('a,"b\nc', ','), /quoted cell/);
});

test('parseCsv: numerele de linie arată unde începe fiecare rând, chiar dacă un rând are mai multe linii', () => {
  const rows = parseCsv('h1,h2\n"x\ny\nz",1\n\nlast,2\n', ',');
  assert.deepEqual(rows.map((r) => r.line), [1, 2, 6]);
});

test('detectDelimiter: alege separatorul cel mai folosit în antet', () => {
  assert.equal(detectDelimiter('a,b,c\n'), ',');
  assert.equal(detectDelimiter('a;b;c\n'), ';');
  assert.equal(detectDelimiter('a\tb\tc\n'), '\t');
  assert.equal(detectDelimiter('a;b;c,d\n'), ';');
  assert.equal(detectDelimiter('single\n'), ',');
  assert.equal(detectDelimiter(''), ',');
  assert.equal(detectDelimiter('﻿a;b\n'), ';');
});

test('convert: un CSV bun dă un pachet valid pentru motor și pentru validate.py', () => {
  const r = convert(csv([HEAD].concat(ROWS)), O(), false);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(E.validatePack(r.pack), []);
  assert.equal(r.pack.country, 'ZZ', 'țara se scrie cu majuscule');
  assert.deepEqual(r.pack.questions.map((q) => q.id), ['ZZ-csv-0001', 'ZZ-csv-0002', 'ZZ-csv-0003']);
  assert.deepEqual(r.pack.questions.map((q) => q.correct), [0, 1, 1], 'litera (A, b) și cifra (2) dau același indice');
  assert.equal(r.pack.questions[0].source, 'typed by hand', 'o sursă lipsă primește sursa pachetului');
  const p = py(['--packs'], JSON.stringify([r.pack]));
  assert.equal(p.status, 0, p.stderr);
  assert.deepEqual(JSON.parse(p.stdout), [[]]);
});

test('convert: coloane în orice ordine, nume cu majuscule, cinci și șase răspunsuri, separator ; sau tab', () => {
  const head = ['Correct', 'F', 'A', 'B', 'C', 'D', 'E', 'QUESTION', 'Topic'];
  const row = ['6', 'six', 'one', 'two', 'three', 'four', 'five', 'Pick the sixth one?', 'Counting'];
  [',', ';', '\t'].forEach((d) => {
    const r = convert(csv([head, row], d), O(), false);
    assert.deepEqual(r.problems, [], 'separator ' + JSON.stringify(d));
    assert.deepEqual(r.pack.questions[0].answers, ['one', 'two', 'three', 'four', 'five', 'six']);
    assert.equal(r.pack.questions[0].correct, 5);
  });
});

test('convert: explicația cu linii noi, ghilimele și virgule trece neschimbată', () => {
  const ex = 'One hertz is one cycle\nper second, written "Hz".';
  const r = convert(csv([HEAD.concat('explanation'), ROWS[0].concat(ex)]), O(), false);
  assert.deepEqual(r.problems, []);
  assert.equal(r.pack.questions[0].explanation, ex);
});

test('convert: subiectul implicit, prefixul, id-ul din fișier, sursa și adresa sursei pe întrebare', () => {
  const rows = [['question', 'a', 'b', 'correct', 'id', 'source', 'source_url', 'fixed_order'],
    ['Q1?', 'x', 'y', 'A', 'ZZ-own-0007', 'Chapter 3', 'https://example.org/ch3', 'true'],
    ['Q2?', 'x', 'y', 'B', '', '', '', 'no']];
  const r = convert(csv(rows), O({topic: 'General', prefix: 'mine'}), false);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.pack.questions.map((q) => q.id), ['ZZ-own-0007', 'ZZ-mine-0002']);
  assert.deepEqual(r.pack.questions.map((q) => q.topic), ['General', 'General']);
  assert.equal(r.pack.questions[0].source, 'Chapter 3');
  assert.equal(r.pack.questions[0].source_url, 'https://example.org/ch3');
  assert.equal(r.pack.questions[0].fixed_order, true);
  assert.equal(r.pack.questions[1].fixed_order, false);
  assert.equal(r.pack.questions[1].source, 'typed by hand');
});

test('convert: antetul antetului și al examenului vin din opțiuni', () => {
  const exam = {questions: 2, minutes: 15, pass_percent: 70, wrong_penalty: 0.25, source: 'Exam rules of the test'};
  const syllabus = [{id: 'E1', title: 'Electricity'}, {id: 'P1', title: 'Propagation'}];
  const r = convert(csv([HEAD].concat(ROWS)), O({exam, syllabus, source_url: 'https://example.org/bank'}), false);
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.pack.exam, exam);
  assert.deepEqual(r.pack.syllabus, syllabus);
  assert.equal(r.pack.source_url, 'https://example.org/bank');
  const bad = convert(csv([HEAD].concat(ROWS)), O({exam: {questions: 9, minutes: 15, pass_percent: 70, source: 's'}}), false);
  assert.equal(bad.pack, null);
  assert.ok(bad.problems.length >= 1, 'un examen cu mai multe întrebări decât are pachetul se respinge');
});

test('convert: prima problemă oprește totul și numește linia din fișier', () => {
  const rows = [HEAD,
    ['Fine?', 'x', 'y', 'z', '', 'A', 'T'],
    ['Gap?', 'x', '', 'z', '', 'A', 'T'],
    ['Bad letter?', 'x', 'y', 'z', '', 'G', 'T'],
    ['One answer?', 'x', '', '', '', 'A', 'T'],
    ['', 'x', 'y', '', '', 'A', 'T']];
  const r = convert(csv(rows), O(), false);
  assert.equal(r.pack, null);
  const text = r.problems.join('\n');
  assert.match(text, /line 3: answers must be filled in without gaps/);
  assert.match(text, /line 4: «correct» must be A–F or 1–6/);
  assert.match(text, /line 5: /);
  assert.match(text, /line 6: /);
  assert.doesNotMatch(text, /line 2:/);
});

test('convert: antet cu coloană necunoscută, dublă sau lipsă se respinge înainte de rânduri', () => {
  const need = (head, re) => {
    const r = convert(csv([head, ['q', 'x', 'y', 'A']]), O(), false);
    assert.equal(r.pack, null, head.join());
    assert.match(r.problems.join('\n'), re, head.join());
  };
  need(['question', 'a', 'b', 'correct', 'colour'], /unknown column «colour»/);
  need(['question', 'a', 'b', 'correct', 'A'], /appears twice/);
  need(['question', 'a', 'correct'], /column «b» is missing/);
  need(['a', 'b', 'correct'], /column «question» is missing/);
  need(['question', 'a', 'b'], /column «correct» is missing/);
  need(['question', 'a', 'b', 'correct', '__proto__'], /unknown column «__proto__»/);
  need(['question', 'a', 'b', 'correct', 'constructor'], /unknown column «constructor»/);
  assert.equal(convert('', O(), false).pack, null);
  assert.match(convert('', O(), false).problems[0], /empty/);
});

test('convert: întrebări identice, ID-uri repetate și text cu caractere ilegale', () => {
  const dup = convert(csv([HEAD, ROWS[0], ROWS[0]]), O(), false);
  assert.equal(dup.pack, null);
  assert.ok(dup.problems.some((p) => /^line 3: /.test(p)), dup.problems.join('\n'));
  const ids = convert(csv([HEAD.concat('id'), ROWS[0].concat('ZZ-a-1'), ROWS[1].concat('ZZ-a-1')]), O(), false);
  assert.equal(ids.pack, null);
  assert.ok(ids.problems.some((p) => /^line 3: /.test(p)), ids.problems.join('\n'));
  const lone = String.fromCharCode(0xd800);
  const hostile = convert(csv([HEAD, ['Bad ' + lone + ' text?', 'x', 'y', 'z', '', 'A', 'T']]), O(), false);
  assert.equal(hostile.pack, null);
  assert.match(hostile.problems.join('\n'), /^line 2: /);
  const ctl = convert(csv([HEAD, ['Control' + String.fromCharCode(7) + ' char?', 'x', 'y', 'z', '', 'A', 'T']]), O(), false);
  assert.equal(ctl.pack, null);
});

test('convert: mai mult de 3000 de întrebări se refuză, 3000 trec', () => {
  const make = (n) => csv([['question', 'a', 'b', 'correct']].concat(Array.from({length: n}, (_, i) => ['Question number ' + (i + 1) + '?', 'yes ' + i, 'no ' + i, 'A'])));
  const ok = convert(make(E.LIMITS.questions), O({topic: 'General'}), false);
  assert.deepEqual(ok.problems, []);
  assert.equal(ok.pack.questions.length, E.LIMITS.questions);
  const big = convert(make(E.LIMITS.questions + 1), O({topic: 'General'}), false);
  assert.equal(big.pack, null);
  assert.ok(big.problems.length >= 1);
});

test('convert --partial: păstrează rândurile bune, numerotarea ID-urilor rămâne a rândurilor, examenul cade dacă nu mai încape', () => {
  const rows = [HEAD, ROWS[0], ['Gap?', 'x', '', 'z', '', 'A', 'T'], ROWS[1], ['Letter?', 'x', 'y', '', '', 'Q', 'T'], ROWS[2]];
  const r = convert(csv(rows), O(), true);
  assert.ok(r.pack, r.problems.join('\n'));
  assert.deepEqual(r.pack.questions.map((q) => q.id), ['ZZ-csv-0001', 'ZZ-csv-0003', 'ZZ-csv-0005']);
  assert.deepEqual(r.dropped, [3, 5]);
  assert.ok(r.problems.length >= 2);
  assert.deepEqual(E.validatePack(r.pack), []);
  const withExam = convert(csv(rows), O({exam: {questions: 5, minutes: 10, pass_percent: 70, source: 's'}}), true);
  assert.ok(withExam.pack, withExam.problems.join('\n'));
  assert.equal(withExam.pack.exam, undefined, 'un examen de 5 întrebări nu încape în 3 întrebări: regulile cad, iar scriptul o spune');
  assert.ok(withExam.problems.some((x) => /exam rules were left out/.test(x)), withExam.problems.join('\n'));
  assert.deepEqual(E.validatePack(withExam.pack), []);
});

test('convert --partial: dacă nu rămâne nimic, nu iese nimic', () => {
  const r = convert(csv([HEAD, ['Bad?', 'x', '', 'z', '', 'A', 'T']]), O(), true);
  assert.equal(r.pack, null);
  assert.ok(r.problems.length >= 1);
});

test('describe: propoziții în engleză, întrebarea numită prin linia din fișier, codul rămâne la sfârșit', () => {
  assert.deepEqual(describe(['q0:answers', 'q2:topic', 'pack:title', 'exam:too_many', 'q1:figure_alt', 'syllabus0:dup', 'q0:figure_tag'], [2, 7, 9]), [
    'line 2: A question needs between 2 and 6 answers. [answers]',
    'line 9: «topic» is missing or not valid. [topic]',
    'Pack: «title» is missing or not valid. [title]',
    'Exam rules: The exam asks for more questions than the pack has. [too_many]',
    'line 7: A figure needs «figure_alt», and «figure_alt» needs a figure. [figure_alt]',
    'Syllabus item 1: The id is used twice. [dup]',
    'line 2: The figure is not accepted (tag). [figure_tag]'
  ]);
});

test('convert: problemele găsite de motor sunt scrise ca propoziții, nu ca coduri goale', () => {
  const r = convert(csv([HEAD, ROWS[0], ROWS[0], ['No topic?', 'x', 'y', '', '', 'A', '']]), O(), false);
  assert.equal(r.pack, null);
  assert.deepEqual(r.problems, [
    'line 3: The same question with the same answers appears twice. [question_dup]',
    'line 4: «topic» is missing or not valid. [topic]'
  ]);
});

test('dus-întors: pachetul de antrenament scris ca CSV și citit înapoi este identic', () => {
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'packs', 'zz-practice.json'), 'utf8'));
  const cols = ['id', 'topic', 'syllabus_ref', 'question', 'a', 'b', 'c', 'd', 'correct', 'explanation', 'source', 'figure', 'figure_alt'];
  const rows = [cols].concat(pack.questions.map((q) => cols.map((c) => {
    if (c === 'correct') return String.fromCharCode(65 + q.correct);
    const k = 'abcd'.indexOf(c);
    if (k >= 0) return q.answers[k];
    return q[c] === undefined ? '' : q[c];
  })));
  [',', ';', '\t'].forEach((d) => {
    const text = csv(rows, d);
    const r = convert(text, O({id: pack.id, title: pack.title, country: pack.country, licence_class: pack.licence_class, lang: pack.lang, source: pack.source, license: pack.license, syllabus: pack.syllabus}), false);
    assert.deepEqual(r.problems, [], 'separator ' + JSON.stringify(d));
    assert.deepEqual(r.pack, E.canonicalPack(pack), 'separator ' + JSON.stringify(d));
  });
});

test('dus-întors: și cu fișier cu BOM și linii CRLF', () => {
  const text = '﻿' + csv([HEAD].concat(ROWS)).replace(/\n/g, '\r\n');
  const r = convert(text, O(), false);
  assert.deepEqual(r.problems, []);
  assert.equal(r.pack.questions.length, 3);
});

test('buildPack: nu atinge Object.prototype', () => {
  const rows = parseCsv(csv([['question', 'a', 'b', 'correct', '__proto__'], ['q', 'x', 'y', 'A', '{"polluted":true}']]), ',');
  const b = buildPack(rows, O());
  assert.equal(b.pack, null);
  assert.equal(({}).polluted, undefined);
});

test('linia de comandă: scrie data/packs/<id>.json, acceptat de pagină și de validate.py', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'data', 'packs'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'q.csv'), csv([HEAD].concat(ROWS)));
  const r = spawnSync(process.execPath, [SCRIPT, 'q.csv', '--id', 'zz-cli', '--title', 'CLI test', '--country', 'zz', '--class', 'practice', '--lang', 'en', '--source', 'by hand', '--license', 'MIT'], {cwd: dir, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /wrote data[\\/]packs[\\/]zz-cli\.json \(3 questions\)/);
  const text = fs.readFileSync(path.join(dir, 'data', 'packs', 'zz-cli.json'), 'utf8');
  assert.ok(text.endsWith('\n'));
  const back = E.parsePackText(text);
  assert.deepEqual(E.validatePack(back.pack), []);
  const p = py(['--packs'], JSON.stringify([back.pack]));
  assert.deepEqual(JSON.parse(p.stdout), [[]]);
});

test('linia de comandă: --out - scrie pe ieșirea standard, --check nu scrie nimic', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'q.csv'), csv([HEAD].concat(ROWS), ';'));
  const base = ['q.csv', '--id', 'zz-cli', '--title', 'CLI test', '--country', 'zz', '--class', 'practice', '--lang', 'en', '--source', 'by hand', '--license', 'MIT'];
  const o = spawnSync(process.execPath, [SCRIPT, ...base, '--out', '-'], {cwd: dir, encoding: 'utf8'});
  assert.equal(o.status, 0, o.stderr);
  assert.equal(JSON.parse(o.stdout).questions.length, 3);
  assert.deepEqual(fs.readdirSync(dir), ['q.csv']);
  const c = spawnSync(process.execPath, [SCRIPT, ...base, '--check'], {cwd: dir, encoding: 'utf8'});
  assert.equal(c.status, 0, c.stderr);
  assert.match(c.stderr, /ok: 3 question/);
  assert.deepEqual(fs.readdirSync(dir), ['q.csv']);
});

test('linia de comandă: tab ca separator, --topic, --prefix și regulile de examen', () => {
  const dir = tmp();
  const rows = [['question', 'a', 'b', 'correct']].concat(ROWS.map((r) => [r[0], r[1], r[2], 'A']));
  fs.writeFileSync(path.join(dir, 'q.csv'), csv(rows, '\t'));
  const out = path.join(dir, 'out.json');
  const r = spawnSync(process.execPath, [SCRIPT, 'q.csv', '--id', 'zz-cli', '--title', 'CLI test', '--country', 'zz', '--class', 'practice', '--lang', 'en', '--source', 'by hand', '--license', 'MIT',
    '--delimiter', 'tab', '--topic', 'General', '--prefix', 'cli', '--source-url', 'https://example.org/b', '--exam-questions', '2', '--exam-minutes', '20', '--exam-pass', '75', '--exam-penalty', '0.25', '--exam-source', 'rules', '--out', out], {cwd: dir, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  const p = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.deepEqual(p.questions.map((q) => q.id), ['ZZ-cli-0001', 'ZZ-cli-0002', 'ZZ-cli-0003']);
  assert.equal(p.questions[0].topic, 'General');
  assert.deepEqual(p.exam, {questions: 2, minutes: 20, pass_percent: 75, wrong_penalty: 0.25, source: 'rules'});
  assert.equal(p.source_url, 'https://example.org/b');
});

test('linia de comandă: coduri de ieșire 0, 1 și 2 și nimic scris la eroare', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'bad.csv'), csv([HEAD, ['Gap?', 'x', '', 'z', '', 'A', 'T']]));
  fs.writeFileSync(path.join(dir, 'ok.csv'), csv([HEAD].concat(ROWS)));
  const base = ['--id', 'zz-cli', '--title', 'CLI test', '--country', 'zz', '--class', 'practice', '--lang', 'en', '--source', 'by hand', '--license', 'MIT'];
  const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], {cwd: dir, encoding: 'utf8'});
  const noArgs = run([]);
  assert.equal(noArgs.status, 2);
  assert.match(noArgs.stdout, /usage:/);
  const help = run(['--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /usage:/);
  const noOpts = run(['ok.csv']);
  assert.equal(noOpts.status, 2);
  assert.match(noOpts.stderr, /missing option\(s\): --id --title --country --class --lang --source --license/);
  const missing = run(['nope.csv', ...base]);
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /cannot read nope\.csv/);
  const twoFiles = run(['ok.csv', 'bad.csv', ...base]);
  assert.equal(twoFiles.status, 2);
  const noValue = run(['ok.csv', ...base, '--out']);
  assert.equal(noValue.status, 2);
  const bad = run(['bad.csv', ...base, '--out', 'out.json']);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /line 2: answers must be filled in without gaps/);
  assert.match(bad.stderr, /nothing written/);
  assert.ok(!fs.existsSync(path.join(dir, 'out.json')));
  const partial = run(['bad.csv', ...base, '--partial', '--out', 'out.json']);
  assert.equal(partial.status, 1, 'cu --partial, dar fără niciun rând bun, tot nu se scrie nimic');
  assert.ok(!fs.existsSync(path.join(dir, 'out.json')));
  const good = run(['ok.csv', ...base, '--out', 'out.json']);
  assert.equal(good.status, 0, good.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'out.json')));
});

test('linia de comandă: --partial scrie rândurile bune și spune ce a lăsat deoparte', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'mixed.csv'), csv([HEAD, ROWS[0], ['Gap?', 'x', '', 'z', '', 'A', 'T'], ROWS[1]]));
  const r = spawnSync(process.execPath, [SCRIPT, 'mixed.csv', '--id', 'zz-cli', '--title', 'CLI test', '--country', 'zz', '--class', 'practice', '--lang', 'en', '--source', 'by hand', '--license', 'MIT', '--partial', '--out', 'out.json'], {cwd: dir, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /left out 1 row\(s\): lines 3/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'out.json'), 'utf8')).questions.length, 2);
});

test('linia de comandă: fișierul de programă (--syllabus) intră în pachet; unul stricat dă cod 2', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'q.csv'), csv([HEAD.concat('syllabus_ref'), ROWS[0].concat('E1'), ROWS[1].concat('E1')]));
  fs.writeFileSync(path.join(dir, 's.json'), JSON.stringify([{id: 'E1', title: 'Electricity'}]));
  fs.writeFileSync(path.join(dir, 'broken.json'), '{');
  const base = ['q.csv', '--id', 'zz-cli', '--title', 'CLI test', '--country', 'zz', '--class', 'practice', '--lang', 'en', '--source', 'by hand', '--license', 'MIT'];
  const ok = spawnSync(process.execPath, [SCRIPT, ...base, '--syllabus', 's.json', '--out', 'out.json'], {cwd: dir, encoding: 'utf8'});
  assert.equal(ok.status, 0, ok.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'out.json'), 'utf8')).syllabus, [{id: 'E1', title: 'Electricity'}]);
  const broken = spawnSync(process.execPath, [SCRIPT, ...base, '--syllabus', 'broken.json'], {cwd: dir, encoding: 'utf8'});
  assert.equal(broken.status, 2);
  assert.match(broken.stderr, /cannot read the syllabus file/);
  const noRef = spawnSync(process.execPath, [SCRIPT, ...base, '--out', 'out2.json'], {cwd: dir, encoding: 'utf8'});
  assert.equal(noRef.status, 1, 'syllabus_ref fără programă în pachet se respinge');
});

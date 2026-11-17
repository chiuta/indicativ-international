import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {report, textLines, sample, format, problemText} from '../scripts/pack_report.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'pack_report.mjs');
const PRACTICE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'packs', 'zz-practice.json'), 'utf8'));
const copy = (x) => JSON.parse(JSON.stringify(x));
const run = (args, cwd) => spawnSync(process.execPath, [SCRIPT, ...args], {cwd: cwd || ROOT, encoding: 'utf8'});

test('report: numere, materii și poziții pentru pachetul de exersare', () => {
  const r = report(PRACTICE);
  assert.equal(r.questions, 50);
  assert.equal(r.topics.reduce((a, t) => a + t.n, 0), 50);
  assert.equal(r.positions.reduce((a, n) => a + n, 0), 50);
  assert.equal(r.first, 1);
  assert.equal(r.last, 50);
  assert.deepEqual(r.missing, []);
  assert.deepEqual(r.repeated, []);
  assert.deepEqual(r.problems, []);
  assert.equal(r.figures, 2);
  assert.equal(r.explanations, 50);
  assert.equal(r.syllabus_refs, 50);
  assert.equal(r.fixed_order, 0);
});

test('report: numerele lipsă și numerele repetate (alt prefix, același număr)', () => {
  const p = copy(PRACTICE);
  p.questions.splice(2, 1);                        // lipsește 3
  p.questions.splice(9, 2);                        // lipsesc 11 și 12
  p.questions[0].id = 'ZZ-other-0005';             // 5 apare a doua oară
  const r = report(p);
  assert.deepEqual(r.missing, [3, 11, 12]);
  assert.deepEqual(r.repeated, [5]);
  assert.ok(r.problems.length === 0, 'un număr repetat cu alt prefix nu e o eroare de format, doar o avertizare a raportului');
  const t = format(r);
  assert.match(t, /missing: 3, 11–12/);
  assert.match(t, /numbers used more than once: 5/);
});

test('report: nu se oprește pe pachete stricate', () => {
  [null, {}, {questions: 'x'}, {questions: [null, 5, {}]}, {questions: [{id: 'x', topic: 5, correct: 99, answers: 'x'}]}].forEach((p) => {
    const r = report(p);
    assert.ok(Array.isArray(r.problems) && r.problems.length > 0, JSON.stringify(p));
    assert.doesNotThrow(() => format(r));
  });
});

test('format: textul pentru un pachet valid și pentru unul cu probleme', () => {
  const ok = format(report(PRACTICE));
  assert.match(ok, /^zz-practice · Practice questions/);
  assert.match(ok, /ZZ · practice · en · 50 questions · valid/);
  assert.match(ok, /official numbers: 1–50; no gaps/);
  assert.match(ok, /right answer at A 13 · B 12 · C 12 · D 13/);
  const p = copy(PRACTICE);
  p.questions[1].correct = 9;
  const bad = format(report(p));
  assert.match(bad, /1 problem\(s\)/);
  assert.match(bad, /problem: Question 2: «correct» must be the position of the right answer, counting from 0\. \[correct\]/);
});

test('problemText: codul ca propoziție în engleză', () => {
  assert.equal(problemText('q4:topic'), 'Question 5: «topic» is missing or not valid. [topic]');
  assert.equal(problemText('pack:questions'), 'Pack: «questions» must have between 1 and 3000 items. [questions]');
  assert.equal(problemText('exam:minutes'), 'Exam rules: «minutes» is missing or not valid. [minutes]');
});

test('textLines: o linie pe întrebare, rândurile noi devin spații, răspunsul corect cu literă', () => {
  const p = copy(PRACTICE);
  p.questions[0].question = 'First line\nsecond line';
  const lines = textLines(p);
  assert.equal(lines.length, 50);
  const cols = lines[0].split('\t');
  assert.equal(cols[0], 'ZZ-practice-0001');
  assert.equal(cols[1], 'First line second line');
  assert.match(cols[2], /^A\) .* \| B\) .* \| C\) .* \| D\) /);
  assert.match(cols[3], /^right: [A-D]$/);
  lines.forEach((l) => assert.equal(l.split('\t').length, 4));
});

test('sample: aceeași sămânță dă aceleași întrebări, în ordinea pachetului, fără repetări', () => {
  const a = sample(PRACTICE, 10, '7'), b = sample(PRACTICE, 10, '7'), c = sample(PRACTICE, 10, '8');
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(new Set(a).size, 10);
  const order = PRACTICE.questions.map((q) => q.id);
  assert.deepEqual(a, a.slice().sort((x, y) => order.indexOf(x) - order.indexOf(y)));
  assert.equal(sample(PRACTICE, 500, '1').length, 50);
  assert.deepEqual(sample(PRACTICE, 0, '1'), []);
});

test('linia de comandă: fără argumente raportează pachetele din data/packs/ (fără example.json)', () => {
  const r = run([]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^zz-practice · /);
  assert.doesNotMatch(r.stdout, /zz-example/);
});

test('linia de comandă: --json, --text și --sample', () => {
  const file = path.join(ROOT, 'data', 'packs', 'zz-practice.json');
  const j = run([file, '--json']);
  assert.equal(j.status, 0, j.stderr);
  assert.equal(JSON.parse(j.stdout).questions, 50);
  const t = run([file, '--text']);
  assert.equal(t.stdout.trim().split('\n').length, 50);
  const s = run([file, '--sample', '5', '--seed', '3']);
  assert.equal(s.stdout.trim().split('\n').length, 5);
  assert.equal(run([file, '--sample', '5', '--seed', '3']).stdout, s.stdout);
});

test('linia de comandă: coduri de ieșire 0, 1 și 2', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'indicativ-report-'));
  const bad = copy(PRACTICE);
  bad.questions[0].correct = 9;
  fs.writeFileSync(path.join(dir, 'bad.json'), JSON.stringify(bad));
  fs.writeFileSync(path.join(dir, 'broken.json'), '{');
  const b = run([path.join(dir, 'bad.json')]);
  assert.equal(b.status, 1);
  assert.match(b.stdout, /problem: Question 1: /);
  const j = run([path.join(dir, 'broken.json')]);
  assert.equal(j.status, 2);
  assert.match(j.stderr, /not valid JSON/);
  assert.equal(run([path.join(dir, 'nope.json')]).status, 2);
  assert.equal(run(['--nope']).status, 2);
  assert.equal(run([path.join(dir, 'bad.json'), '--sample', 'x']).status, 2);
  assert.equal(run([path.join(dir, 'bad.json'), '--sample']).status, 2);
  assert.equal(run(['--help']).status, 0);
});

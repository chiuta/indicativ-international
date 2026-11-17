import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as E from '../src/engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const py = (args, input) => spawnSync('python3', ['-I', path.join(ROOT, 'scripts', 'validate.py'), ...args], {input, encoding: 'utf8', cwd: ROOT});
const Q = (n, over) => Object.assign({
  id: 'ZZ-test-' + String(n).padStart(4, '0'), topic: 'electricity', question: 'Question number ' + n + '?',
  answers: ['first ' + n, 'second ' + n, 'third ' + n, 'fourth ' + n], correct: n % 4, source: 'written for the tests'
}, over || {});
const P = (over, qs) => Object.assign({
  format: 'indicativ-pack', version: 1, id: 'zz-test', title: 'Test pack', country: 'ZZ', licence_class: 'practice', lang: 'en',
  source: 'written for the tests', license: 'MIT', questions: qs || [Q(1), Q(2), Q(3)]
}, over || {});
const SVG = '<svg viewBox="0 0 100 50"><line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" stroke-width="2"/><text x="50" y="10" text-anchor="middle" font-size="10">R1</text></svg>';
const lone = String.fromCharCode(0xd800), nbsp = String.fromCharCode(0xa0), e1 = String.fromCharCode(0xe9), eAcute = 'e' + String.fromCharCode(0x301), astral = String.fromCodePoint(0x1f4e1);

const packCorpus = () => {
  const list = [];
  const add = (p) => list.push(p);
  add(P());
  add(P({ exam: { questions: 2, minutes: 10, pass_percent: 70, wrong_penalty: 0.25, source: 'rules' } }));
  [null, [], 'x', 5, true, {}].forEach(add);
  ['format', 'version', 'id', 'title', 'country', 'licence_class', 'lang', 'source', 'license', 'questions'].forEach((k) => { const p = P(); delete p[k]; add(p); });
  [{ format: 'x' }, { version: 2 }, { version: '1' }, { version: true }, { version: 1.5 }, { id: 'Bad Id' }, { id: 'a--b' }, { id: 'x'.repeat(41) }, { title: '' }, { title: 'a\nb' }, { title: 'a\u007fb' },
    { title: 'a' + lone }, { title: astral + ' radio' }, { country: 'zz' }, { country: 'ZZZ' }, { country: 5 }, { lang: 'english' }, { lang: 'EN' }, { lang: 'fil' }, { source: '' }, { source: 'x'.repeat(301) },
    { source_url: 'http://x.org/' }, { source_url: 'https://x.org/a b' }, { source_url: 'https://x.org/a' + nbsp }, { source_url: 'https://x.org/' + 'a'.repeat(600) }, { source_url: 'https://x.org/ok?q=1' }, { source_url: 5 },
    { license: '' }, { extra: 1 }, { questions: [] }, { questions: 'x' }, { questions: {} }, { syllabus: 'x' }, { syllabus: [5] }, { syllabus: [{ id: 'E1', title: 'Ohm' }, { id: 'E1', title: 'Again' }] },
    { syllabus: [{ id: 'bad id', title: 'x' }] }, { syllabus: [{ id: 'E1', title: '' }] }, { syllabus: [{ id: 'E1', title: 'x', more: 1 }] }, { syllabus: [{ title: 'x' }] },
    { exam: 5 }, { exam: { questions: 1, minutes: 1, pass_percent: 50 } }, { exam: { questions: 4, minutes: 10, pass_percent: 70, source: 's' } }, { exam: { questions: 0, minutes: 10, pass_percent: 70, source: 's' } },
    { exam: { questions: 1, minutes: 601, pass_percent: 70, source: 's' } }, { exam: { questions: 1, minutes: 10, pass_percent: 101, source: 's' } }, { exam: { questions: 1.5, minutes: 10, pass_percent: 70, source: 's' } },
    { exam: { questions: 1, minutes: 10, pass_percent: 70, wrong_penalty: -0.1, source: 's' } }, { exam: { questions: 1, minutes: 10, pass_percent: 70, wrong_penalty: 'x', source: 's' } },
    { exam: { questions: 1, minutes: 10, pass_percent: 70, wrong_penalty: true, source: 's' } }, { exam: { questions: 1, minutes: 10, pass_percent: 70, source: 's', x: 1 } },
    { country: 'HU' }, { licence_class: 'A'.repeat(41) }].forEach((o) => add(P(o)));
  const qcases = [{ id: 'x-1' }, { id: 'ZZ-a-1' + 'x'.repeat(40) }, { id: 'ZZ-a-b-1' }, { id: 'zz-a-1' }, { id: 'ZZ-a-1\n' }, { id: 5 }, { country: 'Z' }, { country: 'HU' }, { licence_class: '' }, { licence_class: 7 }, { topic: '' }, { topic: 'x'.repeat(61) },
    { question: '' }, { question: 'x'.repeat(1001) }, { question: 'a\tb' }, { question: 'a\nb' }, { question: 'a' + lone }, { question: 5 }, { answers: ['only'] }, { answers: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { answers: ['a', ''], correct: 0 },
    { answers: ['a', 5], correct: 0 }, { answers: ['A', ' a ', 'c'], correct: 0 }, { answers: ['Éa', 'ea', 'c'], correct: 0 }, { answers: [e1, eAcute, 'c'], correct: 0 }, { answers: ['a' + nbsp + 'b', 'a b', 'c'], correct: 0 },
    { answers: 'abc' }, { answers: null }, { correct: 4 }, { correct: -1 }, { correct: 1.5 }, { correct: '1' }, { correct: true }, { correct: null }, { answers: ['a'], correct: 9 }, { answers: ['a', 'b'], correct: 1 },
    { explanation: '' }, { explanation: 'x'.repeat(1001) }, { explanation: 5 }, { source: '' }, { source: 5 }, { source_url: 'ftp://x' }, { source_url: 'https://example.org/ok' },
    { lang: 'EN' }, { lang: 'hu' }, { fixed_order: 'yes' }, { fixed_order: true }, { fixed_order: 1 }, { surprise: 1 }, { syllabus_ref: 'A1' }, { syllabus_ref: '-x' }, { syllabus_ref: 5 }, { syllabus_ref: 'E1' },
    { figure: SVG }, { figure: SVG, figure_alt: 'A line.' }, { figure: SVG, figure_alt: '' }, { figure_alt: 'x' }, { figure: 5, figure_alt: 'x' }, { figure: '<svg><script/></svg>', figure_alt: 'x' }];
  qcases.forEach((o) => add(P({ syllabus: [{ id: 'E1', title: 'Ohm' }] }, [Q(1, o)])));
  add(P({}, [null]));
  add(P({}, ['text']));
  add(P({}, [Q(1), Q(1, { question: 'Another?' })]));
  add(P({}, [Q(1), Q(2, { question: ' QUESTION  number 1? ', answers: Q(1).answers.slice().reverse(), correct: 0 })]));
  add(P({}, [Q(1), Q(2, { question: Q(1).question })]));
  add(P({}, [Q(1, { country: 'HU', licence_class: 'A', lang: 'hu' }), Q(2)]));
  const noCountry = P({}, [Q(1)]); delete noCountry.country; add(noCountry);
  const noQuestionFields = P({ country: 'x', licence_class: '', lang: 'EN' }, [Q(1), Q(2)]); add(noQuestionFields);
  add(P({}, Array.from({ length: 3001 }, (_, i) => Q(i + 1))));
  add(P({ __proto__: null }, [Q(1)]));
  return list;
};
const figureCorpus = () => {
  const withG = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill="none"><g transform="translate(1 2) rotate(45) scale(2)"><rect x="1" y="1" width="5" height="5" rx="1" fill="#f00"/><circle cx="5" cy="5" r="2"/><ellipse cx="5" cy="5" rx="3" ry="1"/><polyline points="0,0 5,5 10,0"/><polygon points="0 0 5 5 0 5"/><path d="M0 0 L10 10 Z" stroke-linecap="round" stroke-linejoin="bevel" stroke-dasharray="2 1"/></g></svg>';
  const v = (inner, attrs) => '<svg viewBox="0 0 10 10"' + (attrs || '') + '>' + inner + '</svg>';
  return [SVG, '  ' + SVG + '\n', withG, v(''), '<svg viewBox="0 0 10 10"/>', '<svg viewBox="0 0 10 10"/>x', v('<script>alert(1)</script>'), v('', ' onload="x()"'), v('<rect x="0" y="0" width="1" height="1" style="fill:red"/>'), v('<use href="#a"/>'),
    v('<image href="https://x"/>'), v('<foreignObject></foreignObject>'), v('<iframe/>'), v('<text x="1" y="1">a &amp; b</text>'), v('<!-- x -->'), v('<![CDATA[x]]>'), '<!DOCTYPE svg><svg viewBox="0 0 10 10"></svg>',
    '<?xml version="1.0"?><svg viewBox="0 0 10 10"></svg>', '<g></g>', v('<svg viewBox="0 0 1 1"></svg>'), v('') + v(''), v('') + 'x', 'x' + v(''), '<svg viewBox="0 0 10 10"><g>', v('<g></line>'),
    '<SVG viewBox="0 0 10 10"></SVG>', "<svg viewBox='0 0 10 10'></svg>", '<svg viewBox="0 0 10 10" viewBox="0 0 5 5"></svg>', '<svg><g/></svg>', '<svg viewBox="0 0 0 10"></svg>', '<svg viewBox="0 0 5000 10"></svg>',
    '<svg viewBox="0,0,10,10"></svg>', '<svg viewBox="0 0 10"></svg>', '<svg viewBox="a b c d"></svg>', v('<line x1="1e3" y1="0" x2="1" y2="1"/>'), v('<line x1="99999" y1="0" x2="1" y2="1"/>'), v('<line x1="-5" y1="0.5" x2="1" y2="1"/>'),
    v('<line x1=".5" y1="0" x2="1" y2="1"/>'), v('<line x1="5." y1="0" x2="1" y2="1"/>'), v('<circle cx="1" cy="1" r="-2"/>'), v('<g fill="red"/>'), v('<g fill="url(#a)"/>'), v('<g fill="#12"/>'), v('<g stroke="#ABCDEF"/>'),
    v('<path d="L0 0"/>'), v('<path d="M0 0 X5"/>'), v('<path d="M0 0 L5 5 z"/>'), v('<polygon points="0 0 1"/>'), v('<polygon points="0 0 1 1"/>'), v('<polygon points="0 0 1 1 2"/>'), v('<g transform="matrix(1 0 0 1 0 0)"/>'),
    v('<g transform="translate(1)rotate(2)"/>'), v('<g transform="translate(1) rotate(2)"/>'), v('<g transform="rotate(1 2)"/>'), v('<g transform="rotate(1 2 3)"/>'), v('<g transform="translate(99999)"/>'), v('<g stroke-width="21"/>'), v('<g stroke-width="20"/>'),
    v('<g stroke-linecap="x"/>'), v('<g stroke-linejoin="bevel"/>'), v('<g stroke-dasharray="1 2 3 4 5 6 7 8 9"/>'), v('<text x="1" y="1" font-size="3">a</text>'), v('<text x="1" y="1" font-size="48">a</text>'), v('<text x="1" y="1" text-anchor="end">a</text>'),
    v('<text x="1" y="1" text-anchor="left">a</text>'), v('hello'), v('<text x="1" y="1">a\nb</text>'), v('<text x="1" y="1">' + 'a'.repeat(201) + '</text>'), v('<text x="1" y="1">' + 'a'.repeat(200) + '</text>'), v('<text x="1" y="1">Ω µF</text>'),
    v('<text x="1" y="1"></text>'), v('<text x="1" y="1"/>'), v('<g>x</g>'), v('<text x="1" y="1">a<b/></text>'), '<svg viewBox="0 0 10 10" xmlns="http://evil.example/"></svg>', '<svg viewBox="0 0 10 10" width="100" height="50"></svg>',
    '<svg viewBox="0 0 10 10" width="0"></svg>', '<svg viewBox="0 0 10 10"></svg x="1">', '<svg viewBox="0 0 10 10"></ svg>', '<svg viewBox="0 0 10 10" ></svg>', '<svg\tviewBox="0 0 10 10"\n></svg>', '<svg viewBox="0 0 10 10"  x="1"></svg>',
    v('<g/>'.repeat(1500)), v('<g/>'.repeat(201)), v('<g/>'.repeat(200)), v('<g>'.repeat(6) + '</g>'.repeat(6)), v('<g>'.repeat(5) + '</g>'.repeat(5)), v('<g x="1"/>'), v('<rect x="1" y="1" width="-1" height="1"/>'), v('<g>\n  <g/>\n</g>'), 5, null, '', ' ', '<', '<svg', '<svg viewBox="0 0 10 10" a="<"></svg>',
    'x'.repeat(6001), '<svg viewBox="0 0 10 10">' + lone + '</svg>', v('<text x="1" y="1">' + astral + '</text>'), v('<text x="1" y="1">a\u007fb</text>')];
};

test('Python și JavaScript dau aceleași coduri pentru pachete (' + packCorpus().length + ' de cazuri)', () => {
  const corpus = packCorpus();
  const r = py(['--packs'], JSON.stringify(corpus));
  assert.equal(r.status, 0, r.stderr);
  const got = JSON.parse(r.stdout);
  assert.equal(got.length, corpus.length);
  let valid = 0;
  corpus.forEach((p, i) => {
    const want = E.validatePack(p);
    if (!want.length) valid++;
    assert.deepEqual(got[i], want, 'cazul ' + i + ': ' + JSON.stringify(p).slice(0, 160));
  });
  assert.ok(valid >= 8 && valid < corpus.length - 40, 'corpusul amestecă pachete valide și nevalide (' + valid + ' valide)');
});

test('Python și JavaScript citesc la fel un număr întreg scris ca 1.0, o valoare nulă și cheile ciudate', () => {
  const raw = '[' + [
    JSON.stringify(P()).replace('"version":1', '"version":1.0'),
    JSON.stringify(P()).replace('"correct":1', '"correct":1.0'),
    JSON.stringify(P()).replace('"correct":1', '"correct":1e0'),
    JSON.stringify(P()).replace('"licence_class":"practice"', '"licence_class":null'),
    JSON.stringify(P({}, [Q(1)])).replace('"questions":[{', '"questions":[{"country":null,'),
    '{"__proto__":{"x":1},"format":"indicativ-pack"}',
    JSON.stringify(P()).replace('"title":"Test pack"', '"title":"Test \\ud83d\\udce1 pack"'),
    JSON.stringify(P()).replace('"title":"Test pack"', '"title":"Test \\udce1 pack"')
  ].join(',') + ']';
  const r = py(['--packs'], raw);
  assert.equal(r.status, 0, r.stderr);
  const got = JSON.parse(r.stdout);
  JSON.parse(raw).forEach((p, i) => assert.deepEqual(got[i], E.validatePack(p), 'cazul ' + i));
  assert.deepEqual(got[0], []);
  assert.deepEqual(got[1], []);
  assert.deepEqual(got[2], []);
  assert.deepEqual(got[7], ['pack:title']);
});

test('Python și JavaScript dau aceleași coduri pentru figuri (' + figureCorpus().length + ' de cazuri)', () => {
  const corpus = figureCorpus();
  const r = py(['--figures'], JSON.stringify(corpus));
  assert.equal(r.status, 0, r.stderr);
  const got = JSON.parse(r.stdout);
  let ok = 0;
  corpus.forEach((s, i) => {
    const want = E.figureIssues(s);
    if (!want.length) ok++;
    assert.deepEqual(got[i], want, 'cazul ' + i + ': ' + JSON.stringify(s).slice(0, 160));
  });
  assert.ok(ok >= 20, 'figuri valide în corpus: ' + ok);
});

test('schema.json și regulile se potrivesc: ce acceptă regulile acceptă și schema', async () => {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema.json'), 'utf8'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ind-schema-'));
  fs.mkdirSync(path.join(tmp, 'data'));
  fs.copyFileSync(path.join(ROOT, 'scripts', 'validate.py'), path.join(tmp, 'validate.py'));
  fs.writeFileSync(path.join(tmp, 'schema.json'), JSON.stringify(schema));
  fs.mkdirSync(path.join(tmp, 'scripts'));
  fs.renameSync(path.join(tmp, 'validate.py'), path.join(tmp, 'scripts', 'validate.py'));
  const corpus = packCorpus().filter((p) => E.validatePack(p).length === 0 && JSON.stringify(p).length < 100000);
  assert.ok(corpus.length >= 8);
  corpus.forEach((p, i) => fs.writeFileSync(path.join(tmp, 'data', 'p' + i + '.json'), JSON.stringify(p)));
  const r = spawnSync('python3', ['-I', path.join(tmp, 'scripts', 'validate.py')], {encoding: 'utf8', cwd: tmp});
  const lines = r.stdout.split('\n').filter((l) => l && !/problem\(s\)/.test(l) && !/file name must be the pack id/.test(l));
  assert.deepEqual(lines, [], 'schema.json respinge pachete pe care regulile le acceptă:\n' + lines.slice(0, 5).join('\n'));
});

test('validate.py pe depozit: toate fișierele din data/ sunt valide', () => {
  const r = py([]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /\d+ file\(s\) checked, 0 problem\(s\)\./);
});

test('validate.py raportează fișiere stricate și nume de fișier diferite de identificatorul pachetului (deci și identificatori repetați)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ind-val-'));
  fs.mkdirSync(path.join(tmp, 'scripts'));
  fs.copyFileSync(path.join(ROOT, 'scripts', 'validate.py'), path.join(tmp, 'scripts', 'validate.py'));
  fs.copyFileSync(path.join(ROOT, 'schema.json'), path.join(tmp, 'schema.json'));
  fs.mkdirSync(path.join(tmp, 'data'));
  const w = (name, v) => fs.writeFileSync(path.join(tmp, 'data', name), typeof v === 'string' ? v : JSON.stringify(v));
  w('zz-test.json', P());
  w('wrong-name.json', P({ id: 'zz-other' }));
  w('copy.json', P());
  w('broken.json', '{ "format": ');
  w('bad.json', P({ id: 'bad' }, [Q(1, { correct: 9, figure: '<svg><script/></svg>', figure_alt: 'x' })]));
  const r = spawnSync('python3', ['-I', path.join(tmp, 'scripts', 'validate.py')], {encoding: 'utf8', cwd: tmp});
  assert.equal(r.status, 1);
  assert.match(r.stdout, /broken\.json: not valid JSON/);
  assert.match(r.stdout, /wrong-name\.json: the file name must be the pack id \(zz-other\.json\)/);
  assert.match(r.stdout, /copy\.json: the file name must be the pack id \(zz-test\.json\)/);
  assert.match(r.stdout, /bad\.json: q0:correct/);
  assert.match(r.stdout, /bad\.json: q0:figure_viewbox/);
  assert.match(r.stdout, /bad\.json: q0:figure_tag/);
  assert.match(r.stdout, /5 file\(s\) checked, \d+ problem\(s\)\./);
  fs.rmSync(path.join(tmp, 'data'), {recursive: true});
  fs.mkdirSync(path.join(tmp, 'data'));
  w('zz-test.json', P());
  const ok = spawnSync('python3', ['-I', path.join(tmp, 'scripts', 'validate.py'), 'data'], {encoding: 'utf8', cwd: tmp});
  assert.equal(ok.status, 0, ok.stdout);
});

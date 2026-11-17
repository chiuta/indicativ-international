import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.mjs';

const Q = (n, over) => Object.assign({
  id: 'ZZ-test-' + String(n).padStart(4, '0'), topic: 'electricity', question: 'Question number ' + n + '?',
  answers: ['first ' + n, 'second ' + n, 'third ' + n, 'fourth ' + n], correct: n % 4, source: 'written for the tests'
}, over || {});
const P = (over, qs) => Object.assign({
  format: 'indicativ-pack', version: 1, id: 'zz-test', title: 'Test pack', country: 'ZZ', licence_class: 'practice', lang: 'en',
  source: 'written for the tests', license: 'MIT', questions: qs || [Q(1), Q(2), Q(3)]
}, over || {});
const SVG = '<svg viewBox="0 0 100 50"><line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" stroke-width="2"/><text x="50" y="10" text-anchor="middle" font-size="10">R1</text></svg>';
const lone = String.fromCharCode(0xd800);

test('un pachet minim este valid și are lista de coduri goală', () => {
  assert.deepEqual(E.validatePack(P()), []);
  assert.deepEqual(E.validatePack(P({ exam: { questions: 2, minutes: 10, pass_percent: 70, wrong_penalty: 0.25, source: 'the rules page' } })), []);
});

test('codurile de eroare ale pachetului', () => {
  const cases = [
    [null, ['pack:type']], [[], ['pack:type']], ['x', ['pack:type']],
    [P({ format: 'x' }), ['pack:format']], [P({ version: 2 }), ['pack:version']], [P({ id: 'Bad Id' }), ['pack:id']], [P({ id: '' }), ['pack:id']],
    [P({ title: '' }), ['pack:title']], [P({ title: 'a\nb' }), ['pack:title']], [P({ country: 'zz' }), ['pack:country']], [P({ lang: 'english' }), ['pack:lang']],
    [P({ source: '' }), ['pack:source']], [P({ source_url: 'http://x.org/' }), ['pack:source_url']], [P({ source_url: 'https://x.org/a b' }), ['pack:source_url']],
    [P({ license: '' }), ['pack:license']], [P({ extra: 1 }), ['pack:extra']], [P({ questions: [] }), ['pack:questions']], [P({ questions: 'x' }), ['pack:questions']],
    [P({ title: 'a' + lone }), ['pack:title']]
  ];
  cases.forEach(([p, want]) => assert.deepEqual(E.validatePack(p), want, JSON.stringify(p).slice(0, 80)));
});

test('codurile de eroare ale întrebărilor', () => {
  const one = (over) => E.validatePack(P({}, [Q(1, over)]));
  assert.deepEqual(one({ id: 'x-1' }), ['q0:id']);
  assert.deepEqual(one({ id: 'ZZ-a-1' + 'x'.repeat(40) }), ['q0:id']);
  assert.deepEqual(one({ country: 'Z' }), ['q0:country']);
  assert.deepEqual(one({ licence_class: '' }), ['q0:licence_class']);
  assert.deepEqual(one({ topic: '' }), ['q0:topic']);
  assert.deepEqual(one({ question: '' }), ['q0:question']);
  assert.deepEqual(one({ question: 'x'.repeat(1001) }), ['q0:question']);
  assert.deepEqual(one({ answers: ['only'] }), ['q0:answers']);
  assert.deepEqual(one({ answers: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }), ['q0:answers']);
  assert.deepEqual(one({ answers: ['a', ''] , correct: 0 }), ['q0:answer_1']);
  assert.deepEqual(one({ answers: ['A', ' a ', 'c'], correct: 0 }), ['q0:answers_dup']);
  assert.deepEqual(one({ answers: ['Éa', 'ea', 'c'], correct: 0 }), ['q0:answers_dup']);
  assert.deepEqual(one({ correct: 4 }), ['q0:correct']);
  assert.deepEqual(one({ correct: -1 }), ['q0:correct']);
  assert.deepEqual(one({ correct: 1.5 }), ['q0:correct']);
  assert.deepEqual(one({ correct: '1' }), ['q0:correct']);
  assert.deepEqual(one({ answers: ['a'], correct: 9 }), ['q0:answers', 'q0:correct']);
  assert.deepEqual(one({ explanation: '' }), ['q0:explanation']);
  assert.deepEqual(one({ source: '' }), ['q0:source']);
  assert.deepEqual(one({ source_url: 'ftp://x' }), ['q0:source_url']);
  assert.deepEqual(one({ lang: 'EN' }), ['q0:lang']);
  assert.deepEqual(one({ fixed_order: 'yes' }), ['q0:fixed_order']);
  assert.deepEqual(one({ surprise: 1 }), ['q0:extra']);
  assert.deepEqual(one({ question: 'a' + lone }), ['q0:question']);
  assert.deepEqual(one({ syllabus_ref: 'A1' }), ['q0:syllabus_unknown']);
  assert.deepEqual(one({ syllabus_ref: '-x' }), ['q0:syllabus_ref']);
  assert.deepEqual(E.validatePack(P({}, [null])), ['q0:type']);
  assert.deepEqual(E.validatePack(P({}, ['text'])), ['q0:type']);
});

test('întrebările moștenesc țara, clasa și limba pachetului; o valoare greșită a pachetului se raportează o singură dată', () => {
  const p = P({}, [Q(1), Q(2, { country: 'HU', licence_class: 'A', lang: 'hu' })]);
  assert.deepEqual(E.validatePack(p), []);
  const c = E.canonicalPack(p);
  assert.equal(c.questions[0].country, undefined, 'valorile moștenite nu se repetă în pachetul canonic');
  assert.equal(c.questions[1].country, 'HU');
  assert.equal(E.canonicalQuestion(c.questions[0], c).country, 'ZZ');
  assert.deepEqual(E.validatePack(P({ country: 'x' }, [Q(1), Q(2)])), ['pack:country']);
  assert.deepEqual(E.validatePack(P({ licence_class: '' }, [Q(1), Q(2)])), ['pack:licence_class']);
  const noCountry = P({}, [Q(1)]); delete noCountry.country;
  assert.deepEqual(E.validatePack(noCountry), ['pack:country', 'q0:country']);
});

test('duplicate: identificatori și întrebări identice cu aceleași răspunsuri', () => {
  assert.deepEqual(E.validatePack(P({}, [Q(1), Q(1, { question: 'Another?' })])), ['q1:id_dup']);
  const a = Q(1), b = Q(2, { question: ' QUESTION  number 1? ', answers: a.answers.slice().reverse(), correct: 0 });
  assert.deepEqual(E.validatePack(P({}, [a, b])), ['q1:question_dup']);
  assert.deepEqual(E.validatePack(P({}, [a, Q(2, { question: a.question })])), [], 'același text, răspunsuri diferite: se admite');
});

test('subiectele (syllabus): referințele trebuie să existe, identificatorii sunt unici', () => {
  const syl = [{ id: 'E1', title: 'Ohm' }, { id: 'E2', title: 'Power' }];
  assert.deepEqual(E.validatePack(P({ syllabus: syl }, [Q(1, { syllabus_ref: 'E2' })])), []);
  assert.deepEqual(E.validatePack(P({ syllabus: syl }, [Q(1, { syllabus_ref: 'E3' })])), ['q0:syllabus_unknown']);
  assert.deepEqual(E.validatePack(P({ syllabus: [syl[0], syl[0]] })), ['syllabus1:dup']);
  assert.deepEqual(E.validatePack(P({ syllabus: [{ id: 'bad id', title: 'x' }] })), ['syllabus0:id']);
  assert.deepEqual(E.validatePack(P({ syllabus: [{ id: 'E1', title: '' }] })), ['syllabus0:title']);
  assert.deepEqual(E.validatePack(P({ syllabus: [{ id: 'E1', title: 'x', more: 1 }] })), ['syllabus0:extra']);
  assert.deepEqual(E.validatePack(P({ syllabus: 'x' })), ['pack:syllabus']);
  assert.deepEqual(E.validatePack(P({ syllabus: [5] })), ['syllabus0:type']);
});

test('regulile examenului cer sursă, valori întregi și nu pot cere mai multe întrebări decât are pachetul', () => {
  const ex = (o) => E.validatePack(P({ exam: Object.assign({ questions: 2, minutes: 10, pass_percent: 70, source: 'rules' }, o) }));
  assert.deepEqual(ex({}), []);
  assert.deepEqual(ex({ questions: 4 }), ['exam:too_many']);
  assert.deepEqual(ex({ questions: 0 }), ['exam:questions']);
  assert.deepEqual(ex({ minutes: 0 }), ['exam:minutes']);
  assert.deepEqual(ex({ minutes: 601 }), ['exam:minutes']);
  assert.deepEqual(ex({ pass_percent: 101 }), ['exam:pass_percent']);
  assert.deepEqual(ex({ pass_percent: 66.5 }), ['exam:pass_percent']);
  assert.deepEqual(ex({ wrong_penalty: 2 }), ['exam:wrong_penalty']);
  assert.deepEqual(ex({ source: '' }), ['exam:source']);
  assert.deepEqual(ex({ other: 1 }), ['exam:extra']);
  assert.deepEqual(E.validatePack(P({ exam: 5 })), ['exam:type']);
});

test('figura: SVG restrâns, validat de un analizor propriu', () => {
  assert.deepEqual(E.figureIssues(SVG), []);
  assert.deepEqual(E.figureIssues('  ' + SVG + '\n'), []);
  const withG = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" fill="none"><g transform="translate(1 2) rotate(45) scale(2)"><rect x="1" y="1" width="5" height="5" rx="1" fill="#f00"/><circle cx="5" cy="5" r="2"/><ellipse cx="5" cy="5" rx="3" ry="1"/><polyline points="0,0 5,5 10,0"/><polygon points="0 0 5 5 0 5"/><path d="M0 0 L10 10 Z" stroke-linecap="round" stroke-linejoin="bevel" stroke-dasharray="2 1"/></g></svg>';
  assert.deepEqual(E.figureIssues(withG), []);
  const bad = {
    script: ['<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>', ['tag']],
    onload: ['<svg viewBox="0 0 10 10" onload="x()"></svg>', ['attr']],
    style: ['<svg viewBox="0 0 10 10"><rect x="0" y="0" width="1" height="1" style="fill:red"/></svg>', ['attr']],
    href: ['<svg viewBox="0 0 10 10"><use href="#a"/></svg>', ['tag']],
    image: ['<svg viewBox="0 0 10 10"><image href="https://x"/></svg>', ['tag']],
    foreign: ['<svg viewBox="0 0 10 10"><foreignObject></foreignObject></svg>', ['syntax']],
    foreign2: ['<svg viewBox="0 0 10 10"><iframe/></svg>', ['tag']],
    entity: ['<svg viewBox="0 0 10 10"><text x="1" y="1">a &amp; b</text></svg>', ['text_chars']],
    comment: ['<svg viewBox="0 0 10 10"><!-- x --></svg>', ['syntax']],
    cdata: ['<svg viewBox="0 0 10 10"><![CDATA[x]]></svg>', ['syntax']],
    doctype: ['<!DOCTYPE svg><svg viewBox="0 0 10 10"></svg>', ['syntax']],
    xml: ['<?xml version="1.0"?><svg viewBox="0 0 10 10"></svg>', ['syntax']],
    noroot: ['<g></g>', ['root']],
    nested: ['<svg viewBox="0 0 10 10"><svg viewBox="0 0 1 1"></svg></svg>', ['nested_svg']],
    two: ['<svg viewBox="0 0 10 10"></svg><svg viewBox="0 0 10 10"></svg>', ['syntax']],
    trailing: ['<svg viewBox="0 0 10 10"></svg>x', ['syntax']],
    leading: ['x<svg viewBox="0 0 10 10"></svg>', ['syntax']],
    unclosed: ['<svg viewBox="0 0 10 10"><g>', ['syntax']],
    mismatch: ['<svg viewBox="0 0 10 10"><g></line></svg>', ['syntax']],
    upper: ['<SVG viewBox="0 0 10 10"></SVG>', ['syntax']],
    single: ["<svg viewBox='0 0 10 10'></svg>", ['syntax']],
    dup: ['<svg viewBox="0 0 10 10" viewBox="0 0 5 5"></svg>', ['attr_dup']],
    noviewbox: ['<svg><g/></svg>', ['viewbox']],
    badviewbox: ['<svg viewBox="0 0 0 10"></svg>', ['attr_value']],
    hugeviewbox: ['<svg viewBox="0 0 5000 10"></svg>', ['attr_value']],
    num: ['<svg viewBox="0 0 10 10"><line x1="1e3" y1="0" x2="1" y2="1"/></svg>', ['attr_value']],
    bignum: ['<svg viewBox="0 0 10 10"><line x1="99999" y1="0" x2="1" y2="1"/></svg>', ['attr_value']],
    negr: ['<svg viewBox="0 0 10 10"><circle cx="1" cy="1" r="-2"/></svg>', ['attr_value']],
    color: ['<svg viewBox="0 0 10 10"><g fill="red"/></svg>', ['attr_value']],
    url: ['<svg viewBox="0 0 10 10"><g fill="url(#a)"/></svg>', ['attr_value']],
    path: ['<svg viewBox="0 0 10 10"><path d="L0 0"/></svg>', ['attr_value']],
    pathbad: ['<svg viewBox="0 0 10 10"><path d="M0 0 X5"/></svg>', ['attr_value']],
    points: ['<svg viewBox="0 0 10 10"><polygon points="0 0 1"/></svg>', ['attr_value']],
    transform: ['<svg viewBox="0 0 10 10"><g transform="matrix(1 0 0 1 0 0)"/></svg>', ['attr_value']],
    transform2: ['<svg viewBox="0 0 10 10"><g transform="translate(1)rotate(2)"/></svg>', ['attr_value']],
    sw: ['<svg viewBox="0 0 10 10"><g stroke-width="21"/></svg>', ['attr_value']],
    fs: ['<svg viewBox="0 0 10 10"><text x="1" y="1" font-size="3">a</text></svg>', ['attr_value']],
    textnode: ['<svg viewBox="0 0 10 10">hello</svg>', ['text']],
    textlf: ['<svg viewBox="0 0 10 10"><text x="1" y="1">a\nb</text></svg>', ['text_chars']],
    textlong: ['<svg viewBox="0 0 10 10"><text x="1" y="1">' + 'a'.repeat(201) + '</text></svg>', ['text_chars']],
    xmlns: ['<svg viewBox="0 0 10 10" xmlns="http://evil.example/"></svg>', ['attr_value']],
    closingattr: ['<svg viewBox="0 0 10 10"></svg x="1">', ['syntax']],
    big: ['<svg viewBox="0 0 10 10">' + '<g/>'.repeat(1500) + '</svg>', ['size']],
    nodes: ['<svg viewBox="0 0 10 10">' + '<g/>'.repeat(201) + '</svg>', ['nodes']],
    depth: ['<svg viewBox="0 0 10 10">' + '<g>'.repeat(6) + '</g>'.repeat(6) + '</svg>', ['depth']],
    notstr: [5, ['type']], emptystr: ['', ['syntax']]
  };
  Object.keys(bad).forEach((k) => assert.deepEqual(E.figureIssues(bad[k][0]), bad[k][1], k));
  assert.deepEqual(E.figureIssues('<svg viewBox="0 0 10 10">' + '<g>'.repeat(5) + '</g>'.repeat(5) + '</svg>'), []);
});

test('figura intră în întrebare doar cu un text alternativ, iar textul alternativ nu apare fără figură', () => {
  assert.deepEqual(E.validatePack(P({}, [Q(1, { figure: SVG, figure_alt: 'A line with a label.' })])), []);
  assert.deepEqual(E.validatePack(P({}, [Q(1, { figure: SVG })])), ['q0:figure_alt']);
  assert.deepEqual(E.validatePack(P({}, [Q(1, { figure: SVG, figure_alt: '' })])), ['q0:figure_alt']);
  assert.deepEqual(E.validatePack(P({}, [Q(1, { figure_alt: 'x' })])), ['q0:figure_alt_alone']);
  assert.deepEqual(E.validatePack(P({}, [Q(1, { figure: '<svg viewBox="0 0 1 1"><script/></svg>', figure_alt: 'x' })])), ['q0:figure_tag']);
});

test('analizorul de figuri dă arborele din care interfața construiește elementele', () => {
  const r = E.parseFigure(SVG);
  assert.deepEqual(r.issues, []);
  assert.equal(r.tree.tag, 'svg');
  assert.deepEqual(r.tree.attrs, [['viewBox', '0 0 100 50']]);
  assert.deepEqual(r.tree.kids.map((k) => k.tag), ['line', 'text']);
  assert.equal(r.tree.kids[1].text, 'R1');
  assert.deepEqual(r.tree.kids[0].attrs.map((a) => a[0]), ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width']);
  assert.equal(E.parseFigure('<svg><g/></svg>').tree, null);
});

test('text cu formule: indici și exponenți între acolade', () => {
  const j = (t) => JSON.stringify(E.richParts(t));
  assert.equal(j('f_{0} = 1 / (2π√(LC))'), JSON.stringify([{ k: 't', s: 'f' }, { k: 'sub', s: '0' }, { k: 't', s: ' = 1 / (2π√(LC))' }]));
  assert.equal(j('10^{-6} F'), JSON.stringify([{ k: 't', s: '10' }, { k: 'sup', s: '-6' }, { k: 't', s: ' F' }]));
  assert.equal(j('snake_case and x^2 and a_{}'), JSON.stringify([{ k: 't', s: 'snake_case and x^2 and a_{}' }]));
  assert.equal(j('a_{1}^{2}'), JSON.stringify([{ k: 't', s: 'a' }, { k: 'sub', s: '1' }, { k: 'sup', s: '2' }]));
  assert.equal(j(''), '[]');
  assert.equal(j('<b>x</b>'), JSON.stringify([{ k: 't', s: '<b>x</b>' }]), 'HTML rămâne text');
});

test('importul parțial păstrează doar întrebările valide și spune care au căzut', () => {
  const p = P({}, [Q(1), Q(2, { correct: 9 }), Q(3), Q(3, { question: 'dup id' }), Q(5, { answers: ['x'] })]);
  assert.ok(E.validatePack(p).length > 0);
  const r = E.validPart(p);
  assert.deepEqual(r.pack.questions.map((q) => q.id), ['ZZ-test-0001', 'ZZ-test-0003']);
  assert.deepEqual(r.dropped, [1, 3, 4]);
  assert.deepEqual(E.validatePack(r.pack), []);
  assert.equal(E.validPart(P({ title: '' })), null, 'antet greșit: nu se păstrează nimic');
  assert.equal(E.validPart(P({}, [Q(1, { correct: 9 })])), null, 'nicio întrebare validă');
  const withExam = E.validPart(P({ exam: { questions: 3, minutes: 5, pass_percent: 50, source: 's' } }, [Q(1), Q(2, { correct: 9 }), Q(3)]));
  assert.equal(withExam.pack.exam, undefined, 'regulile care cer mai multe întrebări decât au rămas se aruncă');
});

test('pachetul canonic are cheile în ordine fixă și nu repetă valorile moștenite', () => {
  const p = P({ source_url: 'https://example.org/bank', syllabus: [{ id: 'E1', title: 'Ohm' }] }, [Q(1, { syllabus_ref: 'E1', explanation: 'because', lang: 'en' }), Q(2, { country: 'ZZ' })]);
  assert.deepEqual(E.validatePack(p), []);
  const c = E.canonicalPack(p);
  assert.deepEqual(Object.keys(c), ['format', 'version', 'id', 'title', 'country', 'licence_class', 'lang', 'source', 'source_url', 'license', 'syllabus', 'questions']);
  assert.deepEqual(Object.keys(c.questions[0]), ['id', 'topic', 'question', 'answers', 'correct', 'explanation', 'source', 'syllabus_ref']);
  assert.deepEqual(E.validatePack(c), []);
  assert.deepEqual(E.canonicalPack(c), c, 'idempotent');
  c.questions[0].answers.push('changed');
  assert.equal(p.questions[0].answers.length, 4, 'copie, nu aceleași obiecte');
});

test('parsePackText: gol, prea mare, JSON stricat, cu BOM', () => {
  assert.deepEqual(E.parsePackText(''), { error: 'empty' });
  assert.deepEqual(E.parsePackText('   '), { error: 'empty' });
  assert.deepEqual(E.parsePackText(5), { error: 'empty' });
  assert.deepEqual(E.parsePackText('{'), { error: 'json' });
  assert.deepEqual(E.parsePackText('x'.repeat(E.LIMITS.import_chars + 1)), { error: 'big' });
  assert.deepEqual(E.parsePackText(String.fromCharCode(0xfeff) + '{"a":1}'), { pack: { a: 1 } });
  const hostile = E.parsePackText('{"__proto__":{"polluted":1},"format":"indicativ-pack"}');
  assert.deepEqual(E.validatePack(hostile.pack).includes('pack:extra'), true);
  assert.equal({}.polluted, undefined);
});

test('amestecul este determinist după sămânță și răspunsurile pot rămâne în ordinea din fișier', () => {
  const a = E.shuffled(10, 5), b = E.shuffled(10, 5), c = E.shuffled(10, 6);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.deepEqual(a.slice().sort((x, y) => x - y), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(E.shuffled(0, 1), []);
  assert.deepEqual(E.shuffled(1, 1), [0]);
  const q = Q(1);
  assert.deepEqual(E.answerOrder(q, 7), E.answerOrder(q, 7));
  assert.deepEqual(E.answerOrder(q, 7).slice().sort(), [0, 1, 2, 3]);
  assert.deepEqual(E.answerOrder(Q(1, { fixed_order: true }), 7), [0, 1, 2, 3]);
  const seen = new Set();
  for (let s = 0; s < 40; s++) seen.add(E.answerOrder(q, s).join(''));
  assert.ok(seen.size >= 10, 'sămânțe diferite dau ordini diferite (' + seen.size + ')');
  const first = [0, 0, 0, 0];
  for (let s = 0; s < 4000; s++) first[E.answerOrder(q, s)[0]]++;
  assert.ok(first.every((n) => n > 800 && n < 1200), 'fiecare răspuns apare pe primul loc cam la fel de des: ' + first);
  assert.equal(E.hash32('abc'), 440920331);
});

test('ziua calendaristică locală este aceeași toată ziua', () => {
  assert.equal(E.dayOf(new Date(2026, 10, 17, 0, 0, 1)), E.dayOf(new Date(2026, 10, 17, 23, 59, 59)));
  assert.equal(E.dayOf(new Date(2026, 10, 18, 0, 0, 0)) - E.dayOf(new Date(2026, 10, 17, 12)), 1);
  assert.equal(E.dayOf(new Date(1970, 0, 1)), 0);
  assert.equal(E.dayOf(new Date(2026, 2, 29, 12)) - E.dayOf(new Date(2026, 2, 28, 12)), 1, 'trecerea la ora de vară nu strică numărătoarea');
});

test('repetare eșalonată: cutii, intervale, răspuns greșit', () => {
  const T = 20000;
  let s = E.review(null, true, T);
  assert.deepEqual(s, { b: 1, d: T + 1, f: T, r: 1, w: 0 });
  s = E.review(s, true, T + 1);
  assert.deepEqual(s, { b: 2, d: T + 1 + 3, f: T, r: 2, w: 0 });
  s = E.review(s, true, T + 4); s = E.review(s, true, T + 11); s = E.review(s, true, T + 25);
  assert.deepEqual(s, { b: 5, d: T + 25 + 30, f: T, r: 5, w: 0 });
  s = E.review(s, true, T + 55);
  assert.equal(s.b, 5, 'nu depășește ultima cutie');
  const wrong = E.review(s, false, T + 90);
  assert.deepEqual(wrong, { b: 1, d: T + 90, f: T, r: 6, w: 1 });
  assert.deepEqual(E.review(null, false, T), { b: 1, d: T, f: T, r: 0, w: 1 });
  const before = { b: 2, d: 5, f: 1, r: 2, w: 0 };
  E.review(before, true, 9);
  assert.deepEqual(before, { b: 2, d: 5, f: 1, r: 2, w: 0 }, 'starea veche nu se modifică');
});

test('coada de întrebări: scadente întâi, apoi noi, cu limita zilnică de întrebări noi', () => {
  const qs = [];
  for (let i = 1; i <= 30; i++) qs.push(Q(i, { topic: i % 2 ? 'odd' : 'even' }));
  const T = 20000;
  const id = (i) => qs[i - 1].id;
  assert.deepEqual(E.buildQueue(qs, {}, T, { newPerDay: 3 }), [id(1), id(2), id(3)]);
  const prog = {};
  prog[id(5)] = { b: 2, d: T - 3, f: T - 10, r: 2, w: 0 };
  prog[id(6)] = { b: 1, d: T - 3, f: T - 10, r: 1, w: 0 };
  prog[id(7)] = { b: 1, d: T - 9, f: T - 10, r: 1, w: 0 };
  prog[id(8)] = { b: 3, d: T + 2, f: T - 10, r: 3, w: 0 };
  assert.deepEqual(E.buildQueue(qs, prog, T, { newPerDay: 2 }), [id(7), id(6), id(5), id(1), id(2)]);
  prog[id(9)] = { b: 1, d: T + 1, f: T, r: 1, w: 0 };
  assert.deepEqual(E.buildQueue(qs, prog, T, { newPerDay: 2 }).slice(3), [id(1)], 'o întrebare văzută azi întâia oară ocupă din limita zilnică');
  assert.deepEqual(E.buildQueue(qs, prog, T, { newPerDay: 1 }).slice(3), [], 'limita zilnică atinsă');
  assert.deepEqual(E.buildQueue(qs, prog, T, { newPerDay: 0 }), [id(7), id(6), id(5)]);
  assert.deepEqual(E.buildQueue(qs, prog, T + 5, { newPerDay: 0 }), [id(7), id(6), id(5), id(9), id(8)]);
  assert.deepEqual(E.buildQueue(qs, prog, T, { newPerDay: 3, topic: 'odd' }), [id(7), id(5), id(1), id(3)], 'filtrul de subiect');
  assert.equal(E.buildQueue(qs, {}, T, { newPerDay: 100 }).length, 30);
  assert.equal(E.buildQueue(qs, {}, T, { newPerDay: 100, max: 7 }).length, 7);
  assert.equal(E.buildQueue(qs, {}, T, { newPerDay: 100, max: 5000 }).length, 30, 'max necunoscut: limita implicită a sesiunii');
  assert.deepEqual(E.buildQueue(qs, {}, T, { newPerDay: 'many' }).length, 10, 'valoare nenumerică: 10 pe zi');
});

test('modurile «toate» și «slabe»', () => {
  const qs = [];
  for (let i = 1; i <= 12; i++) qs.push(Q(i));
  const T = 100;
  const all1 = E.buildQueue(qs, {}, T, { mode: 'all', seed: 1 }), all2 = E.buildQueue(qs, {}, T, { mode: 'all', seed: 1 }), all3 = E.buildQueue(qs, {}, T, { mode: 'all', seed: 2 });
  assert.deepEqual(all1, all2);
  assert.notDeepEqual(all1, all3);
  assert.deepEqual(all1.slice().sort(), qs.map((q) => q.id).sort());
  const prog = {};
  prog[qs[2].id] = { b: 1, d: T, f: 1, r: 1, w: 3 };
  prog[qs[3].id] = { b: 2, d: T + 5, f: 1, r: 4, w: 1 };
  prog[qs[4].id] = { b: 4, d: T + 5, f: 1, r: 9, w: 1 };
  prog[qs[5].id] = { b: 1, d: T + 5, f: 1, r: 2, w: 0 };
  assert.deepEqual(E.buildQueue(qs, prog, T, { mode: 'weak' }), [qs[2].id, qs[3].id]);
  assert.deepEqual(E.buildQueue(qs, prog, T, { mode: 'nonsense', newPerDay: 0 }), [qs[2].id], 'mod necunoscut: ca «scadente»');
});

test('numărătorile: scadente, cutii, pe subiect', () => {
  const qs = [Q(1, { topic: 'a' }), Q(2, { topic: 'a' }), Q(3, { topic: 'b' }), Q(4, { topic: 'b' })];
  const T = 50;
  const prog = {};
  prog[qs[0].id] = { b: 4, d: T + 10, f: 1, r: 5, w: 1 };
  prog[qs[1].id] = { b: 1, d: T - 1, f: 1, r: 1, w: 2 };
  prog[qs[2].id] = { b: 5, d: T, f: 1, r: 7, w: 0 };
  assert.deepEqual(E.dueCount(qs, prog, T), { due: 2, fresh: 1 });
  assert.deepEqual(E.boxCounts(qs, prog), [1, 1, 0, 0, 1, 1]);
  assert.deepEqual(E.topicsOf(qs), ['a', 'b']);
  assert.deepEqual(E.topicStats(qs, prog, T), [
    { topic: 'a', total: 2, seen: 2, right: 6, wrong: 3, mastered: 1, due: 1 },
    { topic: 'b', total: 2, seen: 1, right: 7, wrong: 0, mastered: 1, due: 1 }
  ]);
});

test('simulatorul: aceeași sămânță dă același examen, regulile vin din pachet sau sunt cele de exersare', () => {
  const qs = [];
  for (let i = 1; i <= 50; i++) qs.push(Q(i, { topic: ['a', 'b', 'c'][i % 3] }));
  const r = E.examRules(P());
  assert.deepEqual(r, { questions: 20, minutes: 30, pass_percent: 75, wrong_penalty: 0, source: '', declared: false });
  const r2 = E.examRules(P({ exam: { questions: 3, minutes: 7, pass_percent: 60, wrong_penalty: 0.5, source: 'rules page' } }));
  assert.deepEqual(r2, { questions: 3, minutes: 7, pass_percent: 60, wrong_penalty: 0.5, source: 'rules page', declared: true });
  const a = E.buildExam(qs, r, 123), b = E.buildExam(qs, r, 123), c = E.buildExam(qs, r, 124);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.ids, c.ids);
  assert.equal(a.ids.length, 20);
  assert.equal(new Set(a.ids).size, 20, 'fără repetări');
  assert.deepEqual({ n: a.n, minutes: a.minutes, pass: a.pass, penalty: a.penalty }, { n: 20, minutes: 30, pass: 75, penalty: 0 });
  assert.equal(E.buildExam(qs.slice(0, 5), r, 1).n, 5, 'pachet mai mic decât numărul cerut');
  assert.equal(E.buildExam(qs, { questions: 0, minutes: 1, pass_percent: 50 }, 1).n, 1);
  assert.equal(E.seedFrom('hello'), E.seedFrom(' hello '));
  assert.notEqual(E.seedFrom('hello'), E.seedFrom('hellp'));
});

test('scorul: prag de promovare exact, penalizare, subiecte', () => {
  const qs = [];
  for (let i = 1; i <= 8; i++) qs.push(Q(i, { topic: i <= 4 ? 'a' : 'b', correct: 0 }));
  const by = {}; qs.forEach((q) => { by[q.id] = q; });
  const ex = { ids: qs.map((q) => q.id), pass: 75, penalty: 0 };
  const ans = (list) => { const o = {}; list.forEach((v, i) => { if (v !== null) o[qs[i].id] = v; }); return o; };
  let s = E.scoreExam(ex, ans([0, 0, 0, 0, 0, 0, 1, null]), by);
  assert.deepEqual({ n: s.n, right: s.right, wrong: s.wrong, blank: s.blank, points: s.points, percent: s.percent, passed: s.passed }, { n: 8, right: 6, wrong: 1, blank: 1, points: 6, percent: 75, passed: true });
  assert.deepEqual(s.topics, [{ topic: 'a', n: 4, right: 4, wrong: 0, blank: 0 }, { topic: 'b', n: 4, right: 2, wrong: 1, blank: 1 }]);
  s = E.scoreExam(ex, ans([0, 0, 0, 0, 0, 1, 1, null]), by);
  assert.equal(s.passed, false);
  assert.equal(s.percent, 62.5);
  s = E.scoreExam({ ids: ex.ids, pass: 75, penalty: 0.25 }, ans([0, 0, 0, 0, 0, 0, 1, 2]), by);
  assert.deepEqual({ right: s.right, wrong: s.wrong, points: s.points, passed: s.passed }, { right: 6, wrong: 2, points: 5.5, passed: false });
  s = E.scoreExam({ ids: ex.ids, pass: 50, penalty: 1 }, ans([1, 1, 1, 1, 1, 1, 1, 1]), by);
  assert.deepEqual({ points: s.points, percent: s.percent, passed: s.passed }, { points: 0, percent: 0, passed: false }, 'punctajul nu coboară sub zero');
  s = E.scoreExam(ex, ans([0, 0, 0, 0, 0, 0, 0, 0]), by);
  assert.deepEqual({ percent: s.percent, passed: s.passed }, { percent: 100, passed: true });
  s = E.scoreExam(ex, { [qs[0].id]: 9, [qs[1].id]: -1, [qs[2].id]: 'x' }, by);
  assert.equal(s.blank, 8, 'răspunsuri în afara intervalului se socotesc nefăcute');
  s = E.scoreExam({ ids: ['nope'], pass: 50, penalty: 0 }, {}, by);
  assert.deepEqual({ n: s.n, passed: s.passed }, { n: 0, passed: false });
  const edge = E.scoreExam({ ids: ex.ids.slice(0, 3), pass: 67, penalty: 0 }, ans([0, 0, 1]), by);
  assert.equal(edge.passed, false, '2 din 3 = 66,7% nu atinge 67%');
  assert.equal(E.scoreExam({ ids: ex.ids.slice(0, 3), pass: 66, penalty: 0 }, ans([0, 0, 1]), by).passed, true);
});

test('cronometrul: timpul rămas și afișarea mm:ss', () => {
  const ex = { start: 1000000, minutes: 30 };
  assert.equal(E.remainingMs(ex, 1000000), 1800000);
  assert.equal(E.remainingMs(ex, 1000000 + 1800000), 0);
  assert.equal(E.remainingMs(ex, 1000000 + 1900000), 0);
  assert.equal(E.remainingMs(ex, 999000), 1801000, 'ceasul mergea înapoi: nu se limitează la durata examenului, interfața o face');
  assert.equal(E.clock(1800000), '30:00');
  assert.equal(E.clock(59001), '01:00');
  assert.equal(E.clock(59000), '00:59');
  assert.equal(E.clock(1), '00:01');
  assert.equal(E.clock(0), '00:00');
  assert.equal(E.clock(600 * 60000), '600:00');
});

test('starea unei întrebări: valori în afara limitelor sau de alt tip se resping', () => {
  assert.deepEqual(E.cleanState({ b: 1, d: 5, f: 5, r: 1, w: 0 }), { b: 1, d: 5, f: 5, r: 1, w: 0 });
  [null, 5, 'x', [], { b: 0, d: 1, f: 1, r: 0, w: 0 }, { b: 6, d: 1, f: 1, r: 0, w: 0 }, { b: 1.5, d: 1, f: 1, r: 0, w: 0 }, { b: 1, d: -1, f: 1, r: 0, w: 0 },
    { b: 1, d: 1, f: 1, r: 0 }, { b: '1', d: 1, f: 1, r: 0, w: 0 }, { b: 1, d: 1e9, f: 1, r: 0, w: 0 }, { b: 1, d: 1, f: 1, r: NaN, w: 0 }].forEach((x) => assert.equal(E.cleanState(x), null, JSON.stringify(x)));
  assert.deepEqual(E.cleanState({ b: 1, d: 5, f: 5, r: 1, w: 0, extra: 1 }), { b: 1, d: 5, f: 5, r: 1, w: 0 }, 'câmpurile în plus dispar');
});

test('progresul: curățare, export și import', () => {
  const known = { 'zz-test': { 'ZZ-test-0001': true, 'ZZ-test-0002': true } };
  const raw = JSON.parse('{"zz-test":{"ZZ-test-0001":{"b":2,"d":9,"f":3,"r":2,"w":0},"ZZ-test-0002":{"b":99},"ZZ-gone-0001":{"b":1,"d":1,"f":1,"r":1,"w":0},"__proto__":{"b":1,"d":1,"f":1,"r":1,"w":0}},"other":{"x":1},"__proto__":{"zz-test":{}}}');
  const c = E.cleanProgress(raw, known);
  assert.deepEqual(Object.keys(c), ['zz-test']);
  assert.deepEqual(Object.keys(c['zz-test']), ['ZZ-test-0001']);
  assert.deepEqual(E.cleanProgress('x', known), Object.create(null));
  const out = E.makeProgress(c, [{ pack: 'zz-test', day: 20000, n: 20, right: 15, percent: 75, passed: true, seed: 7, secs: 600 }]);
  assert.deepEqual(out.packs['zz-test']['ZZ-test-0001'], [2, 9, 3, 2, 0]);
  const back = E.parseProgress(JSON.stringify(out), known);
  assert.deepEqual(back.prog['zz-test']['ZZ-test-0001'], { b: 2, d: 9, f: 3, r: 2, w: 0 });
  assert.equal(back.history.length, 1);
  assert.deepEqual(E.parseProgress('{', known), { error: 'json' });
  assert.deepEqual(E.parseProgress('{"format":"x"}', known), { error: 'format' });
  assert.deepEqual(E.parseProgress(JSON.stringify({ format: 'indicativ-progress', version: 2, packs: {} }), known), { error: 'format' });
  assert.deepEqual(E.parseProgress('x'.repeat(E.LIMITS.import_chars + 1), known), { error: 'big' });
  const odd = E.parseProgress(JSON.stringify({ format: 'indicativ-progress', version: 1, packs: { 'zz-test': { 'ZZ-test-0001': [1, 2, 3], 'ZZ-test-0002': 'x' } }, history: 'x' }), known);
  assert.deepEqual(Object.keys(odd.prog['zz-test']), []);
  assert.deepEqual(odd.history, []);
});

test('istoricul examenelor: înregistrările greșite se aruncă, cel mult 30', () => {
  const h = (o) => Object.assign({ pack: 'zz-test', day: 20000, n: 20, right: 15, percent: 75, passed: true, seed: 7, secs: 600 }, o || {});
  const ok = E.cleanHistory([h(), h({ pack: 'Bad Pack' }), h({ right: 21 }), h({ percent: 101 }), h({ passed: 'yes' }), h({ seed: -1 }), h({ secs: 99999 }), null, 5, h({ n: 0 })]);
  assert.equal(ok.length, 1);
  assert.deepEqual(E.cleanHistory('x'), []);
  const many = []; for (let i = 0; i < 50; i++) many.push(h({ seed: i }));
  assert.equal(E.cleanHistory(many).length, 30);
  assert.deepEqual(Object.keys(E.cleanHistory([h({ evil: 1 })])[0]), ['pack', 'day', 'n', 'right', 'percent', 'passed', 'seed', 'secs']);
});

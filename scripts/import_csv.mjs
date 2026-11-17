#!/usr/bin/env node
// Turns a spreadsheet (CSV) of exam questions into a pack in the shared format and checks it with the same rules as the page and as
// scripts/validate.py. Needs Node.js 24 or newer; no other packages.
//
//   node scripts/import_csv.mjs questions.csv --id hu-ham-a --title "Hungary · class A" --country HU --class A --lang hu \
//        --source "Official question bank, 2026 edition" --source-url https://example.org/bank --license "see source" [--out data/packs/hu-ham-a.json]
//
// Columns (first row = names, any order; the delimiter , ; or tab is detected from it):
//   question, a, b (up to f)      the text and the answers (at least two)
//   correct                       the right answer: A–F or 1–6 (counting from 1)
//   topic                         subject (default: the pack's --topic, if given)
//   explanation, source, source_url, syllabus_ref, figure, figure_alt, fixed_order, id   optional; an empty «source» becomes the pack's --source
// A problem in any row stops the import (exit code 1, nothing written) unless you give --partial: then the valid rows are written.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FORMAT, validatePack, validPart, canonicalPack, parsePackText, issueParts } from '../src/engine.mjs';
import I18N from '../src/i18n.mjs';

const ANSWER_COLS = ['a', 'b', 'c', 'd', 'e', 'f'];
const KNOWN = ['id', 'topic', 'question', 'correct', 'explanation', 'source', 'source_url', 'syllabus_ref', 'figure', 'figure_alt', 'fixed_order'].concat(ANSWER_COLS);

/** CSV (RFC 4180: quotes, doubled quotes, line breaks inside quotes) -> [{line, cells: []}]. A blank line is skipped. */
export function parseCsv(text, delimiter) {
  const src = String(text).charCodeAt(0) === 0xfeff ? String(text).slice(1) : String(text);
  const rows = [];
  let cells = [], cell = '', quoted = false, line = 1, start = 1, i = 0, wasQuoted = false;
  const endCell = () => { cells.push(cell); cell = ''; wasQuoted = false; };
  const endRow = () => {
    const q = wasQuoted;   // an empty cell written as "" still makes the row a row
    endCell();
    if (!(cells.length === 1 && cells[0] === '' && !q)) rows.push({ line: start, cells });
    cells = []; start = line;
  };
  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { cell += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      if (c === '\r' && src[i + 1] === '\n') { i++; continue; }
      if (c === '\n') line++;
      cell += c; i++; continue;
    }
    if (c === '"' && cell === '') { quoted = true; wasQuoted = true; i++; continue; }
    if (c === delimiter) { endCell(); i++; continue; }
    if (c === '\r' && src[i + 1] === '\n') { i++; continue; }
    if (c === '\n' || c === '\r') { line++; i++; endRow(); start = line; continue; }
    cell += c; i++;
  }
  if (quoted) throw new Error('the file ends inside a quoted cell (starting on line ' + start + ')');
  if (cell !== '' || cells.length || wasQuoted) endRow();
  return rows;
}
/** The delimiter that the header line uses most: comma, semicolon or tab. */
export function detectDelimiter(text) {
  const first = String(text).replace(/^﻿/, '').split(/\r?\n/)[0] || '';
  let best = ',', n = 0;
  [',', ';', '\t'].forEach((d) => { const k = first.split(d).length - 1; if (k > n) { n = k; best = d; } });
  return best;
}
const BOOL = { true: true, yes: true, '1': true, false: false, no: false, '0': false };

/** rows (with the header first) + pack settings -> {pack, lines: [CSV line of each question], problems: [string], badLines: [lines with a problem found here]} */
export function buildPack(rows, o) {
  const problems = [];
  if (!rows.length) return { pack: null, lines: [], problems: ['the file is empty'], badLines: [] };
  const head = rows[0].cells.map((x) => x.trim().toLowerCase());
  const col = {};
  head.forEach((name, i) => {
    if (!name) return;
    if (KNOWN.indexOf(name) < 0) problems.push('line ' + rows[0].line + ': unknown column «' + name + '»');
    else if (Object.prototype.hasOwnProperty.call(col, name)) problems.push('line ' + rows[0].line + ': column «' + name + '» appears twice');
    else col[name] = i;
  });
  ['question', 'a', 'b', 'correct'].forEach((n) => { if (!Object.prototype.hasOwnProperty.call(col, n)) problems.push('line ' + rows[0].line + ': column «' + n + '» is missing'); });
  const prefix = o.prefix || String(o.id).split('-').slice(1).join('').replace(/[^A-Za-z0-9]/g, '') || 'q';
  const cc = String(o.country || '').toUpperCase();
  const questions = [], lines = [], badLines = [];
  if (problems.length) return { pack: null, lines, problems, badLines };
  rows.slice(1).forEach((r, n) => {
    const get = (k) => (Object.prototype.hasOwnProperty.call(col, k) && r.cells[col[k]] !== undefined ? r.cells[col[k]].replace(/^[ \t]+|[ \t]+$/g, '') : '');
    const bad = (m) => { problems.push('line ' + r.line + ': ' + m); if (badLines.indexOf(r.line) < 0) badLines.push(r.line); };
    const q = {};
    const id = get('id');
    q.id = id || cc + '-' + prefix + '-' + String(n + 1).padStart(4, '0');
    q.topic = get('topic') || o.topic || '';
    q.question = get('question');
    q.answers = ANSWER_COLS.map(get).filter((x) => x !== '');
    // an empty cell between two answers would shift the letters: refuse it instead of guessing
    const last = ANSWER_COLS.reduce((acc, k, i) => (get(k) !== '' ? i : acc), -1);
    if (q.answers.length !== last + 1) bad('answers must be filled in without gaps (a, b, c …)');
    const cv = get('correct').toUpperCase();
    let k = -1;
    if (/^[A-F]$/.test(cv)) k = cv.charCodeAt(0) - 65; else if (/^[1-6]$/.test(cv)) k = +cv - 1;
    if (k < 0) bad('«correct» must be A–F or 1–6');
    q.correct = k;
    const ex = get('explanation'); if (ex) q.explanation = ex;
    q.source = get('source') || o.source;
    const su = get('source_url'); if (su) q.source_url = su;
    const sr = get('syllabus_ref'); if (sr) q.syllabus_ref = sr;
    const fg = get('figure'); if (fg) q.figure = fg;
    const fa = get('figure_alt'); if (fa) q.figure_alt = fa;
    const fo = get('fixed_order').toLowerCase();
    if (fo) { if (Object.prototype.hasOwnProperty.call(BOOL, fo)) q.fixed_order = BOOL[fo]; else bad('«fixed_order» must be true, false, yes, no, 1 or 0'); }
    questions.push(q); lines.push(r.line);
  });
  const pack = { format: FORMAT, version: 1, id: o.id, title: o.title, country: cc, licence_class: o.licence_class, lang: o.lang, source: o.source };
  if (o.source_url) pack.source_url = o.source_url;
  pack.license = o.license;
  if (o.exam) pack.exam = o.exam;
  if (o.syllabus) pack.syllabus = o.syllabus;
  pack.questions = questions;
  return { pack, lines, problems, badLines };
}
const say = (k, a) => (a === undefined ? I18N.en[k] : I18N.en[k].replace('{0}', a));
/** The engine's codes as sentences: a question is named by its line in the CSV file, the code stays at the end in brackets. */
export function describe(codes, lines) {
  return codes.map((c) => {
    const p = issueParts(c), m = /^q([0-9]+):/.exec(c);
    const label = m ? 'line ' + lines[+m[1]] : p.lk ? say(p.lk, p.la) : p.la;
    return label + ': ' + say(p.tk, p.ta) + ' [' + c.slice(c.indexOf(':') + 1) + ']';
  });
}
/** -> {pack, dropped: [line…], problems: [...]}; with partial=true a pack with some bad rows is reduced to its valid rows. */
export function convert(text, o, partial) {
  const rows = parseCsv(text, o.delimiter || detectDelimiter(text));
  const built = buildPack(rows, o);
  if (!built.pack) return { pack: null, dropped: [], problems: built.problems };
  const bad = new Set(built.badLines);
  // a row that already has a problem of its own is not reported a second time with the engine's terse code
  const codes = validatePack(built.pack).filter((c) => { const m = /^q([0-9]+):/.exec(c); return !(m && bad.has(built.lines[+m[1]])); });
  const problems = built.problems.concat(describe(codes, built.lines));
  if (!problems.length) return { pack: canonicalPack(built.pack), dropped: [], problems: [] };
  if (!partial) return { pack: null, dropped: [], problems };
  const keep = built.pack.questions.map((q, i) => i).filter((i) => !bad.has(built.lines[i]));
  const sub = Object.assign({}, built.pack, { questions: keep.map((i) => built.pack.questions[i]) });
  const vp = validPart(sub);
  if (!vp) return { pack: null, dropped: [], problems };
  const dropped = built.badLines.concat(vp.dropped.map((j) => built.lines[keep[j]])).sort((x, y) => x - y);
  if (built.pack.exam && !vp.pack.exam) problems.push('the exam rules were left out: fewer questions remain than the exam asks for');
  return { pack: canonicalPack(vp.pack), dropped, problems };
}

function usage() {
  console.log('usage: node scripts/import_csv.mjs <file.csv> --id <pack-id> --title <text> --country <CC> --class <licence class> --lang <xx> --source <text> --license <text>\n' +
    '       [--source-url <https://…>] [--topic <default subject>] [--prefix <id part>] [--delimiter , ; or tab] [--syllabus <file.json>]\n' +
    '       [--exam-questions N --exam-minutes N --exam-pass N [--exam-penalty 0..1] --exam-source <text>] [--partial] [--check] [--out <file>|->]');
}
function main(argv) {
  const o = {}, flags = {};
  let file = '';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--partial' || a === '--check' || a === '--help') { flags[a.slice(2)] = true; continue; }
    if (a.startsWith('--')) { o[a.slice(2)] = argv[++i]; if (o[a.slice(2)] === undefined) { console.error('missing value for ' + a); return 2; } continue; }
    if (file) { console.error('only one input file is accepted'); return 2; }
    file = a;
  }
  if (flags.help || !file) { usage(); return flags.help ? 0 : 2; }
  const need = ['id', 'title', 'country', 'class', 'lang', 'source', 'license'].filter((k) => !o[k]);
  if (need.length) { console.error('missing option(s): ' + need.map((k) => '--' + k).join(' ')); usage(); return 2; }
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { console.error('cannot read ' + file + ': ' + e.message); return 2; }
  const exam = ['questions', 'minutes', 'pass', 'source'].some((k) => o['exam-' + k] !== undefined)
    ? { questions: +o['exam-questions'], minutes: +o['exam-minutes'], pass_percent: +o['exam-pass'], source: o['exam-source'] } : null;
  if (exam && o['exam-penalty'] !== undefined) exam.wrong_penalty = +o['exam-penalty'];
  let syllabus = null;
  if (o.syllabus) {
    try { syllabus = JSON.parse(fs.readFileSync(o.syllabus, 'utf8')); } catch (e) { console.error('cannot read the syllabus file: ' + e.message); return 2; }
  }
  const delimiter = o.delimiter === 'tab' ? '\t' : o.delimiter;
  let r;
  try {
    r = convert(text, { id: o.id, title: o.title, country: o.country, licence_class: o.class, lang: o.lang, source: o.source, source_url: o['source-url'], license: o.license,
      topic: o.topic, prefix: o.prefix, delimiter, exam, syllabus }, !!flags.partial);
  } catch (e) { console.error(e.message); return 1; }
  r.problems.slice(0, 50).forEach((p) => console.error(p));
  if (r.problems.length > 50) console.error('… and ' + (r.problems.length - 50) + ' more');
  if (!r.pack) { console.error('nothing written.'); return 1; }
  if (r.dropped.length) console.error('left out ' + r.dropped.length + ' row(s): lines ' + r.dropped.join(', '));
  const out = JSON.stringify(r.pack, null, 2) + '\n';
  // what is written must be accepted by the same parser the page uses
  const back = parsePackText(out);
  if (back.error || validatePack(back.pack).length) { console.error('internal error: the written pack does not validate'); return 1; }
  if (flags.check) { console.error('ok: ' + r.pack.questions.length + ' question(s), nothing written (--check).'); return 0; }
  const dest = o.out || path.join('data', 'packs', o.id + '.json');
  if (dest === '-') process.stdout.write(out);
  else { fs.writeFileSync(dest, out); console.error('wrote ' + dest + ' (' + r.pack.questions.length + ' questions).'); }
  return 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));

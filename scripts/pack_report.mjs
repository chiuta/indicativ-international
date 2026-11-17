#!/usr/bin/env node
// A summary of a pack for checking it against the official question bank: how many questions, per subject, the official numbers that are
// missing or repeated, where the right answers sit, a plain-text listing to compare with the official file, and a random sample for the
// second person who checks. Needs Node.js 24 or newer; no other packages.
//
//   node scripts/pack_report.mjs [pack.json …]                 summary (default: every pack of data/packs/ except example.json)
//   node scripts/pack_report.mjs pack.json --text              one line per question: number, text, answers, right answer
//   node scripts/pack_report.mjs pack.json --sample 30 --seed 7   the ids of 30 questions drawn at random (same seed, same questions)
//   node scripts/pack_report.mjs pack.json --json              the summary as JSON
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validatePack, parsePackText, issueParts, shuffled, hash32 } from '../src/engine.mjs';
import I18N from '../src/i18n.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LETTERS = 'ABCDEF';
const say = (k, a) => (a === undefined ? I18N.en[k] : I18N.en[k].replace('{0}', a));
const numberOf = (q) => { const m = /-([0-9]+)$/.exec(String(q && q.id)); return m ? +m[1] : null; };

/** pack (parsed JSON) -> counts and checks; works on invalid packs too, as far as their shape allows. */
export function report(pack) {
  const qs = pack && Array.isArray(pack.questions) ? pack.questions.filter((q) => q && typeof q === 'object') : [];
  const topics = [], by = Object.create(null), positions = [0, 0, 0, 0, 0, 0], seen = Object.create(null), repeated = [];
  let figures = 0, explanations = 0, refs = 0, fixed = 0;
  qs.forEach((q) => {
    const t = typeof q.topic === 'string' ? q.topic : '(none)';
    if (!by[t]) { by[t] = { topic: t, n: 0 }; topics.push(by[t]); }
    by[t].n++;
    if (Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 6) positions[q.correct]++;
    if (q.figure !== undefined) figures++;
    if (q.explanation !== undefined) explanations++;
    if (q.syllabus_ref !== undefined) refs++;
    if (q.fixed_order === true) fixed++;
    const n = numberOf(q);
    if (n !== null) { if (seen[n]) { if (repeated.indexOf(n) < 0) repeated.push(n); } else seen[n] = true; }
  });
  const nums = Object.keys(seen).map(Number).sort((a, b) => a - b);
  const missing = [];
  if (nums.length) for (let i = nums[0]; i <= nums[nums.length - 1]; i++) if (!seen[i]) missing.push(i);
  const problems = validatePack(pack);
  return {
    id: pack && pack.id, title: pack && pack.title, country: pack && pack.country, licence_class: pack && pack.licence_class, lang: pack && pack.lang,
    questions: qs.length, topics: topics, first: nums.length ? nums[0] : null, last: nums.length ? nums[nums.length - 1] : null, missing: missing, repeated: repeated.sort((a, b) => a - b),
    positions: positions, figures: figures, explanations: explanations, syllabus_refs: refs, fixed_order: fixed, problems: problems
  };
}
/** one line per question, for comparing with the text of the official file */
export function textLines(pack) {
  const one = (s) => String(s).replace(/\s*\n\s*/g, ' ');
  return (pack.questions || []).map((q) => [q.id, one(q.question), (q.answers || []).map((a, i) => LETTERS[i] + ') ' + one(a)).join(' | '), 'right: ' + (LETTERS[q.correct] || '?')].join('\t'));
}
/** ids of n questions drawn at random: the same seed gives the same questions, in the order of the pack */
export function sample(pack, n, seed) {
  const qs = pack.questions || [];
  const k = Math.max(0, Math.min(n, qs.length));
  return shuffled(qs.length, hash32('sample|' + seed)).slice(0, k).sort((a, b) => a - b).map((i) => qs[i].id);
}
/** a problem code as a sentence */
export function problemText(code) {
  const p = issueParts(code);
  const label = p.lk ? say(p.lk, p.la) : p.la;
  return label + ': ' + say(p.tk, p.ta) + ' [' + code.slice(code.indexOf(':') + 1) + ']';
}
const range = (a) => {
  const out = [];
  for (let i = 0; i < a.length; i++) {
    let j = i;
    while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++;
    out.push(j > i ? a[i] + '–' + a[j] : String(a[i]));
    i = j;
  }
  return out.join(', ');
};
export function format(r) {
  const out = [];
  out.push(r.id + ' · ' + r.title);
  out.push([r.country, r.licence_class, r.lang].join(' · ') + ' · ' + r.questions + ' questions · ' + (r.problems.length ? r.problems.length + ' problem(s)' : 'valid'));
  out.push('subjects:');
  r.topics.forEach((t) => out.push('  ' + String(t.n).padStart(5) + '  ' + t.topic));
  if (r.first !== null) {
    out.push('official numbers: ' + r.first + '–' + r.last + (r.missing.length ? '; missing: ' + (r.missing.length > 60 ? range(r.missing.slice(0, 60)) + ' … (' + r.missing.length + ' in all)' : range(r.missing)) : '; no gaps'));
    if (r.repeated.length) out.push('numbers used more than once: ' + range(r.repeated));
  }
  out.push('right answer at ' + r.positions.map((n, i) => (n || i < 4 ? LETTERS[i] + ' ' + n : '')).filter(Boolean).join(' · '));
  out.push('with explanation ' + r.explanations + ' · with figure ' + r.figures + ' · with syllabus_ref ' + r.syllabus_refs + ' · fixed order ' + r.fixed_order);
  r.problems.slice(0, 20).forEach((c) => out.push('problem: ' + problemText(c)));
  if (r.problems.length > 20) out.push('… and ' + (r.problems.length - 20) + ' more');
  return out.join('\n');
}

function main(argv) {
  const files = [], o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '--json' || a === '--help') o[a.slice(2)] = true;
    else if (a === '--sample' || a === '--seed') { o[a.slice(2)] = argv[++i]; if (o[a.slice(2)] === undefined) { console.error('missing value for ' + a); return 2; } }
    else if (a.startsWith('--')) { console.error('unknown option ' + a); return 2; }
    else files.push(a);
  }
  if (o.help) { console.log('usage: node scripts/pack_report.mjs [pack.json …] [--text | --json | --sample N [--seed S]]'); return 0; }
  if (o.sample !== undefined && !/^[0-9]+$/.test(o.sample)) { console.error('--sample needs a number'); return 2; }
  if (!files.length) {
    const dir = path.join(ROOT, 'data', 'packs');
    fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'example.json').sort().forEach((f) => files.push(path.join(dir, f)));
  }
  let bad = 0;
  const all = [];
  files.forEach((f, i) => {
    let pack;
    try {
      const r = parsePackText(fs.readFileSync(f, 'utf8'));
      if (r.error) throw new Error(r.error === 'json' ? 'not valid JSON' : r.error === 'big' ? 'the file is too big' : 'the file is empty');
      pack = r.pack;
    } catch (e) { console.error(f + ': ' + e.message); bad = 2; return; }
    if (o.text) { textLines(pack).forEach((l) => console.log(l)); return; }
    if (o.sample !== undefined) { console.log(sample(pack, +o.sample, o.seed === undefined ? '1' : o.seed).join('\n')); return; }
    const r = report(pack);
    if (r.problems.length && !bad) bad = 1;
    if (o.json) { all.push(r); return; }
    if (i) console.log('');
    console.log(format(r));
  });
  if (o.json) console.log(JSON.stringify(all.length === 1 ? all[0] : all, null, 2));
  return bad;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));

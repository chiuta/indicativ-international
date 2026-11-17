// INDICATIV International · motorul (logică pură, fără DOM). Sintaxă ES2017. Regulile de validare sunt aceleași ca în scripts/validate.py.
// Format comun: pachet de întrebări («indicativ-pack») · validatePack · canonicalPack · figureIssues · parseFigure · richParts
// Antrenor: review · buildQueue · topicStats · boxCounts · Examen: buildExam · scoreExam · remainingMs · Progres: cleanProgress · makeProgress · parseProgress

export const FORMAT = 'indicativ-pack';
export const PROGRESS_FORMAT = 'indicativ-progress';
export const LIMITS = {
  pack_id: 40, title: 120, licence_class: 40, topic: 60, question: 1000, answer: 300, explanation: 1000, source: 300, url: 500, license: 80,
  qid: 40, syllabus_id: 40, syllabus_title: 160, syllabus: 500, questions: 3000, answers_min: 2, answers_max: 6,
  figure: 6000, figure_alt: 300, figure_nodes: 200, figure_depth: 6, figure_text: 200, figure_num: 10000,
  exam_questions: 200, exam_minutes: 600, packs: 8, import_chars: 3000000, store_chars: 4000000, hist: 30, session: 40, new_per_day: 100
};
// regulile examenului când pachetul nu are «exam»: valori de exersare, nu reguli oficiale
export const DEFAULT_EXAM = { questions: 20, minutes: 30, pass_percent: 75, wrong_penalty: 0 };
export const INTERVALS = [0, 1, 3, 7, 14, 30];   // zile până la următoarea repetare, după ce întrebarea ajunge în cutia 1…5 (cutia 0 = nouă)
export const MAX_BOX = 5;
export const MODES = ['due', 'all', 'weak'];

export const ID_RE = /^[A-Z]{2}-[A-Za-z0-9]+-[0-9]+$/;
export const PACK_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const LANG_RE = /^[a-z]{2,3}$/;
const SYL_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const CTRL_LINE = /[\u0000-\u001f\u007f]/;
const CTRL_TEXT = /[\u0000-\u0009\u000b-\u001f\u007f]/;
// adresă https:// fără spații și fără caractere de control (aceeași clasă în scripts/validate.py); flag «u»: lungimea în puncte de cod
const URL_RE = /^https:\/\/[^\u0000-\u0020\u007f-\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]{1,500}$/u;
const PACK_KEYS = ['format', 'version', 'id', 'title', 'country', 'licence_class', 'lang', 'source', 'source_url', 'license', 'exam', 'syllabus', 'questions'];
const Q_KEYS = ['id', 'country', 'licence_class', 'topic', 'question', 'answers', 'correct', 'explanation', 'source', 'source_url', 'syllabus_ref', 'lang', 'figure', 'figure_alt', 'fixed_order'];
const EXAM_KEYS = ['questions', 'minutes', 'pass_percent', 'wrong_penalty', 'source'];

function dict() { return Object.create(null); }
function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
function isInt(v, min, max) { return typeof v === 'number' && Math.floor(v) === v && v >= min && v <= max; }
// lungimea în puncte de cod (așa numără schema JSON și Python); -1 dacă are jumătăți de pereche surogat (JSON le admite, UTF-8 nu)
function cpLen(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++, n++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) { const d = s.charCodeAt(i + 1); if (d >= 0xdc00 && d <= 0xdfff) i++; else return -1; }
    else if (c >= 0xdc00 && c <= 0xdfff) return -1;
  }
  return n;
}
function str(v, min, max) { if (typeof v !== 'string') return false; const n = cpLen(v); return n >= min && n <= max; }
function line(v, max) { return str(v, 1, max) && !CTRL_LINE.test(v); }
function block(v, max) { return str(v, 1, max) && !CTRL_TEXT.test(v); }
export function isUrl(u) { return typeof u === 'string' && cpLen(u) >= 0 && URL_RE.test(u); }
// cheia de comparare a răspunsurilor și a întrebărilor: minuscule, fără semne diacritice combinate, spații comprimate
export function fold(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[ \t\r\n\u00a0]+/g, ' ').replace(/^ | $/g, '');
}

/* ---------------- figuri: SVG restrâns ---------------- */
// Doar elemente și atribute dintr-o listă scurtă, valori verificate, fără script, stil, referințe sau entități. Aceeași gramatică în scripts/validate.py.
const NUM = '-?[0-9]+(?:\\.[0-9]+)?';
const SEP = '[ ,]+';
const NUM_RE = new RegExp('^' + NUM + '$');
const NUMS_RE = new RegExp('^' + NUM + '(?:' + SEP + NUM + ')*$');
const VIEWBOX_RE = new RegExp('^' + NUM + SEP + NUM + SEP + '(' + NUM + ')' + SEP + '(' + NUM + ')$');
const XFORM = '(?:(?:translate|scale)\\(' + NUM + '(?:' + SEP + NUM + ')?\\)|rotate\\(' + NUM + '(?:' + SEP + NUM + SEP + NUM + ')?\\))';
const TRANSFORM_RE = new RegExp('^' + XFORM + '(?: ' + XFORM + ')*$');
const PATH_RE = /^[Mm][MmLlHhVvCcSsQqTtAaZz0-9 ,.-]*$/;
const COLOR_RE = /^(?:none|currentColor|#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})$/;
const TAG_RE = /<(\/?)([a-z]+)((?:[ \t\r\n]+[A-Za-z][A-Za-z0-9-]*="[^"<>&]*")*)[ \t\r\n]*(\/?)>/y;
const ATTR_RE = /([A-Za-z][A-Za-z0-9-]*)="([^"]*)"/g;
const TEXT_BAD = /[\u0000-\u001f\u007f<>&]/;
const COMMON = ['transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray'];
const TAGS = {
  svg: ['viewBox', 'xmlns', 'width', 'height'].concat(COMMON),
  g: COMMON,
  line: ['x1', 'y1', 'x2', 'y2'].concat(COMMON),
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'].concat(COMMON),
  circle: ['cx', 'cy', 'r'].concat(COMMON),
  ellipse: ['cx', 'cy', 'rx', 'ry'].concat(COMMON),
  polyline: ['points'].concat(COMMON),
  polygon: ['points'].concat(COMMON),
  path: ['d'].concat(COMMON),
  text: ['x', 'y', 'text-anchor', 'font-size'].concat(COMMON)
};
const NONNEG = { width: 1, height: 1, rx: 1, ry: 1, r: 1 };
function numOk(v) { return NUM_RE.test(v) && Math.abs(parseFloat(v)) <= LIMITS.figure_num; }
function attrOk(tag, name, v) {
  if (name === 'viewBox') { const m = v.match(VIEWBOX_RE); return !!m && parseFloat(m[1]) > 0 && parseFloat(m[2]) > 0 && parseFloat(m[1]) <= 2000 && parseFloat(m[2]) <= 2000 && v.split(/[ ,]+/).every(numOk); }
  if (name === 'xmlns') return v === 'http://www.w3.org/2000/svg';
  if (tag === 'svg' && (name === 'width' || name === 'height')) return numOk(v) && parseFloat(v) >= 1 && parseFloat(v) <= 2000;
  if (name === 'points') { if (!NUMS_RE.test(v)) return false; const p = v.split(/[ ,]+/); return p.length >= 4 && p.length % 2 === 0 && p.length <= 200 && p.every(numOk); }
  if (name === 'd') return v.length <= 2000 && PATH_RE.test(v);
  if (name === 'transform') return v.length <= 200 && TRANSFORM_RE.test(v) && (v.match(new RegExp(NUM, 'g')) || []).every(numOk);
  if (name === 'fill' || name === 'stroke') return COLOR_RE.test(v);
  if (name === 'stroke-width') return numOk(v) && parseFloat(v) >= 0 && parseFloat(v) <= 20;
  if (name === 'stroke-linecap') return v === 'butt' || v === 'round' || v === 'square';
  if (name === 'stroke-linejoin') return v === 'miter' || v === 'round' || v === 'bevel';
  if (name === 'stroke-dasharray') { if (!NUMS_RE.test(v)) return false; const p = v.split(/[ ,]+/); return p.length <= 8 && p.every(numOk); }
  if (name === 'text-anchor') return v === 'start' || v === 'middle' || v === 'end';
  if (name === 'font-size') return numOk(v) && parseFloat(v) >= 4 && parseFloat(v) <= 48;
  if (NONNEG[name]) return numOk(v) && parseFloat(v) >= 0;
  return numOk(v);   // x y x1 y1 x2 y2 cx cy
}
// -> {issues: [cod…], tree: {tag, attrs, kids, text}|null}. Se oprește la prima eroare de sintaxă; erorile de conținut se adună.
export function parseFigure(svg) {
  const issues = [];
  const add = function (c) { if (issues.indexOf(c) < 0) issues.push(c); };
  if (typeof svg !== 'string') return { issues: ['type'], tree: null };
  const n = cpLen(svg);
  if (n < 0 || n > LIMITS.figure) return { issues: ['size'], tree: null };
  let pos = 0, count = 0, root = null;
  const stack = [];
  const skipWs = function () { while (pos < svg.length && ' \t\r\n'.indexOf(svg.charAt(pos)) >= 0) pos++; };
  skipWs();
  while (pos < svg.length) {
    if (svg.charAt(pos) === '<') {
      TAG_RE.lastIndex = pos;
      const m = TAG_RE.exec(svg);
      if (!m) { add('syntax'); return { issues: issues, tree: null }; }
      pos = TAG_RE.lastIndex;
      const closing = m[1] === '/', name = m[2], attrStr = m[3], selfClose = m[4] === '/';
      if (closing) {
        if (attrStr || selfClose || !stack.length || stack[stack.length - 1].tag !== name) { add('syntax'); return { issues: issues, tree: null }; }
        stack.pop();
        if (!stack.length) { skipWs(); if (pos < svg.length) { add('syntax'); return { issues: issues, tree: null }; } }
        continue;
      }
      if (!TAGS[name]) { add('tag'); return { issues: issues, tree: null }; }
      if (!root && name !== 'svg') { add('root'); return { issues: issues, tree: null }; }
      if (root && !stack.length) { add('syntax'); return { issues: issues, tree: null }; }
      if (name === 'svg' && root) { add('nested_svg'); return { issues: issues, tree: null }; }
      count++;
      if (count > LIMITS.figure_nodes) { add('nodes'); return { issues: issues, tree: null }; }
      if (stack.length >= LIMITS.figure_depth) { add('depth'); return { issues: issues, tree: null }; }
      const node = { tag: name, attrs: [], kids: [], text: '' };
      const seen = dict();
      let am;
      ATTR_RE.lastIndex = 0;
      while ((am = ATTR_RE.exec(attrStr))) {
        const an = am[1], av = am[2];
        if (seen[an]) { add('attr_dup'); continue; }
        seen[an] = true;
        if (TAGS[name].indexOf(an) < 0) { add('attr'); continue; }
        if (!attrOk(name, an, av)) { add('attr_value'); continue; }
        node.attrs.push([an, av]);
      }
      if (name === 'svg' && !seen.viewBox) add('viewbox');
      if (stack.length) stack[stack.length - 1].kids.push(node); else root = node;
      if (!selfClose) stack.push(node);
      else if (!stack.length) { skipWs(); if (pos < svg.length) { add('syntax'); return { issues: issues, tree: null }; } }
    } else {
      let j = svg.indexOf('<', pos);
      if (j < 0) j = svg.length;
      const txt = svg.slice(pos, j);
      pos = j;
      if (!stack.length) { if (txt.replace(/[ \t\r\n]+/g, '')) { add('syntax'); return { issues: issues, tree: null }; } continue; }
      const top = stack[stack.length - 1];
      if (txt.replace(/[ \t\r\n]+/g, '') === '') continue;
      if (top.tag !== 'text') { add('text'); continue; }
      if (TEXT_BAD.test(txt) || cpLen(txt) > LIMITS.figure_text) { add('text_chars'); continue; }
      top.text += txt;
    }
  }
  if (stack.length || !root) { add('syntax'); return { issues: issues, tree: null }; }
  return { issues: issues, tree: issues.length ? null : root };
}
export function figureIssues(svg) { return parseFigure(svg).issues; }

/* ---------------- text cu formule: f_{0}, 10^{-6} ---------------- */
// -> [{k: 't'|'sub'|'sup', s}]. Doar _{…} și ^{…} cu conținut nevid fără acolade; orice altceva rămâne text.
export function richParts(text) {
  const out = [];
  const re = /([_^])\{([^{}]+)\}/g;
  let last = 0, m;
  const s = String(text);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ k: 't', s: s.slice(last, m.index) });
    out.push({ k: m[1] === '_' ? 'sub' : 'sup', s: m[2] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ k: 't', s: s.slice(last) });
  return out;
}

/* ---------------- validare ---------------- */
// întrebarea completă = valorile din pachet (country, licence_class, lang) + câmpurile ei
export function canonicalQuestion(q, pack) {
  const o = {};
  if (!isObj(q)) return o;
  const p = isObj(pack) ? pack : {};
  if (p.country !== undefined) o.country = p.country;
  if (p.licence_class !== undefined) o.licence_class = p.licence_class;
  if (p.lang !== undefined) o.lang = p.lang;
  Object.keys(q).forEach(function (k) { o[k] = q[k]; });
  return o;
}
function uniq(list) {
  const seen = dict(), out = [];
  list.forEach(function (c) { if (!seen[c]) { seen[c] = true; out.push(c); } });
  return out;
}
// -> [cod…]; fiecare cod: «<unde>:<ce>»
export function validateQuestion(q, where, syllabusIds) {
  const w = where + ':';
  if (!isObj(q)) return [w + 'type'];
  const out = [];
  Object.keys(q).forEach(function (k) { if (Q_KEYS.indexOf(k) < 0) out.push(w + 'extra'); });
  if (!(typeof q.id === 'string' && q.id.length <= LIMITS.qid && ID_RE.test(q.id))) out.push(w + 'id');
  if (!(typeof q.country === 'string' && COUNTRY_RE.test(q.country))) out.push(w + 'country');
  if (!line(q.licence_class, LIMITS.licence_class)) out.push(w + 'licence_class');
  if (!line(q.topic, LIMITS.topic)) out.push(w + 'topic');
  if (!block(q.question, LIMITS.question)) out.push(w + 'question');
  const a = q.answers;
  const okAnswers = Array.isArray(a) && a.length >= LIMITS.answers_min && a.length <= LIMITS.answers_max;
  if (!okAnswers) out.push(w + 'answers');
  else {
    const seen = dict();
    a.forEach(function (x, j) {
      if (!line(x, LIMITS.answer)) { out.push(w + 'answer_' + j); return; }
      const k = fold(x);
      if (seen[k]) out.push(w + 'answers_dup');
      seen[k] = true;
    });
  }
  if (!isInt(q.correct, 0, okAnswers ? a.length - 1 : 5)) out.push(w + 'correct');
  if (q.explanation !== undefined && !block(q.explanation, LIMITS.explanation)) out.push(w + 'explanation');
  if (!line(q.source, LIMITS.source)) out.push(w + 'source');
  if (q.source_url !== undefined && !isUrl(q.source_url)) out.push(w + 'source_url');
  if (q.syllabus_ref !== undefined) {
    if (!(typeof q.syllabus_ref === 'string' && q.syllabus_ref.length <= LIMITS.syllabus_id && SYL_RE.test(q.syllabus_ref))) out.push(w + 'syllabus_ref');
    else if (!syllabusIds || !syllabusIds[q.syllabus_ref]) out.push(w + 'syllabus_unknown');
  }
  if (q.lang !== undefined && !(typeof q.lang === 'string' && LANG_RE.test(q.lang))) out.push(w + 'lang');
  if (q.fixed_order !== undefined && typeof q.fixed_order !== 'boolean') out.push(w + 'fixed_order');
  if (q.figure !== undefined) {
    figureIssues(q.figure).forEach(function (c) { out.push(w + 'figure_' + c); });
    if (!line(q.figure_alt, LIMITS.figure_alt)) out.push(w + 'figure_alt');
  } else if (q.figure_alt !== undefined) out.push(w + 'figure_alt_alone');
  return uniq(out);
}
function examIssues(e, nQuestions) {
  const out = [];
  if (!isObj(e)) return ['exam:type'];
  Object.keys(e).forEach(function (k) { if (EXAM_KEYS.indexOf(k) < 0) out.push('exam:extra'); });
  if (!isInt(e.questions, 1, LIMITS.exam_questions)) out.push('exam:questions');
  else if (e.questions > nQuestions) out.push('exam:too_many');
  if (!isInt(e.minutes, 1, LIMITS.exam_minutes)) out.push('exam:minutes');
  if (!isInt(e.pass_percent, 1, 100)) out.push('exam:pass_percent');
  if (e.wrong_penalty !== undefined && !(typeof e.wrong_penalty === 'number' && isFinite(e.wrong_penalty) && e.wrong_penalty >= 0 && e.wrong_penalty <= 1)) out.push('exam:wrong_penalty');
  if (!line(e.source, LIMITS.source)) out.push('exam:source');
  return out;
}
// antetul pachetului (tot ce nu sunt întrebările) -> {issues, syllabusIds}
function headerIssues(p) {
  const out = [];
  Object.keys(p).forEach(function (k) { if (PACK_KEYS.indexOf(k) < 0) out.push('pack:extra'); });
  if (p.format !== FORMAT) out.push('pack:format');
  if (p.version !== 1) out.push('pack:version');
  if (!(typeof p.id === 'string' && p.id.length <= LIMITS.pack_id && PACK_ID_RE.test(p.id))) out.push('pack:id');
  if (!line(p.title, LIMITS.title)) out.push('pack:title');
  if (!(typeof p.country === 'string' && COUNTRY_RE.test(p.country))) out.push('pack:country');
  if (!line(p.licence_class, LIMITS.licence_class)) out.push('pack:licence_class');
  if (!(typeof p.lang === 'string' && LANG_RE.test(p.lang))) out.push('pack:lang');
  if (!line(p.source, LIMITS.source)) out.push('pack:source');
  if (p.source_url !== undefined && !isUrl(p.source_url)) out.push('pack:source_url');
  if (!line(p.license, LIMITS.license)) out.push('pack:license');
  const ids = dict();
  if (p.syllabus !== undefined) {
    if (!Array.isArray(p.syllabus) || p.syllabus.length > LIMITS.syllabus) out.push('pack:syllabus');
    else p.syllabus.forEach(function (s, i) {
      const w = 'syllabus' + i + ':';
      if (!isObj(s)) { out.push(w + 'type'); return; }
      Object.keys(s).forEach(function (k) { if (k !== 'id' && k !== 'title') out.push(w + 'extra'); });
      if (!(typeof s.id === 'string' && s.id.length <= LIMITS.syllabus_id && SYL_RE.test(s.id))) out.push(w + 'id');
      else { if (ids[s.id]) out.push(w + 'dup'); ids[s.id] = true; }
      if (!line(s.title, LIMITS.syllabus_title)) out.push(w + 'title');
    });
  }
  return { issues: out, ids: ids };
}
// întrebarea cu valorile moștenite din pachet; o valoare moștenită greșită se raportează o singură dată, la pachet
function inherited(q, p) {
  const c = canonicalQuestion(q, p);
  if (isObj(q)) {
    if (q.country === undefined && p.country !== undefined) c.country = 'ZZ';
    if (q.licence_class === undefined && p.licence_class !== undefined) c.licence_class = 'x';
    if (q.lang === undefined && p.lang !== undefined) c.lang = 'en';
  }
  return c;
}
// -> [cod…] (lista goală = pachet valid)
export function validatePack(p) {
  if (!isObj(p)) return ['pack:type'];
  const h = headerIssues(p), out = h.issues.slice();
  if (!Array.isArray(p.questions) || p.questions.length < 1 || p.questions.length > LIMITS.questions) out.push('pack:questions');
  else {
    const seenId = dict(), seenQ = dict();
    p.questions.forEach(function (q, i) {
      if (!isObj(q)) { out.push('q' + i + ':type'); return; }
      const c = inherited(q, p);
      const iss = validateQuestion(c, 'q' + i, h.ids);
      iss.forEach(function (x) { out.push(x); });
      if (typeof c.id === 'string') { if (seenId[c.id]) out.push('q' + i + ':id_dup'); seenId[c.id] = true; }
      if (!iss.length) {
        const key = fold(c.question) + '|' + c.answers.map(fold).sort().join('|');
        if (seenQ[key]) out.push('q' + i + ':question_dup');
        seenQ[key] = true;
      }
    });
  }
  if (p.exam !== undefined) examIssues(p.exam, Array.isArray(p.questions) ? p.questions.length : 0).forEach(function (x) { out.push(x); });
  return uniq(out);
}
/* ---------------- texte pentru probleme ---------------- */
// «<unde>:<ce>» -> cheile din src/i18n.mjs care o spun: locul ({lk, la}: w_pack, w_exam, w_q, w_syl; lk gol = «la» este text simplu) și problema ({tk, ta}: e_*; ta lipsește când textul nu are loc de completat).
// Pagina și scripts/import_csv.mjs citesc de aici, deci nu pot ajunge să spună lucruri diferite.
export function issueParts(code) {
  const s = String(code), i = s.indexOf(':'), where = i < 0 ? s : s.slice(0, i), what = i < 0 ? '' : s.slice(i + 1);
  let m, lk = '', la = where;
  if (where === 'pack') { lk = 'w_pack'; la = undefined; } else if (where === 'exam') { lk = 'w_exam'; la = undefined; } else if ((m = /^q([0-9]+)$/.exec(where))) { lk = 'w_q'; la = +m[1] + 1; } else if ((m = /^syllabus([0-9]+)$/.exec(where))) { lk = 'w_syl'; la = +m[1] + 1; }
  const out = function (tk, ta) { return { lk: lk, la: la, tk: tk, ta: ta }; };
  if (what === 'type') return out('e_type');
  if (what === 'extra') return out('e_extra');
  if (where === 'exam') return what === 'too_many' ? out('e_exam_many') : out('e_field', what);
  if (where === 'pack') {
    if (what === 'format' || what === 'version') return out('e_format');
    if (what === 'questions') return out('e_questions');
    if (what === 'syllabus') return out('e_syllabus');
    return out('e_field', what);
  }
  if (/^syllabus[0-9]+$/.test(where)) return what === 'dup' ? out('e_id_dup') : out('e_field', what);
  if (what === 'answers') return out('e_answers');
  if (what === 'answers_dup') return out('e_answers_dup');
  if ((m = /^answer_([0-9]+)$/.exec(what))) return out('e_answer_n', +m[1] + 1);
  if (what === 'correct') return out('e_correct');
  if (what === 'id_dup') return out('e_id_dup');
  if (what === 'question_dup') return out('e_question_dup');
  if (what === 'syllabus_unknown') return out('e_syl_unknown');
  if (what === 'figure_alt' || what === 'figure_alt_alone') return out('e_figure_alt');
  if ((m = /^figure_([a-z_]+)$/.exec(what))) return out('e_figure', m[1]);
  return out('e_field', what);
}
// copie normalizată: ordinea cheilor fixă, întrebările complete (fără extra). Se apelează doar pe pachete valide.
export function canonicalPack(p) {
  const o = {};
  PACK_KEYS.forEach(function (k) {
    if (k === 'questions' || p[k] === undefined) return;
    o[k] = JSON.parse(JSON.stringify(p[k]));
  });
  o.questions = (p.questions || []).map(function (q) {
    const c = canonicalQuestion(q, p), r = {};
    Q_KEYS.forEach(function (k) { if (c[k] !== undefined && !(k === 'lang' && c[k] === p.lang) && !(k === 'country' && c[k] === p.country) && !(k === 'licence_class' && c[k] === p.licence_class)) r[k] = JSON.parse(JSON.stringify(c[k])); });
    return r;
  });
  return o;
}
// întrebările valide dintr-un pachet cu erori, dacă antetul pachetului e în regulă -> {pack, dropped: [index…]} | null
export function validPart(p) {
  if (!isObj(p) || !Array.isArray(p.questions)) return null;
  const h = headerIssues(p);
  if (h.issues.length) return null;
  const keep = [], dropped = [], seenId = dict(), seenQ = dict();
  p.questions.forEach(function (q, i) {
    if (!isObj(q)) { dropped.push(i); return; }
    const c = inherited(q, p);
    const iss = validateQuestion(c, 'q' + i, h.ids);
    let key = '';
    if (!iss.length) key = fold(c.question) + '|' + c.answers.map(fold).sort().join('|');
    if (!iss.length && !seenId[c.id] && !seenQ[key]) { keep.push(q); seenId[c.id] = true; seenQ[key] = true; } else dropped.push(i);
  });
  if (!keep.length || keep.length > LIMITS.questions) return null;
  const np = {};
  Object.keys(p).forEach(function (k) { if (k !== 'questions' && k !== 'exam') np[k] = p[k]; });
  np.questions = keep;
  if (isObj(p.exam) && !examIssues(p.exam, keep.length).length) np.exam = p.exam;
  return validatePack(np).length ? null : { pack: np, dropped: dropped };
}
export function parsePackText(text) {
  if (typeof text !== 'string' || !text.trim()) return { error: 'empty' };
  if (text.length > LIMITS.import_chars) return { error: 'big' };
  let v;
  try { v = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text); } catch (e) { return { error: 'json' }; }
  return { pack: v };
}

/* ---------------- ordine și amestec (determinist după sămânță) ---------------- */
export function hash32(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled(n, seed) {
  const a = [], r = rng(seed);
  for (let i = 0; i < n; i++) a.push(i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
// ordinea în care se arată răspunsurile (indici în q.answers); întrebările cu fixed_order rămân în ordinea din fișier
export function answerOrder(q, seed) {
  const n = q.answers.length;
  if (q.fixed_order) { const id = []; for (let i = 0; i < n; i++) id.push(i); return id; }
  return shuffled(n, hash32(q.id + '|' + seed));
}

/* ---------------- repetare eșalonată (cutii Leitner) ---------------- */
// numărul zilei calendaristice locale: zile de la 1970-01-01 (aceeași valoare pe tot parcursul zilei, indiferent de fusul orar)
export function dayOf(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
export function cleanState(s) {
  if (!isObj(s)) return null;
  const f = function (k, max) { return isInt(s[k], 0, max) ? s[k] : null; };
  const b = f('b', MAX_BOX), d = f('d', 3000000), fi = f('f', 3000000), r = f('r', 1000000), w = f('w', 1000000);
  if (b === null || b < 1 || d === null || fi === null || r === null || w === null) return null;
  return { b: b, d: d, f: fi, r: r, w: w };
}
// -> starea nouă (obiect nou) după un răspuns
export function review(st, correct, today) {
  const o = st || { b: 0, d: today, f: today, r: 0, w: 0 };
  const b = correct ? Math.min(MAX_BOX, o.b + 1) : 1;
  return { b: b, d: correct ? today + INTERVALS[b] : today, f: o.f, r: o.r + (correct ? 1 : 0), w: o.w + (correct ? 0 : 1) };
}
// ids în ordinea în care se pun întrebările. prog: {id: stare}. opts: {mode, topic, newPerDay, max, seed}
export function buildQueue(questions, prog, today, opts) {
  const o = opts || {};
  const mode = MODES.indexOf(o.mode) >= 0 ? o.mode : 'due';
  const max = isInt(o.max, 1, LIMITS.session) ? o.max : LIMITS.session;
  const pool = questions.filter(function (q) { return !o.topic || q.topic === o.topic; });
  if (mode === 'all') {
    const p = shuffled(pool.length, hash32('all|' + (o.seed || 0)));
    return p.slice(0, max).map(function (i) { return pool[i].id; });
  }
  if (mode === 'weak') {
    return pool.filter(function (q) { const s = prog[q.id]; return s && s.w > 0 && s.b <= 2; })
      .sort(function (a, b) { const x = prog[a.id], y = prog[b.id]; return x.b - y.b || y.w - x.w || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); })
      .slice(0, max).map(function (q) { return q.id; });
  }
  const due = pool.filter(function (q) { const s = prog[q.id]; return s && s.b >= 1 && s.d <= today; })
    .sort(function (a, b) { const x = prog[a.id], y = prog[b.id]; return x.d - y.d || x.b - y.b || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
  let introduced = 0;
  questions.forEach(function (q) { const s = prog[q.id]; if (s && s.f === today) introduced++; });
  const allow = Math.max(0, (isInt(o.newPerDay, 0, LIMITS.new_per_day) ? o.newPerDay : 10) - introduced);
  const fresh = pool.filter(function (q) { return !prog[q.id]; }).slice(0, allow);
  return due.concat(fresh).slice(0, max).map(function (q) { return q.id; });
}
export function dueCount(questions, prog, today) {
  let due = 0, fresh = 0;
  questions.forEach(function (q) { const s = prog[q.id]; if (!s) fresh++; else if (s.b >= 1 && s.d <= today) due++; });
  return { due: due, fresh: fresh };
}
export function boxCounts(questions, prog) {
  const c = [0, 0, 0, 0, 0, 0];
  questions.forEach(function (q) { const s = prog[q.id]; c[s ? s.b : 0]++; });
  return c;
}
// pe subiect: {topic, total, seen, right, wrong, mastered, due}
export function topicStats(questions, prog, today) {
  const by = dict(), order = [];
  questions.forEach(function (q) {
    let t = by[q.topic];
    if (!t) { t = by[q.topic] = { topic: q.topic, total: 0, seen: 0, right: 0, wrong: 0, mastered: 0, due: 0 }; order.push(q.topic); }
    t.total++;
    const s = prog[q.id];
    if (s) { t.seen++; t.right += s.r; t.wrong += s.w; if (s.b >= 4) t.mastered++; if (s.b >= 1 && s.d <= today) t.due++; }
  });
  return order.map(function (k) { return by[k]; });
}
export function topicsOf(questions) {
  const seen = dict(), out = [];
  questions.forEach(function (q) { if (!seen[q.topic]) { seen[q.topic] = true; out.push(q.topic); } });
  return out;
}

/* ---------------- simulator de examen ---------------- */
// regulile folosite: din pachet (cu sursa lor) sau cele de exersare
export function examRules(pack) {
  const e = pack && isObj(pack.exam) ? pack.exam : null;
  if (!e) return { questions: DEFAULT_EXAM.questions, minutes: DEFAULT_EXAM.minutes, pass_percent: DEFAULT_EXAM.pass_percent, wrong_penalty: 0, source: '', declared: false };
  return { questions: e.questions, minutes: e.minutes, pass_percent: e.pass_percent, wrong_penalty: e.wrong_penalty || 0, source: e.source, declared: true };
}
export function seedFrom(text) { return hash32('seed|' + String(text).trim()); }
// -> {seed, ids, n, minutes, pass, penalty}; aceeași sămânță dă aceleași întrebări în aceeași ordine
export function buildExam(questions, rules, seed) {
  const n = Math.max(1, Math.min(rules.questions, questions.length));
  const pick = shuffled(questions.length, hash32('exam|' + seed)).slice(0, n);
  return { seed: seed >>> 0, ids: pick.map(function (i) { return questions[i].id; }), n: n, minutes: rules.minutes, pass: rules.pass_percent, penalty: rules.wrong_penalty || 0 };
}
// answers: {id: indicele ales în q.answers | -1}. -> {n, right, wrong, blank, points, percent, passed, topics: [{topic, n, right, wrong, blank}]}
export function scoreExam(exam, answers, byId) {
  let right = 0, wrong = 0, blank = 0;
  const by = dict(), order = [];
  exam.ids.forEach(function (id) {
    const q = has(byId, id) ? byId[id] : null;
    if (!q) return;
    let t = by[q.topic];
    if (!t) { t = by[q.topic] = { topic: q.topic, n: 0, right: 0, wrong: 0, blank: 0 }; order.push(q.topic); }
    t.n++;
    const a = answers[id];
    if (!(isInt(a, 0, 5))) { blank++; t.blank++; }
    else if (a === q.correct) { right++; t.right++; }
    else { wrong++; t.wrong++; }
  });
  const n = right + wrong + blank;
  const points = Math.max(0, right - wrong * exam.penalty);
  const percent = n ? Math.round(points * 1000 / n) / 10 : 0;
  return { n: n, right: right, wrong: wrong, blank: blank, points: points, percent: percent, passed: n > 0 && points * 100 + 1e-9 >= exam.pass * n, topics: order.map(function (k) { return by[k]; }) };
}
export function remainingMs(exam, now) { return Math.max(0, exam.start + exam.minutes * 60000 - now); }
export function clock(ms) {
  const s = Math.ceil(ms / 1000), m = Math.floor(s / 60), r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
}

/* ---------------- progres: curățare, export, import ---------------- */
// prog brut -> {pack: {id: stare}} doar pentru pachetele date ({id pachet: {id întrebare: true}}); ce nu se potrivește se aruncă
export function cleanProgress(raw, known) {
  const out = dict();
  if (!isObj(raw)) return out;
  Object.keys(raw).forEach(function (pid) {
    if (!has(known, pid) || !isObj(raw[pid])) return;
    const m = dict();
    Object.keys(raw[pid]).forEach(function (qid) {
      if (!has(known[pid], qid)) return;
      const s = cleanState(raw[pid][qid]);
      if (s) m[qid] = s;
    });
    out[pid] = m;
  });
  return out;
}
export function makeProgress(prog, hist) {
  const o = { format: PROGRESS_FORMAT, version: 1, packs: {}, history: hist || [] };
  Object.keys(prog).forEach(function (pid) {
    const m = {};
    Object.keys(prog[pid]).forEach(function (qid) { const s = prog[pid][qid]; m[qid] = [s.b, s.d, s.f, s.r, s.w]; });
    o.packs[pid] = m;
  });
  return o;
}
// text -> {prog: {pack: {id: stare}}, history: []} | {error}
export function parseProgress(text, known) {
  if (typeof text !== 'string' || text.length > LIMITS.import_chars) return { error: 'big' };
  let v;
  try { v = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text); } catch (e) { return { error: 'json' }; }
  if (!isObj(v) || v.format !== PROGRESS_FORMAT || v.version !== 1 || !isObj(v.packs)) return { error: 'format' };
  const raw = dict();
  Object.keys(v.packs).forEach(function (pid) {
    if (!isObj(v.packs[pid])) return;
    const m = dict();
    Object.keys(v.packs[pid]).forEach(function (qid) {
      const a = v.packs[pid][qid];
      if (Array.isArray(a) && a.length === 5) m[qid] = { b: a[0], d: a[1], f: a[2], r: a[3], w: a[4] };
    });
    raw[pid] = m;
  });
  return { prog: cleanProgress(raw, known), history: cleanHistory(v.history) };
}
// o înregistrare de examen: {pack, day, n, right, percent, passed, seed, secs}
export function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  raw.forEach(function (h) {
    if (out.length >= LIMITS.hist || !isObj(h)) return;
    if (typeof h.pack === 'string' && h.pack.length <= LIMITS.pack_id && PACK_ID_RE.test(h.pack) && isInt(h.day, 0, 3000000) && isInt(h.n, 1, 1000) && isInt(h.right, 0, h.n) &&
      typeof h.percent === 'number' && h.percent >= 0 && h.percent <= 100 && typeof h.passed === 'boolean' && isInt(h.seed, 0, 4294967295) && isInt(h.secs, 0, 86400)) {
      out.push({ pack: h.pack, day: h.day, n: h.n, right: h.right, percent: h.percent, passed: h.passed, seed: h.seed, secs: h.secs });
    }
  });
  return out;
}

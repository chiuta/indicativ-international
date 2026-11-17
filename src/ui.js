/* INDICATIV International · interfața. Folosește din ambalaj: I18N, DATA, tr(), fmt() și motorul din engine.mjs.
   Sintaxă ES2017; fără atribute style= (CSP strict). Starea stă în localStorage sub trei chei (pachete importate, progres, examen început)
   și se verifică la fiecare citire: pachetele cu validatePack, progresul cu parseProgress, examenul cu cleanRun. */
var KEY_PACKS = 'indicativ-international.packs', KEY_PROG = 'indicativ-international.progress', KEY_RUN = 'indicativ-international.exam';
var TABS = ['train', 'exam', 'packs', 'guide'];
var SVG_NS = 'http://www.w3.org/2000/svg', LETTERS = 'ABCDEF';
var MAX_FILE = 8000000, MAX_SHOWN = 20, WARN_AT = [5, 2], HIST_SHOWN = 10;
var S = null, VIEWS = [], BUILT = [];
var V = { tab: 'train', main: null, live: null, focus: '', confirm: '', sess: null, xam: null, result: null, report: null, seedText: '', impText: '', tick: 0, clockEl: null, flagBtn: null, clearBtn: null, mapEl: null, confEl: null, warned: dict(), notice: '' };
var cur = { el: null, lang: 'en', L: null };
var booted = false;

/* ---------- ajutoare DOM ---------- */
function h(tag, attrs, kids) {
  var e = document.createElement(tag), k;
  if (attrs) for (k in attrs) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  if (kids) for (var i = 0; i < kids.length; i++) {
    var c = kids[i];
    if (c === null || c === undefined || c === false) continue;
    e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  return e;
}
function makeL(lang) {
  return {
    lang: lang,
    t: function (k) { return tr(lang, k); },
    f: function (k) { var a = [tr(lang, k)]; for (var i = 1; i < arguments.length; i++) a.push(arguments[i]); return fmt.apply(null, a); }
  };
}
function downloadBlob(name, blob) {
  try {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    return true;
  } catch (e) { return false; }
}
function downloadText(name, text) { return downloadBlob(name, new Blob([text], { type: 'application/json;charset=utf-8' })); }
function readText(file, done) {
  var L = cur.L;
  if (!file) return;
  if (file.size > MAX_FILE) { flash(L.t('i_err_big')); return; }
  var fr = new FileReader();
  fr.onload = function () { done(String(fr.result)); };
  fr.onerror = function () { flash(L.t('i_err_json')); };
  fr.readAsText(file, 'utf-8');
}
function flash(msg, lines) {
  var box = V.live;
  if (!box) return;
  box.textContent = '';
  if (msg) box.appendChild(h('p', { text: msg }));
  if (lines && lines.length) box.appendChild(h('ul', { class: 'in-lines' }, lines.map(function (x) { return h('li', { text: x }); })));
}
function field(label, control, id, cls) { return h('div', { class: 'in-f' + (cls ? ' ' + cls : '') }, [h('label', { for: id, text: label }), control]); }
function selectOf(id, options, value, onchange) {
  var s = h('select', { id: id, class: 'sel in-inp' }, options.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
  s.value = value;
  if (s.value !== value) s.selectedIndex = 0;
  s.addEventListener('change', function () { onchange(s.value); });
  return s;
}
function two(n) { return (n < 10 ? '0' : '') + n; }
function dayText(day) {
  var d = new Date(day * 86400000), y = d.getUTCFullYear();
  return (y > 9999 ? String(y) : ('000' + y).slice(-4)) + '-' + two(d.getUTCMonth() + 1) + '-' + two(d.getUTCDate());
}
function today() { return dayOf(new Date()); }
function num(n) { var s = String(n); return cur.lang === 'en' ? s : s.replace('.', ','); }
function pct(a, b) { return b ? Math.round(a * 100 / b) : 0; }
function plain(s) { return String(s).replace(/([_^])\{([^{}]+)\}/g, '$1$2'); }
function langAttr(code) { return typeof code === 'string' && /^[a-z]{2,3}$/.test(code) ? code : null; }
function inside(el, id) { while (el && el.nodeType === 1) { if (el.id === id) return true; el = el.parentNode; } return false; }
function rndSeed() { return ((Math.random() * 4294967296) ^ Date.now()) >>> 0; }
function parseSeed(text) {
  var t = String(text).trim();
  if (!t) return rndSeed();
  if (/^[0-9]{1,10}$/.test(t) && +t <= 4294967295) return +t;
  return seedFrom(t);
}
function refocus() {
  if (!V.focus) return;
  var f = document.getElementById(V.focus);
  if (f) { if (!/^(button|input|select|textarea|a)$/i.test(f.tagName)) f.setAttribute('tabindex', '-1'); f.focus(); }
  V.focus = '';
}

/* ---------- text cu formule și desene ---------- */
function rich(parent, text) {
  richParts(text).forEach(function (p) { parent.appendChild(p.k === 't' ? document.createTextNode(p.s) : h(p.k, { text: p.s })); });
  return parent;
}
function buildSvg(n) {
  var e = document.createElementNS(SVG_NS, n.tag);
  n.attrs.forEach(function (a) { e.setAttribute(a[0], a[1]); });
  if (n.text) e.appendChild(document.createTextNode(n.text));
  n.kids.forEach(function (k) { e.appendChild(buildSvg(k)); });
  return e;
}
// desenul se construiește din arborele verificat, nu din text: niciun element sau atribut care n-a trecut de gramatică nu ajunge în pagină
function figureEl(q) {
  if (q.figure === undefined) return null;
  var r = parseFigure(q.figure);
  if (!r.tree) return null;
  var svg = buildSvg(r.tree);
  svg.setAttribute('class', 'in-fig');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', q.figure_alt || '');
  svg.setAttribute('focusable', 'false');
  return h('div', { class: 'in-figbox' }, [svg]);
}
function questionBlock(v, q, textId) {
  var box = h('div', { class: 'in-q' });
  box.appendChild(h('p', { class: 'in-topic', text: q.topic }));
  var qt = h('p', { class: 'in-qt', id: textId, tabindex: '-1', lang: langAttr(q.lang || v.lang) });
  rich(qt, q.question);
  box.appendChild(qt);
  var f = figureEl(q);
  if (f) box.appendChild(f);
  return box;
}
function answerSpan(v, q, orig) { return rich(h('span', { class: 'in-at', lang: langAttr(q.lang || v.lang) }), q.answers[orig]); }
function sourceLine(L, v, q) {
  var p = h('p', { class: 'in-src' });
  p.appendChild(document.createTextNode(L.t('t_source') + ': '));
  if (q.source_url) p.appendChild(h('a', { href: q.source_url, target: '_blank', rel: 'noopener noreferrer', text: q.source }));
  else p.appendChild(document.createTextNode(q.source));
  if (q.syllabus_ref && v.syl[q.syllabus_ref]) p.appendChild(document.createTextNode(' · ' + L.f('w_syl', q.syllabus_ref + ' ' + v.syl[q.syllabus_ref])));
  return p;
}

/* ---------- pachete: vederi ---------- */
function makeView(pack, builtin) {
  var byId = dict(), syl = dict();
  pack.questions.forEach(function (q) { byId[q.id] = q; });
  (pack.syllabus || []).forEach(function (s) { syl[s.id] = s.title; });
  return { id: pack.id, title: pack.title, country: pack.country, licence_class: pack.licence_class, lang: pack.lang, source: pack.source, source_url: pack.source_url,
    license: pack.license, exam: pack.exam, pack: pack, questions: pack.questions, byId: byId, syl: syl, builtin: builtin };
}
function builtinPacks() {
  var keys = typeof DATA === 'undefined' ? [] : Object.keys(DATA).sort(), out = [];
  keys.forEach(function (k) { var p = DATA[k]; if (isObj(p) && !validatePack(p).length) out.push(canonicalPack(p)); });
  return out;
}
function isBuiltinId(id) { return BUILT.some(function (p) { return p.id === id; }); }
function rebuildViews() {
  VIEWS = BUILT.map(function (p) { return makeView(p, true); }).concat(S.packs.map(function (p) { return makeView(p, false); }));
}
function viewOf(id) { for (var i = 0; i < VIEWS.length; i++) if (VIEWS[i].id === id) return VIEWS[i]; return null; }
function curView() { return viewOf(S.last.pack) || VIEWS[0] || null; }
function knownIds() {
  var k = dict();
  VIEWS.forEach(function (v) { var m = dict(); v.questions.forEach(function (q) { m[q.id] = true; }); k[v.id] = m; });
  return k;
}
function progOf(pid) { if (!has(S.prog, pid)) S.prog[pid] = dict(); return S.prog[pid]; }
function poolOf(v) { return v.questions.filter(function (q) { return !S.last.topic || q.topic === S.last.topic; }); }

/* ---------- starea salvată ---------- */
function readJSON(key) { try { var t = localStorage.getItem(key); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function store(key, text) { try { localStorage.setItem(key, text); return true; } catch (e) { return false; } }
function savePacks() { var text = JSON.stringify(S.packs); return text.length <= LIMITS.store_chars && store(KEY_PACKS, text); }
function saveProg() {
  var o = makeProgress(S.prog, S.hist);
  o.last = S.last;
  return store(KEY_PROG, JSON.stringify(o));
}
function saveRun() {
  try { if (S.run) localStorage.setItem(KEY_RUN, JSON.stringify(S.run)); else localStorage.removeItem(KEY_RUN); return true; } catch (e) { return false; }
}
function defaultLast() { return { pack: '', topic: '', mode: 'due', newPerDay: 10 }; }
function cleanLast(r) {
  var l = defaultLast();
  if (!isObj(r)) return l;
  if (typeof r.pack === 'string' && viewOf(r.pack)) l.pack = r.pack;
  if (typeof r.topic === 'string' && r.topic.length <= LIMITS.topic) l.topic = r.topic;
  if (MODES.indexOf(r.mode) >= 0) l.mode = r.mode;
  if (isInt(r.newPerDay, 0, LIMITS.new_per_day)) l.newPerDay = r.newPerDay;
  return l;
}
function sigOf(ids) { return hash32(ids.join('|')); }
// examenul început, din starea salvată -> {run, xam} | null. Întrebările se refac din sămânță; dacă pachetul s-a schimbat între timp (semnătura nu mai e aceeași), examenul se abandonează.
function cleanRun(raw) {
  if (!isObj(raw) || typeof raw.pack !== 'string' || !isObj(raw.rules)) return null;
  var v = viewOf(raw.pack), ru = raw.rules;
  if (!v) return null;
  if (!isInt(raw.seed, 0, 4294967295) || !isInt(raw.start, 1, 8000000000000000) || !isInt(raw.sig, 0, 4294967295)) return null;
  if (!isInt(ru.questions, 1, LIMITS.exam_questions) || !isInt(ru.minutes, 1, LIMITS.exam_minutes) || !isInt(ru.pass_percent, 1, 100)) return null;
  if (!(typeof ru.wrong_penalty === 'number' && isFinite(ru.wrong_penalty) && ru.wrong_penalty >= 0 && ru.wrong_penalty <= 1)) return null;
  var snap = { questions: ru.questions, minutes: ru.minutes, pass_percent: ru.pass_percent, wrong_penalty: ru.wrong_penalty };
  var xam = buildExam(v.questions, snap, raw.seed);
  if (sigOf(xam.ids) !== raw.sig) return null;
  xam.start = Math.min(raw.start, Date.now());
  var run = { pack: v.id, seed: raw.seed, start: xam.start, rules: snap, sig: raw.sig, answers: dict(), flags: dict(), cur: 0 };
  var A = isObj(raw.answers) ? raw.answers : {}, F = isObj(raw.flags) ? raw.flags : {};
  xam.ids.forEach(function (id) {
    var q = v.byId[id];
    if (has(A, id) && isInt(A[id], 0, q.answers.length - 1)) run.answers[id] = A[id];
    if (has(F, id) && F[id] === true) run.flags[id] = true;
  });
  if (isInt(raw.cur, 0, xam.n - 1)) run.cur = raw.cur;
  return { run: run, xam: xam };
}
function loadState() {
  var s = { packs: [], prog: dict(), hist: [], last: defaultLast(), run: null };
  var raw = readJSON(KEY_PACKS);
  if (Array.isArray(raw)) raw.forEach(function (p) {
    if (s.packs.length >= LIMITS.packs || !isObj(p) || validatePack(p).length) return;
    var c = canonicalPack(p);
    if (isBuiltinId(c.id) || s.packs.some(function (x) { return x.id === c.id; })) return;
    s.packs.push(c);
  });
  return s;
}
function loadProgress() {
  var text = null, raw = null;
  try { text = localStorage.getItem(KEY_PROG); } catch (e) { text = null; }
  if (text) {
    try { raw = JSON.parse(text); } catch (e2) { raw = null; }
    var r = parseProgress(text, knownIds());
    if (!r.error) { S.prog = r.prog; S.hist = r.history.filter(function (x) { return !!viewOf(x.pack); }); }
  }
  S.last = cleanLast(isObj(raw) ? raw.last : null);
}

/* ---------- pornire ---------- */
function boot() {
  if (booted) return;
  booted = true;
  BUILT = builtinPacks();
  S = loadState();
  rebuildViews();
  loadProgress();
  S.run = null;
  var r = cleanRun(readJSON(KEY_RUN));
  if (r) { S.run = r.run; V.xam = r.xam; }
  else saveRun();
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', tick);
  if (S.run) {
    V.tab = 'exam';
    var rem = remainingMs(V.xam, Date.now());
    if (rem <= 0) { finishExam(true); V.focus = ''; }   // la încărcarea paginii focalizarea nu se mută
    else { WARN_AT.forEach(function (w) { if (rem <= w * 60000) V.warned[w] = true; }); V.notice = 'x_resumed'; }
  }
}

/* ---------- cronometrul examenului ---------- */
function tick() {
  if (!S || !S.run || !V.xam) { syncTimer(); return; }
  var rem = remainingMs(V.xam, Date.now());
  if (V.clockEl) V.clockEl.textContent = clock(rem);
  WARN_AT.forEach(function (w) {
    if (V.xam && V.xam.minutes >= w * 2 && rem > 0 && rem <= w * 60000 && !V.warned[w]) { V.warned[w] = true; flash(cur.L.f('x_warn', w)); }
  });
  if (rem <= 0) finishExam(true);
}
function syncTimer() {
  if (S && S.run && V.xam) { if (!V.tick) V.tick = setInterval(tick, 1000); }
  else if (V.tick) { clearInterval(V.tick); V.tick = 0; }
}

/* ---------- tastatură: 1–6 și A–F aleg un răspuns, doar cât timp focalizarea e în cardul întrebării (WCAG 2.1.4) ---------- */
function keyIndex(ev) {
  var key = ev.key, i = -1;
  if (typeof key === 'string' && key.length === 1) {
    i = LETTERS.indexOf(key.toUpperCase());
    if (i < 0) i = '123456'.indexOf(key);
  }
  if (i < 0 && typeof ev.code === 'string') { var m = /^(?:Digit|Numpad)([1-6])$/.exec(ev.code); if (m) i = +m[1] - 1; }
  return i;
}
function onKey(ev) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.defaultPrevented || !S) return;
  var t = ev.target, tag = t && t.tagName ? t.tagName.toLowerCase() : '';
  if (tag === 'textarea' || tag === 'select' || (tag === 'input' && t.type !== 'radio' && t.type !== 'checkbox' && t.type !== 'button')) return;
  if (V.tab === 'train' && V.sess && !V.sess.done && inside(t, 'in-card')) {
    var k = keyIndex(ev);
    if (k >= 0 && !V.sess.answered) { ev.preventDefault(); pick(k); return; }
    if (ev.key === 'Enter' && V.sess.answered && tag !== 'button' && tag !== 'a') { ev.preventDefault(); nextQuestion(); }
    return;
  }
  if (V.tab === 'exam' && S.run && inside(t, 'in-xcard')) {
    var j = keyIndex(ev), el = j >= 0 ? document.getElementById('in-xa-' + j) : null;
    if (el) { ev.preventDefault(); el.click(); el.focus(); }
  }
}

/* ---------- exersare ---------- */
function startSession() {
  var L = cur.L, v = curView();
  if (!v) return;
  var seed = rndSeed();
  var ids = buildQueue(v.questions, progOf(v.id), today(), { mode: S.last.mode, topic: S.last.topic, newPerDay: S.last.newPerDay, max: LIMITS.session, seed: seed });
  if (!ids.length) { flash(L.t('t_none')); return; }
  V.sess = { pack: v.id, ids: ids, i: 0, seed: seed, first: dict(), answered: null, right: 0, count: 0, requeued: dict(), done: false };
  flash('');
  V.focus = 'in-qt'; render();
}
function pick(k) {
  var s = V.sess;
  if (!s || s.answered || s.done) return;
  var v = viewOf(s.pack), q = v ? v.byId[s.ids[s.i]] : null;
  if (!q) return;
  var order = answerOrder(q, s.seed);
  if (k < 0 || k >= order.length) return;
  var ok = order[k] === q.correct, requeue = false;
  if (!s.first[q.id]) {
    s.first[q.id] = ok ? 1 : 2;
    s.count++;
    if (ok) s.right++;
    var pg = progOf(v.id);
    pg[q.id] = review(pg[q.id], ok, today());
    if (!ok && !s.requeued[q.id]) { s.requeued[q.id] = true; s.ids.push(q.id); requeue = true; }
    if (!saveProg()) flash(cur.L.t('e_quota'));
  }
  s.answered = { pick: order[k], ok: ok, requeue: requeue };
  V.focus = 'in-fb'; render();
}
function nextQuestion() {
  var s = V.sess;
  if (!s || !s.answered) return;
  s.answered = null;
  if (s.i >= s.ids.length - 1) { s.done = true; V.focus = 'in-sum'; } else { s.i++; V.focus = 'in-qt'; }
  render();
}
function sessionView(L, box) {
  var s = V.sess, v = viewOf(s.pack), q = v ? v.byId[s.ids[s.i]] : null;
  if (!v || !q) { V.sess = null; return setupView(L, box); }
  if (s.done) {
    box.appendChild(h('h4', { id: 'in-sum', class: 'in-sum', tabindex: '-1', text: L.t('t_done_h') }));
    box.appendChild(h('p', { class: 'in-big', text: L.f('t_done', s.count, s.right, pct(s.right, s.count)) }));
    box.appendChild(h('button', { type: 'button', class: 'btn pri in-again', id: 'in-again', text: L.t('t_again'), onclick: function () { V.sess = null; V.focus = 'in-start'; render(); } }));
    return box;
  }
  var order = answerOrder(q, s.seed), a = s.answered, n = order.length;
  var card = h('div', { class: 'in-card', id: 'in-card' });
  card.appendChild(h('p', { class: 'in-qn', text: L.f('t_qn', s.i + 1, s.ids.length) }));
  card.appendChild(questionBlock(v, q, 'in-qt'));
  var grp = h('div', { class: 'in-ans-list', role: 'group', 'aria-label': L.t('t_group') });
  order.forEach(function (orig, k) {
    var cls = 'btn in-ans', badge = '';
    if (a) {
      if (orig === q.correct) { cls += ' in-right'; badge = '✓ ' + L.t(a.pick === orig ? 'r_yours' : 'r_correct'); }
      else if (orig === a.pick) { cls += ' in-wrong'; badge = '✗ ' + L.t('r_yours'); }
    }
    grp.appendChild(h('button', { type: 'button', class: cls, id: 'in-ans-' + k, 'aria-disabled': a ? 'true' : null, onclick: function () { pick(k); } },
      [h('span', { class: 'in-k', text: LETTERS.charAt(k) + '.' }), ' ', answerSpan(v, q, orig), badge ? ' ' : null, badge ? h('span', { class: 'in-badge', text: badge }) : null]));
  });
  card.appendChild(grp);
  if (a) {
    var fb = h('div', { class: 'in-fb', id: 'in-fb', tabindex: '-1' });
    fb.appendChild(h('p', { class: 'in-res ' + (a.ok ? 'in-ok' : 'in-bad'), text: a.ok ? L.t('t_ok') : L.f('t_bad', plain(q.answers[q.correct])) }));
    if (q.explanation) {
      var ex = h('p', { class: 'in-expl', lang: langAttr(q.lang || v.lang) }, [h('strong', { text: L.t('t_expl') + ': ' })]);
      rich(ex, q.explanation);
      fb.appendChild(ex);
    }
    fb.appendChild(sourceLine(L, v, q));
    if (a.requeue) fb.appendChild(h('p', { class: 'in-note', text: L.t('t_requeued') }));
    fb.appendChild(h('button', { type: 'button', class: 'btn pri in-next', id: 'in-next', text: L.t(s.i >= s.ids.length - 1 ? 't_last' : 't_next'), onclick: nextQuestion }));
    card.appendChild(fb);
  } else card.appendChild(h('p', { class: 'in-hint', text: L.f('t_keys', n, LETTERS.charAt(n - 1)) }));
  box.appendChild(card);
  return box;
}
function setupView(L, box) {
  var v = curView();
  box.appendChild(h('p', { class: 'in-hint', text: L.t('t_intro') }));
  if (!v) { box.appendChild(h('p', { class: 'in-hint', text: L.t('p_intro') })); return box; }
  var topics = topicsOf(v.questions);
  if (S.last.topic && topics.indexOf(S.last.topic) < 0) S.last.topic = '';
  var bar = h('div', { class: 'in-bar' });
  bar.appendChild(field(L.t('f_pack'), selectOf('in-pack', VIEWS.map(function (x) { return [x.id, x.title]; }), v.id, function (val) { S.last.pack = val; S.last.topic = ''; saveProg(); V.focus = 'in-pack'; render(); }), 'in-pack'));
  bar.appendChild(field(L.t('f_topic'), selectOf('in-topic', [['', L.t('f_all_topics')]].concat(topics.map(function (x) { return [x, x]; })), S.last.topic, function (val) { S.last.topic = val; saveProg(); V.focus = 'in-topic'; render(); }), 'in-topic'));
  bar.appendChild(field(L.t('f_mode'), selectOf('in-mode', [['due', L.t('m_due')], ['all', L.t('m_all')], ['weak', L.t('m_weak')]], S.last.mode, function (val) { S.last.mode = val; saveProg(); V.focus = 'in-mode'; render(); }), 'in-mode'));
  var inp = h('input', { type: 'number', id: 'in-new', class: 'in-inp in-num', min: 0, max: LIMITS.new_per_day, step: 1, inputmode: 'numeric', value: S.last.newPerDay });
  // «change» vine când câmpul pierde focalizarea: pagina nu se reface aici, altfel s-ar pierde clicul pe butonul pe care tocmai s-a apăsat
  inp.addEventListener('change', function () {
    var n = parseInt(inp.value, 10);
    S.last.newPerDay = n >= 0 ? Math.min(LIMITS.new_per_day, n) : 10;
    inp.value = String(S.last.newPerDay);
    saveProg();
  });
  var fnew = field(L.t('f_new'), inp, 'in-new');
  if (S.last.mode !== 'due') fnew.setAttribute('hidden', '');
  bar.appendChild(fnew);
  box.appendChild(bar);
  var pool = poolOf(v), c = dueCount(pool, progOf(v.id), today());
  box.appendChild(h('p', { class: 'in-count', text: L.f('t_stats', c.due, c.fresh, pool.length) }));
  box.appendChild(h('button', { type: 'button', class: 'btn pri in-start', id: 'in-start', text: L.t('t_start'), onclick: startSession }));
  return box;
}
function panelTrain(L) {
  var box = h('div', { class: 'in-box' });
  box.appendChild(h('h3', { text: L.t('t_h') }));
  return V.sess ? sessionView(L, box) : setupView(L, box);
}

/* ---------- examen ---------- */
function rulesSummary(L, r) {
  var s = L.f('x_rules', r.questions, r.minutes, r.pass_percent);
  if (r.wrong_penalty > 0) s += ' · ' + L.f('x_penalty', num(r.wrong_penalty));
  return s;
}
function startExam(seed) {
  var v = curView();
  if (!v) return;
  var rules = examRules(v.pack);
  var snap = { questions: rules.questions, minutes: rules.minutes, pass_percent: rules.pass_percent, wrong_penalty: rules.wrong_penalty };
  var xam = buildExam(v.questions, snap, seed);
  xam.start = Date.now();
  S.run = { pack: v.id, seed: seed, start: xam.start, rules: snap, sig: sigOf(xam.ids), answers: dict(), flags: dict(), cur: 0 };
  V.xam = xam; V.result = null; V.warned = dict(); V.confirm = '';
  flash('');
  if (!saveRun()) flash(cur.L.t('e_quota'));
  V.focus = 'in-xqt'; render();
}
function finishExam(timeUp) {
  var run = S.run, xam = V.xam, v = run ? viewOf(run.pack) : null;
  if (!run || !xam || !v) return;
  var score = scoreExam(xam, run.answers, v.byId);
  var secs = Math.max(0, Math.min(xam.minutes * 60, Math.floor((Date.now() - run.start) / 1000)));
  S.hist.unshift({ pack: run.pack, day: today(), n: score.n, right: score.right, percent: score.percent, passed: score.passed, seed: run.seed, secs: secs });
  if (S.hist.length > LIMITS.hist) S.hist.length = LIMITS.hist;
  V.result = { run: run, xam: xam, score: score, secs: secs, timeUp: !!timeUp };
  S.run = null; V.xam = null; V.confirm = ''; V.confEl = null;
  saveRun();
  if (!saveProg() && cur.L) flash(cur.L.t('e_quota'));
  syncTimer();
  if (timeUp) { if (cur.L) flash(cur.L.t('x_timeup')); V.notice = ''; }
  V.focus = V.tab === 'exam' ? 'in-res' : '';
  render();
}
function setAnswer(q, orig) {
  S.run.answers[q.id] = orig;
  saveRun();
  dropConfirm();
  refreshRun();
}
function dropConfirm() {
  if (V.confEl && V.confEl.parentNode) V.confEl.parentNode.removeChild(V.confEl);
  V.confEl = null; V.confirm = '';
}
// după o schimbare de răspuns sau de marcaj se actualizează doar harta, butonul de marcaj și butonul de ștergere: pagina nu se reface, deci focalizarea rămâne unde era
function refreshRun() {
  var run = S.run, xam = V.xam, v = run ? viewOf(run.pack) : null, L = cur.L;
  if (!run || !xam || !v) return;
  var q = v.byId[xam.ids[run.cur]];
  if (V.mapEl) {
    var items = V.mapEl.childNodes;
    xam.ids.forEach(function (id, i) {
      var b = items[i] && items[i].firstChild;
      if (!b) return;
      b.className = mapClass(run, id, i);
      b.setAttribute('aria-label', L.f('x_map_item', i + 1, mapState(L, run, id)));
    });
  }
  if (V.flagBtn) V.flagBtn.textContent = L.t(run.flags[q.id] ? 'x_unflag' : 'x_flag');
  if (V.clearBtn) { if (has(run.answers, q.id)) V.clearBtn.removeAttribute('hidden'); else V.clearBtn.setAttribute('hidden', ''); }
}
function mapState(L, run, id) { return L.t(has(run.answers, id) ? 'x_st_done' : 'x_st_open') + (run.flags[id] ? ', ' + L.t('x_st_flag') : ''); }
function mapClass(run, id, i) { return 'btn in-mp' + (has(run.answers, id) ? ' in-mp-done' : '') + (run.flags[id] ? ' in-mp-flag' : '') + (i === run.cur ? ' in-mp-cur' : ''); }
function goTo(i) {
  var run = S.run;
  if (!run || i < 0 || i >= V.xam.n) return;
  run.cur = i; saveRun(); dropConfirm();
  V.focus = 'in-xqt'; render();
}
function blanksOf(run, xam) { return xam.ids.filter(function (id) { return !has(run.answers, id); }).length; }
function renderRun(box, L) {
  var run = S.run, xam = V.xam, v = viewOf(run.pack), q = v ? v.byId[xam.ids[run.cur]] : null;
  if (!v || !q) { S.run = null; V.xam = null; saveRun(); return renderXSetup(box, L); }
  var order = answerOrder(q, run.seed), n = xam.n;
  var clk = h('b', { class: 'in-clock', id: 'in-clock', text: clock(remainingMs(xam, Date.now())) });
  V.clockEl = clk;
  box.appendChild(h('div', { class: 'in-xbar' }, [
    h('div', { class: 'in-timer', id: 'in-timer', role: 'timer', 'aria-live': 'off' }, [h('span', { text: L.t('x_time') + ' ' }), clk]),
    h('p', { class: 'in-meta', text: L.f('r_seed', run.seed) })
  ]));
  var card = h('div', { class: 'in-card', id: 'in-xcard' });
  card.appendChild(h('p', { class: 'in-qn', text: L.f('x_qn', run.cur + 1, n) }));
  card.appendChild(questionBlock(v, q, 'in-xqt'));
  var grp = h('div', { class: 'in-opts', role: 'radiogroup', 'aria-labelledby': 'in-xqt' });
  order.forEach(function (orig, k) {
    var id = 'in-xa-' + k;
    var inp = h('input', { type: 'radio', name: 'in-xa', id: id, checked: run.answers[q.id] === orig });
    inp.addEventListener('change', function () { if (inp.checked) setAnswer(q, orig); });
    grp.appendChild(h('label', { class: 'in-opt', for: id }, [inp, h('span', { class: 'in-k', text: LETTERS.charAt(k) + '.' }), ' ', answerSpan(v, q, orig)]));
  });
  card.appendChild(grp);
  card.appendChild(h('p', { class: 'in-hint', text: L.f('t_keys', order.length, LETTERS.charAt(order.length - 1)) }));
  var row = h('div', { class: 'in-bar in-xnav' });
  row.appendChild(h('button', { type: 'button', class: 'btn', id: 'in-xprev', text: L.t('x_prev'), disabled: run.cur === 0, onclick: function () { goTo(run.cur - 1); } }));
  row.appendChild(h('button', { type: 'button', class: 'btn', id: 'in-xnext', text: L.t('x_next'), disabled: run.cur >= n - 1, onclick: function () { goTo(run.cur + 1); } }));
  var flag = h('button', { type: 'button', class: 'btn', id: 'in-xflag', text: L.t(run.flags[q.id] ? 'x_unflag' : 'x_flag'), onclick: function () {
    if (run.flags[q.id]) delete run.flags[q.id]; else run.flags[q.id] = true;
    saveRun(); dropConfirm(); refreshRun();
  } });
  V.flagBtn = flag; row.appendChild(flag);
  var clr = h('button', { type: 'button', class: 'btn', id: 'in-xclear', text: L.t('x_clear'), hidden: !has(run.answers, q.id), onclick: function () {
    delete run.answers[q.id];
    var radios = grp.getElementsByTagName('input'), i;
    for (i = 0; i < radios.length; i++) radios[i].checked = false;
    saveRun(); dropConfirm(); refreshRun();
    var first = document.getElementById('in-xa-0');
    if (first) first.focus();
  } });
  V.clearBtn = clr; row.appendChild(clr);
  card.appendChild(row);
  box.appendChild(card);
  var map = h('ul', { class: 'in-map', 'aria-label': L.t('x_map_l') });
  xam.ids.forEach(function (id, i) {
    map.appendChild(h('li', null, [h('button', { type: 'button', class: mapClass(run, id, i), id: 'in-qm-' + i, 'aria-label': L.f('x_map_item', i + 1, mapState(L, run, id)), 'aria-current': i === run.cur ? 'true' : null, text: String(i + 1), onclick: function () { goTo(i); } })]));
  });
  V.mapEl = map;
  box.appendChild(h('h4', { class: 'in-maph', text: L.t('x_map_l') }));
  box.appendChild(map);
  var fin = h('div', { class: 'in-bar in-xfin' });
  fin.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'in-xfinish', text: L.t('x_finish'), onclick: function () {
    var blanks = blanksOf(run, xam);
    if (blanks > 0 && V.confirm !== 'finish') { V.confirm = 'finish'; V.focus = 'in-xsure'; render(); return; }
    finishExam(false);
  } }));
  box.appendChild(fin);
  if (V.confirm === 'finish') {
    var blanks = blanksOf(run, xam);
    if (blanks > 0) {
      var conf = h('div', { class: 'in-sure', id: 'in-xsure', tabindex: '-1' }, [
        h('p', { class: 'in-bad', text: L.f('x_sure', blanks) }),
        h('button', { type: 'button', class: 'btn pri', id: 'in-xsure-go', text: L.t('x_sure_go'), onclick: function () { finishExam(false); } })
      ]);
      V.confEl = conf;
      box.appendChild(conf);
    } else V.confirm = '';
  }
  return box;
}
function renderXSetup(box, L) {
  var v = curView();
  box.appendChild(h('p', { class: 'in-hint', text: L.t('x_intro') }));
  if (!v) { box.appendChild(h('p', { class: 'in-hint', text: L.t('p_intro') })); return box; }
  var rules = examRules(v.pack);
  var bar = h('div', { class: 'in-bar' });
  bar.appendChild(field(L.t('f_pack'), selectOf('in-xpack', VIEWS.map(function (x) { return [x.id, x.title]; }), v.id, function (val) { S.last.pack = val; S.last.topic = ''; saveProg(); V.focus = 'in-xpack'; render(); }), 'in-xpack'));
  box.appendChild(bar);
  box.appendChild(h('p', { class: 'in-rules', text: rulesSummary(L, rules) }));
  box.appendChild(h('p', { class: 'in-hint', text: rules.declared ? L.f('x_rules_src', rules.source) : L.t('x_rules_def') }));
  if (v.questions.length < rules.questions) box.appendChild(h('p', { class: 'in-note', text: L.f('x_few', v.questions.length) }));
  var seed = h('input', { type: 'text', id: 'in-seed', class: 'in-inp', maxlength: 40, autocomplete: 'off', spellcheck: 'false', 'aria-describedby': 'in-seed-h' });
  seed.value = V.seedText;
  seed.addEventListener('input', function () { V.seedText = seed.value; });
  box.appendChild(field(L.t('x_seed_l'), seed, 'in-seed'));
  box.appendChild(h('p', { class: 'in-hint', id: 'in-seed-h', text: L.t('x_seed_h') }));
  box.appendChild(h('button', { type: 'button', class: 'btn pri in-start', id: 'in-xstart', text: L.t('x_start'), onclick: function () { startExam(parseSeed(V.seedText)); } }));
  box.appendChild(h('h4', { class: 'in-maph', text: L.t('x_hist_h') }));
  if (!S.hist.length) box.appendChild(h('p', { class: 'in-hint', text: L.t('x_hist_none') }));
  else box.appendChild(h('ul', { class: 'in-hist' }, S.hist.slice(0, HIST_SHOWN).map(function (r) {
    var pv = viewOf(r.pack);
    return h('li', { text: L.f('x_hist', dayText(r.day), pv ? pv.title : r.pack, r.right, r.n, num(r.percent)) + ' · ' + L.t(r.passed ? 'x_passed' : 'x_failed') });
  })));
  return box;
}
function tbl(L, headers, rows, labelId) {
  var t = h('table', { class: 'in-tbl' });
  t.appendChild(h('thead', null, [h('tr', null, headers.map(function (x) { return h('th', { scope: 'col', text: L.t(x) }); }))]));
  t.appendChild(h('tbody', null, rows.map(function (r) {
    return h('tr', null, r.map(function (c, i) { return h(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row', text: String(c) } : { text: String(c) }); }));
  })));
  return h('div', { class: 'in-tblwrap', role: 'region', tabindex: '0', 'aria-labelledby': labelId }, [t]);
}
function renderResult(box, L) {
  var r = V.result, sc = r.score, v = viewOf(r.run.pack);
  if (!v) { V.result = null; return renderXSetup(box, L); }
  box.appendChild(h('h4', { id: 'in-res', class: 'in-sum', tabindex: '-1', text: L.t('r_h') }));
  if (r.timeUp) box.appendChild(h('p', { class: 'in-note', text: L.t('x_timeup') }));
  box.appendChild(h('p', { class: 'in-big', text: L.f('r_score', sc.right, sc.n, num(sc.percent)) }));
  box.appendChild(h('p', { class: 'in-res ' + (sc.passed ? 'in-ok' : 'in-bad'), text: L.f(sc.passed ? 'r_pass' : 'r_fail', num(sc.percent), r.xam.pass) }));
  if (sc.blank) box.appendChild(h('p', { text: L.f('r_blank', sc.blank) }));
  box.appendChild(h('p', { class: 'in-meta', text: L.f('r_seed', r.run.seed) + ' · ' + L.f('r_time', clock(r.secs * 1000)) }));
  box.appendChild(h('h4', { class: 'in-maph', id: 'in-rt-h', text: L.t('r_topics_h') }));
  box.appendChild(tbl(L, ['th_topic', 'th_n', 'th_right', 'th_wrong', 'th_blank'], sc.topics.map(function (t) { return [t.topic, t.n, t.right, t.wrong, t.blank]; }), 'in-rt-h'));
  var bad = r.xam.ids.filter(function (id) { return !isInt(r.run.answers[id], 0, 5) || r.run.answers[id] !== v.byId[id].correct; });
  if (bad.length) {
    box.appendChild(h('h4', { class: 'in-maph', text: L.t('r_review_h') }));
    var list = h('ol', { class: 'in-rvl' });
    bad.forEach(function (id) {
      var q = v.byId[id], a = r.run.answers[id], item = h('li', { class: 'in-rv' });
      item.appendChild(h('p', { class: 'in-qn', text: L.f('x_qn', r.xam.ids.indexOf(id) + 1, r.xam.n) }));
      item.appendChild(questionBlock(v, q, 'in-rq-' + id));
      var y = h('p', { class: 'in-bad' }, [h('strong', { text: L.t('r_yours') + ': ' })]);
      if (isInt(a, 0, 5) && a < q.answers.length) y.appendChild(answerSpan(v, q, a)); else y.appendChild(document.createTextNode(L.t('r_none')));
      item.appendChild(y);
      item.appendChild(h('p', { class: 'in-ok' }, [h('strong', { text: L.t('r_correct') + ': ' }), answerSpan(v, q, q.correct)]));
      if (q.explanation) { var ex = h('p', { class: 'in-expl', lang: langAttr(q.lang || v.lang) }, [h('strong', { text: L.t('t_expl') + ': ' })]); rich(ex, q.explanation); item.appendChild(ex); }
      list.appendChild(item);
    });
    box.appendChild(list);
  }
  var bar = h('div', { class: 'in-bar' });
  bar.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'in-xrepeat', text: L.t('r_repeat'), onclick: function () { S.last.pack = r.run.pack; saveProg(); startExam(r.run.seed); } }));
  bar.appendChild(h('button', { type: 'button', class: 'btn', id: 'in-xnew', text: L.t('r_new'), onclick: function () { V.result = null; V.focus = 'in-xstart'; render(); } }));
  box.appendChild(bar);
  return box;
}
function panelExam(L) {
  var box = h('div', { class: 'in-box' });
  box.appendChild(h('h3', { text: L.t('x_h') }));
  if (S.run && V.xam) return renderRun(box, L);
  if (V.result) return renderResult(box, L);
  return renderXSetup(box, L);
}

/* ---------- pachete: import, descărcare, ștergere ---------- */
function issueLine(code) {
  var p = issueParts(code), L = cur.L;
  var label = p.lk ? (p.la === undefined ? L.t(p.lk) : L.f(p.lk, p.la)) : p.la;
  return label + ': ' + (p.ta === undefined ? L.t(p.tk) : L.f(p.tk, p.ta));
}
function failImport(key, arg) { V.report = { err: key, arg: arg }; V.focus = 'in-imp-rep'; render(); }
function tryImport(text) {
  var r = parsePackText(text);
  V.report = null;
  if (r.error) { failImport(r.error === 'empty' ? 'i_err_empty' : r.error === 'big' ? 'i_err_big' : 'i_err_json'); return; }
  var issues = validatePack(r.pack);
  if (!issues.length) { acceptPack(r.pack, 0); return; }
  V.report = { codes: issues, pending: validPart(r.pack) };
  V.focus = 'in-imp-rep'; render();
}
function dropRunsOf(pid) {
  if (V.sess && V.sess.pack === pid) V.sess = null;
  if (S.run && S.run.pack === pid) { S.run = null; V.xam = null; saveRun(); syncTimer(); }
  if (V.result && V.result.run.pack === pid) V.result = null;
}
function acceptPack(pack, dropped) {
  var L = cur.L, c = canonicalPack(pack), at = -1;
  if (isBuiltinId(c.id)) { failImport('i_err_builtin'); return; }
  S.packs.forEach(function (x, i) { if (x.id === c.id) at = i; });
  if (at < 0 && S.packs.length >= LIMITS.packs) { failImport('i_err_full', LIMITS.packs); return; }
  var before = S.packs.slice();
  if (at >= 0) S.packs[at] = c; else S.packs.push(c);
  if (!savePacks()) { S.packs = before; failImport('e_quota'); return; }
  dropRunsOf(c.id);
  rebuildViews();
  S.prog = cleanProgress(S.prog, knownIds());
  S.last.pack = c.id; S.last.topic = '';
  saveProg();
  V.report = null; V.impText = '';
  flash(dropped > 0 ? L.f('i_partial', c.title, c.questions.length, dropped) : L.f(at >= 0 ? 'i_replaced' : 'i_done', c.title, c.questions.length));
  V.focus = 'in-pk-h-' + c.id; render();
}
function resetPack(v) {
  S.prog[v.id] = dict();
  S.hist = S.hist.filter(function (x) { return x.pack !== v.id; });
  if (V.sess && V.sess.pack === v.id) V.sess = null;
  saveProg();
  V.confirm = ''; V.focus = 'in-pk-h-' + v.id; render();
  flash(cur.L.f('p_reset_done', v.title));
}
function removePack(v) {
  S.packs = S.packs.filter(function (x) { return x.id !== v.id; });
  var ok = savePacks();
  delete S.prog[v.id];
  S.hist = S.hist.filter(function (x) { return x.pack !== v.id; });
  dropRunsOf(v.id);
  rebuildViews();
  if (S.last.pack === v.id) { S.last.pack = ''; S.last.topic = ''; }
  saveProg();
  V.confirm = ''; V.focus = 'in-imp-h'; render();
  flash(ok ? cur.L.f('p_removed', v.title) : cur.L.t('e_quota'));
}
function confirmButton(L, id, key, sureKey, token, act) {
  var sure = V.confirm === token;
  return h('button', { type: 'button', class: 'btn' + (sure ? ' pri' : ''), id: id, text: L.t(sure ? sureKey : key), onclick: function () {
    if (!sure) { V.confirm = token; V.focus = id; render(); return; }
    act();
  } });
}
function statsTable(L, v) {
  var rows = topicStats(v.questions, progOf(v.id), today());
  return tbl(L, ['th_topic', 'th_total', 'th_seen', 'th_acc', 'th_mast', 'th_due'], rows.map(function (r) {
    return [r.topic, r.total, r.seen, r.right + r.wrong ? pct(r.right, r.right + r.wrong) + ' %' : '–', r.mastered, r.due];
  }), 'in-pk-t-' + v.id + ' in-st-h-' + v.id);   // numele regiunii = titlul pachetului + «Progres pe subiecte»: unic și când sunt mai multe pachete
}
function packCard(L, v) {
  var card = h('section', { class: 'in-pack', 'aria-labelledby': 'in-pk-h-' + v.id });
  card.appendChild(h('h4', { class: 'in-pk-h', id: 'in-pk-h-' + v.id, tabindex: '-1' }, [h('span', { id: 'in-pk-t-' + v.id, text: v.title }), ' ', h('span', { class: 'in-badge', text: L.t(v.builtin ? 'p_built' : 'p_imp') })]));
  card.appendChild(h('p', { class: 'in-meta', text: L.f('p_meta', v.country === 'ZZ' ? L.t('cl_zz') : v.country, v.licence_class, v.lang, v.questions.length) }));
  var src = h('p', { class: 'in-meta' });
  src.appendChild(document.createTextNode(L.f('p_src', v.source)));
  if (v.source_url) { src.appendChild(document.createTextNode(' ')); src.appendChild(h('a', { href: v.source_url, target: '_blank', rel: 'noopener noreferrer', text: v.source_url })); }
  card.appendChild(src);
  card.appendChild(h('p', { class: 'in-meta', text: L.f('p_lic', v.license) }));
  if (v.exam) { var rl = examRules(v.pack); card.appendChild(h('p', { class: 'in-meta', text: L.f('p_rules', rulesSummary(L, rl) + ' (' + rl.source + ')') })); }
  var bar = h('div', { class: 'in-bar' });
  bar.appendChild(h('button', { type: 'button', class: 'btn', id: 'in-pk-dl-' + v.id, text: L.t('p_export'), onclick: function () { if (!downloadText(v.id + '.json', JSON.stringify(canonicalPack(v.pack), null, 2) + '\n')) flash(cur.L.t('e_quota')); } }));
  bar.appendChild(confirmButton(L, 'in-pk-rs-' + v.id, 'p_reset', 'p_reset_sure', 'reset:' + v.id, function () { resetPack(v); }));
  if (!v.builtin) bar.appendChild(confirmButton(L, 'in-pk-rm-' + v.id, 'p_remove', 'p_remove_sure', 'rm:' + v.id, function () { removePack(v); }));
  card.appendChild(bar);
  card.appendChild(h('h5', { class: 'in-maph', id: 'in-st-h-' + v.id, text: L.t('p_topics_h') }));
  card.appendChild(statsTable(L, v));
  return card;
}
function reportView(L) {
  var r = V.report;
  var box = h('div', { class: 'in-rep', id: 'in-imp-rep', tabindex: '-1' });
  if (!r) return box;
  if (r.err) { box.appendChild(h('p', { class: 'in-bad', text: r.arg !== undefined ? L.f(r.err, r.arg) : L.t(r.err) })); return box; }
  box.appendChild(h('p', { class: 'in-bad', text: L.t('i_err_pack') }));
  var lines = r.codes.slice(0, MAX_SHOWN).map(issueLine);
  if (r.codes.length > MAX_SHOWN) lines.push(L.f('i_more', r.codes.length - MAX_SHOWN));
  box.appendChild(h('ul', { class: 'in-lines' }, lines.map(function (x) { return h('li', { text: x }); })));
  if (r.pending) box.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'in-imp-valid', text: L.f('i_valid', r.pending.pack.questions.length), onclick: function () { acceptPack(r.pending.pack, r.pending.dropped.length); } }));
  return box;
}
function importBox(L) {
  var box = h('section', { class: 'in-imp', 'aria-labelledby': 'in-imp-h' });
  box.appendChild(h('h4', { id: 'in-imp-h', tabindex: '-1', text: L.t('i_h') }));
  box.appendChild(h('p', { class: 'in-hint', text: L.t('i_help') }));
  var ta = h('textarea', { id: 'in-imp-ta', class: 'in-inp', rows: 6, spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off' });
  ta.value = V.impText;
  ta.addEventListener('input', function () { V.impText = ta.value; });
  box.appendChild(field(L.t('i_ta_l'), ta, 'in-imp-ta'));
  var fi = h('input', { type: 'file', id: 'in-imp-file', class: 'in-inp', accept: '.json,application/json' });
  box.appendChild(field(L.t('i_file_l'), fi, 'in-imp-file'));
  box.appendChild(h('button', { type: 'button', class: 'btn pri', id: 'in-imp-go', text: L.t('i_go'), onclick: function () {
    var f = fi.files && fi.files[0];
    if (f) { readText(f, function (t) { fi.value = ''; tryImport(t); }); return; }
    tryImport(ta.value);
  } }));
  box.appendChild(reportView(L));
  return box;
}
function applyProgressText(text) {
  var L = cur.L, r = parseProgress(text, knownIds());
  if (r.error) { flash(L.t('g_err')); return; }
  var n = 0;
  Object.keys(r.prog).forEach(function (pid) { S.prog[pid] = r.prog[pid]; n += Object.keys(r.prog[pid]).length; });
  if (r.history.length) S.hist = r.history.filter(function (x) { return !!viewOf(x.pack); });
  V.sess = null;
  var ok = saveProg();
  render();
  flash(ok ? L.f('g_loaded', n) : L.t('e_quota'));
}
function backupBox(L) {
  var box = h('section', { class: 'in-imp', 'aria-labelledby': 'in-pg-h' });
  box.appendChild(h('h4', { id: 'in-pg-h', tabindex: '-1', text: L.t('g_h') }));
  box.appendChild(h('p', { class: 'in-hint', text: L.t('g_help') }));
  box.appendChild(h('div', { class: 'in-bar' }, [h('button', { type: 'button', class: 'btn', id: 'in-pg-dl', text: L.t('g_dl'), onclick: function () {
    if (!downloadText('indicativ-progress.json', JSON.stringify(makeProgress(S.prog, S.hist), null, 2) + '\n')) flash(cur.L.t('e_quota'));
  } })]));
  var fi = h('input', { type: 'file', id: 'in-pg-file', class: 'in-inp', accept: '.json,application/json' });
  box.appendChild(field(L.t('g_file_l'), fi, 'in-pg-file'));
  box.appendChild(h('button', { type: 'button', class: 'btn', id: 'in-pg-load', text: L.t('g_load'), onclick: function () {
    var f = fi.files && fi.files[0];
    if (!f) { flash(L.t('i_err_empty')); return; }
    readText(f, function (t) { fi.value = ''; applyProgressText(t); });
  } }));
  return box;
}
function panelPacks(L) {
  var box = h('div', { class: 'in-box' });
  box.appendChild(h('h3', { text: L.t('p_h') }));
  box.appendChild(h('p', { class: 'in-hint', text: L.t('p_intro') }));
  VIEWS.forEach(function (v) { box.appendChild(packCard(L, v)); });
  box.appendChild(importBox(L));
  box.appendChild(backupBox(L));
  return box;
}

/* ---------- ghid ---------- */
function panelGuide(L) {
  var box = h('div', { class: 'in-box' });
  box.appendChild(h('h3', { text: L.t('gd_h') }));
  box.appendChild(h('ol', { class: 'in-steps' }, [1, 2, 3, 4, 5].map(function (i) { return h('li', { text: L.t('gd_' + i) }); })));
  box.appendChild(h('p', { class: 'in-hint', text: L.f('t_keys', 6, 'F') }));
  return box;
}

/* ---------- file și desenare ---------- */
var PANELS = { train: panelTrain, exam: panelExam, packs: panelPacks, guide: panelGuide };
function gotoTab(id, focusId) {
  V.tab = id; V.focus = focusId || ''; V.confirm = ''; V.report = null; V.confEl = null;
  flash('');
  render();
}
function tabsBar() {
  var L = cur.L, bar = h('div', { class: 'in-tabs', role: 'tablist', 'aria-label': L.t('tabs_l') });
  TABS.forEach(function (id, i) {
    var on = id === V.tab;
    bar.appendChild(h('button', {
      type: 'button', class: 'btn in-tab' + (on ? ' pri' : ''), role: 'tab', id: 'in-tt-' + id, 'aria-selected': on ? 'true' : 'false', 'aria-controls': 'in-p-' + id, tabindex: on ? '0' : '-1', text: L.t('tab_' + id),
      onclick: function () { gotoTab(id, 'in-tt-' + id); },
      onkeydown: function (ev) {
        var j = null;
        if (ev.key === 'ArrowRight') j = i + 1; else if (ev.key === 'ArrowLeft') j = i - 1; else if (ev.key === 'Home') j = 0; else if (ev.key === 'End') j = TABS.length - 1;
        if (j === null) return;
        ev.preventDefault();
        j = (j + TABS.length) % TABS.length;
        gotoTab(TABS[j], 'in-tt-' + TABS[j]);
      }
    }));
  });
  return bar;
}
function render() {
  var main = V.main, L = cur.L;
  if (!main) return;
  main.textContent = '';
  V.clockEl = null; V.flagBtn = null; V.clearBtn = null; V.mapEl = null; V.confEl = null;
  var root = h('div', { class: 'in-root' });
  root.appendChild(tabsBar());
  TABS.forEach(function (id) {
    var p = h('div', { class: 'in-panel', role: 'tabpanel', id: 'in-p-' + id, 'aria-labelledby': 'in-tt-' + id, hidden: id !== V.tab });
    if (id === V.tab) p.appendChild(PANELS[id](L));
    root.appendChild(p);
  });
  main.appendChild(root);
  syncTimer();
  refocus();
}

/* ---------- montare ---------- */
function mount(el, lang) {
  cur.el = el; cur.lang = lang; cur.L = makeL(lang);
  boot();
  var L = cur.L, card = el.parentNode;
  if (card && card.classList) card.classList.add('in');
  el.textContent = '';
  V.live = h('div', { class: 'in-msg', id: 'in-live', role: 'status', 'aria-live': 'polite' });
  V.main = h('div', { class: 'in-main' });
  el.appendChild(V.live);
  el.appendChild(V.main);
  var lim = h('section', { class: 'card rv in in-card-lim', id: 'in-lim-card' }, [h('h2', { id: 'in-lim-h', text: L.t('h_limits') }), h('ul', { class: 'in-list-lim' }, [1, 2, 3, 4, 5, 6].map(function (i) { return h('li', { text: L.t('lim_' + i) }); }))]);
  if (card && card.insertAdjacentElement) card.insertAdjacentElement('afterend', lim);
  if (V.notice) { flash(L.t(V.notice)); V.notice = ''; }
  render();
}

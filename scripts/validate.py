#!/usr/bin/env python3
"""Validate the INDICATIV International question packs.

    python3 scripts/validate.py              check every JSON file under data/
    python3 scripts/validate.py data/packs   check one directory

Each file is checked against schema.json and against the rules that a schema cannot express (the answer index, duplicates, the syllabus
references, the exam rules and the restricted SVG grammar). The rules are the same as in src/engine.mjs; test/tools.test.mjs runs both
implementations on the same inputs and requires identical results.

Machine-readable modes (used by the tests): --packs and --figures read a JSON array from standard input and print one list of codes per item.
"""
import json
import math
import pathlib
import re
import sys
import unicodedata

try:
    from jsonschema import Draft7Validator
except ImportError:  # pragma: no cover
    sys.exit("jsonschema is required: pip install jsonschema")

ROOT = pathlib.Path(__file__).resolve().parent.parent
FORMAT = "indicativ-pack"
LIMITS = dict(
    pack_id=40, title=120, licence_class=40, topic=60, question=1000, answer=300, explanation=1000, source=300, url=500, license=80,
    qid=40, syllabus_id=40, syllabus_title=160, syllabus=500, questions=3000, answers_min=2, answers_max=6,
    figure=6000, figure_alt=300, figure_nodes=200, figure_depth=6, figure_text=200, figure_num=10000,
    exam_questions=200, exam_minutes=600,
)
ID_RE = re.compile(r"[A-Z]{2}-[A-Za-z0-9]+-[0-9]+")
PACK_ID_RE = re.compile(r"[a-z0-9]+(-[a-z0-9]+)*")
COUNTRY_RE = re.compile(r"[A-Z]{2}")
LANG_RE = re.compile(r"[a-z]{2,3}")
SYL_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*")
CTRL_LINE = re.compile("[\\x00-\\x1f\\x7f]")
CTRL_TEXT = re.compile("[\\x00-\\x09\\x0b-\\x1f\\x7f]")
# characters that may not appear in an address (the same set as in the engine); built from code points so that the file stays plain ASCII
_BAD = [(0x0000, 0x0020), (0x007F, 0x00A0), (0x1680, 0x1680), (0x2000, 0x200A), (0x2028, 0x2029), (0x202F, 0x202F), (0x205F, 0x205F), (0x3000, 0x3000), (0xFEFF, 0xFEFF)]
URL_RE = re.compile("https://[^" + "".join(chr(a) + "-" + chr(b) for a, b in _BAD) + "]{1,500}")
PACK_KEYS = ["format", "version", "id", "title", "country", "licence_class", "lang", "source", "source_url", "license", "exam", "syllabus", "questions"]
Q_KEYS = ["id", "country", "licence_class", "topic", "question", "answers", "correct", "explanation", "source", "source_url", "syllabus_ref", "lang", "figure", "figure_alt", "fixed_order"]
EXAM_KEYS = ["questions", "minutes", "pass_percent", "wrong_penalty", "source"]
MARKS = re.compile("[" + chr(0x0300) + "-" + chr(0x036F) + "]")
FOLD_WS = re.compile("[ \\t\\r\\n" + chr(0x00A0) + "]+")


def is_int(v, lo, hi):
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        return False
    if isinstance(v, float) and (not math.isfinite(v) or v != math.floor(v)):
        return False
    return lo <= v <= hi


def cp_len(s):
    """Length in code points; -1 if the string has a lone surrogate (JSON allows it, UTF-8 does not)."""
    for ch in s:
        if 0xD800 <= ord(ch) <= 0xDFFF:
            return -1
    return len(s)


def text_ok(v, lo, hi):
    if not isinstance(v, str):
        return False
    n = cp_len(v)
    return lo <= n <= hi


def line(v, hi):
    return text_ok(v, 1, hi) and not CTRL_LINE.search(v)


def block(v, hi):
    return text_ok(v, 1, hi) and not CTRL_TEXT.search(v)


def is_url(u):
    return isinstance(u, str) and cp_len(u) >= 0 and URL_RE.fullmatch(u) is not None


def fold(s):
    t = unicodedata.normalize("NFD", str(s).lower())
    t = MARKS.sub("", t)
    t = FOLD_WS.sub(" ", t)
    return re.sub("^ | $", "", t)


def uniq(items):
    seen, out = set(), []
    for c in items:
        if c not in seen:
            seen.add(c)
            out.append(c)
    return out


# ---------------------------------------------------------------- figures: restricted SVG
NUM = "-?[0-9]+(?:\\.[0-9]+)?"
SEP = "[ ,]+"
NUM_RE = re.compile(NUM)
NUMS_RE = re.compile(NUM + "(?:" + SEP + NUM + ")*")
VIEWBOX_RE = re.compile(NUM + SEP + NUM + SEP + "(" + NUM + ")" + SEP + "(" + NUM + ")")
XFORM = "(?:(?:translate|scale)\\(" + NUM + "(?:" + SEP + NUM + ")?\\)|rotate\\(" + NUM + "(?:" + SEP + NUM + SEP + NUM + ")?\\))"
TRANSFORM_RE = re.compile(XFORM + "(?: " + XFORM + ")*")
PATH_RE = re.compile("[Mm][MmLlHhVvCcSsQqTtAaZz0-9 ,.-]*")
COLOR_RE = re.compile("none|currentColor|#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}")
TAG_RE = re.compile('<(/?)([a-z]+)((?:[ \\t\\r\\n]+[A-Za-z][A-Za-z0-9-]*="[^"<>&]*")*)[ \\t\\r\\n]*(/?)>')
ATTR_RE = re.compile('([A-Za-z][A-Za-z0-9-]*)="([^"]*)"')
TEXT_BAD = re.compile("[\\x00-\\x1f\\x7f<>&]")
WS_STRIP = re.compile("[ \\t\\r\\n]+")
COMMON = ["transform", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray"]
TAGS = {
    "svg": ["viewBox", "xmlns", "width", "height"] + COMMON,
    "g": COMMON,
    "line": ["x1", "y1", "x2", "y2"] + COMMON,
    "rect": ["x", "y", "width", "height", "rx", "ry"] + COMMON,
    "circle": ["cx", "cy", "r"] + COMMON,
    "ellipse": ["cx", "cy", "rx", "ry"] + COMMON,
    "polyline": ["points"] + COMMON,
    "polygon": ["points"] + COMMON,
    "path": ["d"] + COMMON,
    "text": ["x", "y", "text-anchor", "font-size"] + COMMON,
}
NONNEG = {"width", "height", "rx", "ry", "r"}


def num_ok(v):
    return NUM_RE.fullmatch(v) is not None and abs(float(v)) <= LIMITS["figure_num"]


def attr_ok(tag, name, v):
    if name == "viewBox":
        m = VIEWBOX_RE.fullmatch(v)
        if not m:
            return False
        w, h = float(m.group(1)), float(m.group(2))
        return w > 0 and h > 0 and w <= 2000 and h <= 2000 and all(num_ok(x) for x in re.split("[ ,]+", v))
    if name == "xmlns":
        return v == "http://www.w3.org/2000/svg"
    if tag == "svg" and name in ("width", "height"):
        return num_ok(v) and 1 <= float(v) <= 2000
    if name == "points":
        if not NUMS_RE.fullmatch(v):
            return False
        p = re.split("[ ,]+", v)
        return len(p) >= 4 and len(p) % 2 == 0 and len(p) <= 200 and all(num_ok(x) for x in p)
    if name == "d":
        return len(v) <= 2000 and PATH_RE.fullmatch(v) is not None
    if name == "transform":
        return len(v) <= 200 and TRANSFORM_RE.fullmatch(v) is not None and all(num_ok(x) for x in NUM_RE.findall(v))
    if name in ("fill", "stroke"):
        return COLOR_RE.fullmatch(v) is not None
    if name == "stroke-width":
        return num_ok(v) and 0 <= float(v) <= 20
    if name == "stroke-linecap":
        return v in ("butt", "round", "square")
    if name == "stroke-linejoin":
        return v in ("miter", "round", "bevel")
    if name == "stroke-dasharray":
        if not NUMS_RE.fullmatch(v):
            return False
        p = re.split("[ ,]+", v)
        return len(p) <= 8 and all(num_ok(x) for x in p)
    if name == "text-anchor":
        return v in ("start", "middle", "end")
    if name == "font-size":
        return num_ok(v) and 4 <= float(v) <= 48
    if name in NONNEG:
        return num_ok(v) and float(v) >= 0
    return num_ok(v)


def figure_issues(svg):
    issues = []

    def add(code):
        if code not in issues:
            issues.append(code)

    if not isinstance(svg, str):
        return ["type"]
    n = cp_len(svg)
    if n < 0 or n > LIMITS["figure"]:
        return ["size"]
    pos, count, root = 0, 0, None
    stack = []

    def skip_ws(p):
        while p < len(svg) and svg[p] in " \t\r\n":
            p += 1
        return p

    pos = skip_ws(0)
    while pos < len(svg):
        if svg[pos] == "<":
            m = TAG_RE.match(svg, pos)
            if not m:
                add("syntax")
                return issues
            pos = m.end()
            closing, name, attr_str, self_close = m.group(1) == "/", m.group(2), m.group(3), m.group(4) == "/"
            if closing:
                if attr_str or self_close or not stack or stack[-1] != name:
                    add("syntax")
                    return issues
                stack.pop()
                if not stack:
                    pos = skip_ws(pos)
                    if pos < len(svg):
                        add("syntax")
                        return issues
                continue
            if name not in TAGS:
                add("tag")
                return issues
            if root is None and name != "svg":
                add("root")
                return issues
            if root is not None and not stack:
                add("syntax")
                return issues
            if name == "svg" and root is not None:
                add("nested_svg")
                return issues
            count += 1
            if count > LIMITS["figure_nodes"]:
                add("nodes")
                return issues
            if len(stack) >= LIMITS["figure_depth"]:
                add("depth")
                return issues
            seen = set()
            for am in ATTR_RE.finditer(attr_str):
                an, av = am.group(1), am.group(2)
                if an in seen:
                    add("attr_dup")
                    continue
                seen.add(an)
                if an not in TAGS[name]:
                    add("attr")
                    continue
                if not attr_ok(name, an, av):
                    add("attr_value")
                    continue
            if name == "svg" and "viewBox" not in seen:
                add("viewbox")
            if root is None:
                root = name
            if not self_close:
                stack.append(name)
            elif not stack:
                pos = skip_ws(pos)
                if pos < len(svg):
                    add("syntax")
                    return issues
        else:
            j = svg.find("<", pos)
            if j < 0:
                j = len(svg)
            txt = svg[pos:j]
            pos = j
            if not stack:
                if WS_STRIP.sub("", txt):
                    add("syntax")
                    return issues
                continue
            if WS_STRIP.sub("", txt) == "":
                continue
            if stack[-1] != "text":
                add("text")
                continue
            if TEXT_BAD.search(txt) or cp_len(txt) > LIMITS["figure_text"]:
                add("text_chars")
                continue
    if stack or root is None:
        add("syntax")
    return issues


# ---------------------------------------------------------------- questions and packs
def canonical_question(q, p):
    o = {}
    if not isinstance(q, dict):
        return o
    for k in ("country", "licence_class", "lang"):
        if isinstance(p, dict) and k in p:
            o[k] = p[k]
    for k, v in q.items():
        o[k] = v
    return o


def inherited(q, p):
    c = canonical_question(q, p)
    if isinstance(q, dict):
        if "country" not in q and "country" in p:
            c["country"] = "ZZ"
        if "licence_class" not in q and "licence_class" in p:
            c["licence_class"] = "x"
        if "lang" not in q and "lang" in p:
            c["lang"] = "en"
    return c


def question_issues(q, where, syllabus_ids):
    w = where + ":"
    if not isinstance(q, dict):
        return [w + "type"]
    out = []
    for k in q:
        if k not in Q_KEYS:
            out.append(w + "extra")
    if not (isinstance(q.get("id"), str) and len(q["id"]) <= LIMITS["qid"] and ID_RE.fullmatch(q["id"])):
        out.append(w + "id")
    if not (isinstance(q.get("country"), str) and COUNTRY_RE.fullmatch(q["country"])):
        out.append(w + "country")
    if not line(q.get("licence_class"), LIMITS["licence_class"]):
        out.append(w + "licence_class")
    if not line(q.get("topic"), LIMITS["topic"]):
        out.append(w + "topic")
    if not block(q.get("question"), LIMITS["question"]):
        out.append(w + "question")
    a = q.get("answers")
    ok_answers = isinstance(a, list) and LIMITS["answers_min"] <= len(a) <= LIMITS["answers_max"]
    if not ok_answers:
        out.append(w + "answers")
    else:
        seen = set()
        for j, x in enumerate(a):
            if not line(x, LIMITS["answer"]):
                out.append(w + "answer_" + str(j))
                continue
            k = fold(x)
            if k in seen:
                out.append(w + "answers_dup")
            seen.add(k)
    if not is_int(q.get("correct"), 0, len(a) - 1 if ok_answers else 5):
        out.append(w + "correct")
    if "explanation" in q and not block(q["explanation"], LIMITS["explanation"]):
        out.append(w + "explanation")
    if not line(q.get("source"), LIMITS["source"]):
        out.append(w + "source")
    if "source_url" in q and not is_url(q["source_url"]):
        out.append(w + "source_url")
    if "syllabus_ref" in q:
        r = q["syllabus_ref"]
        if not (isinstance(r, str) and len(r) <= LIMITS["syllabus_id"] and SYL_RE.fullmatch(r)):
            out.append(w + "syllabus_ref")
        elif not syllabus_ids or r not in syllabus_ids:
            out.append(w + "syllabus_unknown")
    if "lang" in q and not (isinstance(q["lang"], str) and LANG_RE.fullmatch(q["lang"])):
        out.append(w + "lang")
    if "fixed_order" in q and not isinstance(q["fixed_order"], bool):
        out.append(w + "fixed_order")
    if "figure" in q:
        for c in figure_issues(q["figure"]):
            out.append(w + "figure_" + c)
        if not line(q.get("figure_alt"), LIMITS["figure_alt"]):
            out.append(w + "figure_alt")
    elif "figure_alt" in q:
        out.append(w + "figure_alt_alone")
    return uniq(out)


def exam_issues(e, n_questions):
    out = []
    if not isinstance(e, dict):
        return ["exam:type"]
    for k in e:
        if k not in EXAM_KEYS:
            out.append("exam:extra")
    if not is_int(e.get("questions"), 1, LIMITS["exam_questions"]):
        out.append("exam:questions")
    elif e["questions"] > n_questions:
        out.append("exam:too_many")
    if not is_int(e.get("minutes"), 1, LIMITS["exam_minutes"]):
        out.append("exam:minutes")
    if not is_int(e.get("pass_percent"), 1, 100):
        out.append("exam:pass_percent")
    if "wrong_penalty" in e:
        v = e["wrong_penalty"]
        if not (isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) and 0 <= v <= 1):
            out.append("exam:wrong_penalty")
    if not line(e.get("source"), LIMITS["source"]):
        out.append("exam:source")
    return out


def header_issues(p):
    out = []
    for k in p:
        if k not in PACK_KEYS:
            out.append("pack:extra")
    if p.get("format") != FORMAT:
        out.append("pack:format")
    if not is_int(p.get("version"), 1, 1):
        out.append("pack:version")
    if not (isinstance(p.get("id"), str) and len(p["id"]) <= LIMITS["pack_id"] and PACK_ID_RE.fullmatch(p["id"])):
        out.append("pack:id")
    if not line(p.get("title"), LIMITS["title"]):
        out.append("pack:title")
    if not (isinstance(p.get("country"), str) and COUNTRY_RE.fullmatch(p["country"])):
        out.append("pack:country")
    if not line(p.get("licence_class"), LIMITS["licence_class"]):
        out.append("pack:licence_class")
    if not (isinstance(p.get("lang"), str) and LANG_RE.fullmatch(p["lang"])):
        out.append("pack:lang")
    if not line(p.get("source"), LIMITS["source"]):
        out.append("pack:source")
    if "source_url" in p and not is_url(p["source_url"]):
        out.append("pack:source_url")
    if not line(p.get("license"), LIMITS["license"]):
        out.append("pack:license")
    ids = set()
    if "syllabus" in p:
        syl = p["syllabus"]
        if not isinstance(syl, list) or len(syl) > LIMITS["syllabus"]:
            out.append("pack:syllabus")
        else:
            for i, s in enumerate(syl):
                w = "syllabus" + str(i) + ":"
                if not isinstance(s, dict):
                    out.append(w + "type")
                    continue
                for k in s:
                    if k not in ("id", "title"):
                        out.append(w + "extra")
                sid = s.get("id")
                if not (isinstance(sid, str) and len(sid) <= LIMITS["syllabus_id"] and SYL_RE.fullmatch(sid)):
                    out.append(w + "id")
                else:
                    if sid in ids:
                        out.append(w + "dup")
                    ids.add(sid)
                if not line(s.get("title"), LIMITS["syllabus_title"]):
                    out.append(w + "title")
    return out, ids


def pack_issues(p):
    """List of codes for one pack (empty list = valid). Same codes, same order as validatePack() in src/engine.mjs."""
    if not isinstance(p, dict):
        return ["pack:type"]
    head, ids = header_issues(p)
    out = list(head)
    qs = p.get("questions")
    if not isinstance(qs, list) or len(qs) < 1 or len(qs) > LIMITS["questions"]:
        out.append("pack:questions")
    else:
        seen_id, seen_q = set(), set()
        for i, q in enumerate(qs):
            if not isinstance(q, dict):
                out.append("q" + str(i) + ":type")
                continue
            c = inherited(q, p)
            iss = question_issues(c, "q" + str(i), ids)
            out.extend(iss)
            if isinstance(c.get("id"), str):
                if c["id"] in seen_id:
                    out.append("q" + str(i) + ":id_dup")
                seen_id.add(c["id"])
            if not iss:
                key = fold(c["question"]) + "|" + "|".join(sorted(fold(x) for x in c["answers"]))
                if key in seen_q:
                    out.append("q" + str(i) + ":question_dup")
                seen_q.add(key)
    if "exam" in p:
        out.extend(exam_issues(p["exam"], len(qs) if isinstance(qs, list) else 0))
    return uniq(out)


# ---------------------------------------------------------------- command line
def check_directory(data_dir):
    schema = json.loads((ROOT / "schema.json").read_text(encoding="utf-8"))
    validator = Draft7Validator(schema)
    bad = 0
    files = sorted(data_dir.rglob("*.json"))
    for f in files:
        rel = f.relative_to(ROOT)
        try:
            doc = json.loads(f.read_text(encoding="utf-8"))
        except ValueError as e:
            print("%s: not valid JSON: %s" % (rel, e))
            bad += 1
            continue
        for err in validator.iter_errors(doc):
            bad += 1
            path = "/".join(map(str, err.absolute_path)) or "(root)"
            print("%s: %s: %s" % (rel, path, err.message))
        for code in pack_issues(doc):
            bad += 1
            print("%s: %s" % (rel, code))
        if isinstance(doc, dict) and isinstance(doc.get("id"), str):
            # one file per pack, named after its id: that also keeps the ids unique
            if f.name != "example.json" and f.stem != doc["id"]:
                bad += 1
                print("%s: the file name must be the pack id (%s.json)" % (rel, doc["id"]))
    print("%d file(s) checked, %d problem(s)." % (len(files), bad))
    return 1 if bad else 0


def main(argv):
    if argv[:1] == ["--packs"]:
        print(json.dumps([pack_issues(p) for p in json.loads(sys.stdin.read())]))
        return 0
    if argv[:1] == ["--figures"]:
        print(json.dumps([figure_issues(s) for s in json.loads(sys.stdin.read())]))
        return 0
    data_dir = ROOT / argv[0] if argv else ROOT / "data"
    return check_directory(data_dir)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

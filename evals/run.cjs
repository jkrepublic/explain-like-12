#!/usr/bin/env node
/**
 * evals/run.cjs — grade skill output against the rules in SKILL.md.
 *
 *   node evals/run.cjs                          grade every case in evals/cases/
 *   node evals/run.cjs --check out.md --against in.md    grade one of your own answers
 *   node evals/run.cjs --verbose                show every check, not just failures
 *
 * Five checks run here with no model and no network: the original survived
 * verbatim, the plain-words block exists, it sits beneath rather than in front,
 * there are at most three of them, and the tone does not talk down.
 *
 * A sixth — "say where the analogy breaks" — is detected but reported as
 * coverage rather than pass/fail, because the skill asks for it only when the
 * breakage would change a decision. A check that fires on cases it was never
 * meant for is how a checker becomes noise nobody reads.
 *
 * Four rules genuinely need judgement (does the analogy share the mechanism,
 * were any facts invented, is it drawn from a child's world, were the numbers
 * made hand-sized). Those live in judge-prompt.md as a prompt you paste,
 * deliberately not as an API call — this repository asks for no keys.
 *
 * WHAT THIS PROVES, AND WHAT IT DOES NOT
 *   It proves the grader detects a violation when one is present — the cases
 *   marked `expect: fail` exist for exactly that, and a run where a known-bad
 *   case passes is reported as a failure of the grader, not of the case.
 *   It does NOT prove a model follows the skill. The committed outputs are
 *   reference fixtures. For evidence about a model, run `--check` on an answer
 *   you actually got back.
 *
 * No dependencies. No network. Node 16+.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ARGV = process.argv.slice(2);
const VERBOSE = ARGV.includes("--verbose");
const CASES_DIR = path.join(__dirname, "cases");

const arg = (name) => {
  const i = ARGV.indexOf(name);
  return i >= 0 ? ARGV[i + 1] : null;
};

/* ─────────────────────────── the kid block ─────────────────────────── */

/* The skill's output format: a markdown blockquote whose first line carries the
 * 🧒 marker. Everything quoted after it, until the quoting stops, is the block. */
const KID_LINE = /^\s*>\s*.*🧒/;

function kidBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const quoted = /^\s*>/.test(lines[i]);
    if (!cur && KID_LINE.test(lines[i])) { cur = { start: i, lines: [lines[i]] }; continue; }
    if (cur) {
      if (quoted) cur.lines.push(lines[i]);
      else { cur.end = i - 1; blocks.push(cur); cur = null; }
    }
  }
  if (cur) { cur.end = lines.length - 1; blocks.push(cur); }
  return blocks.map((b) => ({
    start: b.start, end: b.end,
    text: b.lines.map((l) => l.replace(/^\s*>\s?/, "")).join("\n").trim(),
  }));
}

/** Collapse whitespace so a re-wrapped paragraph still counts as unchanged. */
const flat = (s) => String(s).replace(/\s+/g, " ").trim();

/* ─────────────────────────── the four checks ─────────────────────────── */

/**
 * Remove the appended layer, leaving what the answer would have been without
 * the skill. Needed because the skill attaches a block PER CONCEPT ("설명할
 * 개념이 여러 개면 개념마다 따로"), so on a multi-concept answer the blocks sit
 * between paragraphs of the original rather than after all of them. Comparing
 * the raw output against the original would then fail on a correct answer.
 */
function stripBlocks(output) {
  const lines = output.split("\n");
  const drop = new Set();
  for (const b of kidBlocks(output)) for (let i = b.start; i <= b.end; i++) drop.add(i);
  return lines.filter((_, i) => !drop.has(i)).join("\n");
}

/**
 * RULE (SKILL.md "출력 형식", and the anti-pattern "기술 설명을 지우고 대체").
 * The technical answer must survive word for word. Re-wrapping is fine;
 * dropping a clause is not. This is rule 5 of the skill's own final checklist
 * and the one it calls out as most important.
 */
function checkPreserved(input, output) {
  const a = flat(input), b = flat(stripBlocks(output));
  if (b.includes(a)) return { ok: true };
  /* Locate the first word that stopped matching, so a failure is actionable
   * rather than just "not found". */
  const w = a.split(" ");
  let kept = 0;
  while (kept < w.length && b.includes(w.slice(0, kept + 1).join(" "))) kept++;
  const pct = w.length ? Math.round((kept / w.length) * 100) : 0;
  return {
    ok: false,
    detail: `original diverges after ${kept}/${w.length} words (${pct}%) — at "…${w.slice(Math.max(0, kept - 4), kept + 3).join(" ")}"`,
  };
}

/** RULE ("출력 형식"): the plain-words layer is a 🧒 blockquote, not merged prose. */
function checkBlockPresent(blocks) {
  return blocks.length > 0
    ? { ok: true }
    : { ok: false, detail: "no blockquote carrying the 🧒 marker" };
}

/**
 * RULE ("출력 형식"): the plain-words layer is placed BENEATH the thing it
 * explains — "원래 설명을 그대로 두고, 그 아래에". Multi-concept answers
 * interleave, so the test is not "after everything" but "never first": some of
 * the technical answer has to come before the first block. A reader who meets
 * the analogy before the fact has been handed the metaphor as the answer.
 */
function checkNotLeading(output, blocks) {
  if (!blocks.length) return { ok: false, detail: "no block to place" };
  const before = output.split("\n").slice(0, blocks[0].start).join("").trim();
  return before.length > 0
    ? { ok: true }
    : { ok: false, detail: "the answer opens with the plain-words block" };
}

/**
 * RULE ("설명할 개념이 여러 개면 개념마다 따로 … 3개를 넘어가면 오히려 읽기 어려워진다").
 */
function checkBlockCount(blocks) {
  if (blocks.length > 3) return { ok: false, detail: `${blocks.length} blocks; the skill caps this at 3` };
  return { ok: true, detail: blocks.length + " block(s)" };
}

/**
 * RULE ("아기 취급하는 말투 … 오히려 무례하고 정보 밀도만 떨어뜨린다").
 * Checked inside the block only — an exclamation mark in the technical answer
 * is the author's business.
 */
const BABY = [
  { re: /답니다|랍니다|이랍니다/, what: "-답니다 (talking down)" },
  { re: /짜잔|와아|우와+|우와/, what: "cartoon interjection" },
  { re: /\b(Wow|Yay|Neat|Super|Awesome|Magic)\b\s*[!]/i, what: "cheerleading" },
  { re: /친구들|어린이 여러분|얘들아/, what: "addressing the reader as a child" },
];

function checkNoBabyTalk(blocks) {
  const hits = [];
  for (const b of blocks) {
    for (const p of BABY) if (p.re.test(b.text)) hits.push(p.what);
    const bangs = (b.text.match(/!/g) || []).length;
    if (bangs > 1) hits.push(`${bangs} exclamation marks`);
  }
  return hits.length === 0
    ? { ok: true }
    : { ok: false, detail: [...new Set(hits)].join(" · ") };
}

/* ─────────────────────────── coverage, not pass/fail ─────────────────────────── */

/**
 * RULE 6 ("비유가 깨지는 지점은 밝혀라") is conditional — the skill asks for it
 * only when the breakage would affect a real decision. So it is reported as
 * coverage across the suite rather than graded per case. A number that falls is
 * still worth seeing; a rule that fires on cases it was never meant for is how
 * a checker becomes noise.
 */
const BREAKS = /여기까지만|여기까지\s*맞|다만 이 비유|비유는 여기|holds up to here|breaks down|only true|stops being true|analogy ends/i;
const hasBreakNote = (blocks) => blocks.some((b) => BREAKS.test(b.text));

/* ─────────────────────────── case loading ─────────────────────────── */

function parseCase(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error("missing frontmatter: " + path.basename(file));
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  const body = m[2];
  const i = body.indexOf("## INPUT");
  const o = body.indexOf("## OUTPUT");
  if (i < 0 || o < 0) throw new Error("needs '## INPUT' and '## OUTPUT': " + path.basename(file));
  return {
    meta,
    input: body.slice(i + 8, o).trim(),
    output: body.slice(o + 9).trim(),
    file: path.basename(file),
  };
}

function grade(input, output) {
  const blocks = kidBlocks(output);
  const checks = [
    ["original preserved verbatim", checkPreserved(input, output)],
    ["plain-words block present", checkBlockPresent(blocks)],
    ["block placed beneath, never first", checkNotLeading(output, blocks)],
    ["at most 3 blocks", checkBlockCount(blocks)],
    ["no talking down", checkNoBabyTalk(blocks)],
  ];
  return { checks, blocks, passed: checks.every(([, r]) => r.ok), broke: hasBreakNote(blocks) };
}

/* ─────────────────────────── run ─────────────────────────── */

function reportCase(c, g) {
  const want = (c.meta.expect || "pass") === "pass";
  const agrees = g.passed === want;
  const mark = agrees ? "✅" : "❌";
  const label = want ? "" : "  (known-bad — the grader must catch this)";
  console.log(`  ${mark} ${c.meta.id || c.file}${label}`);
  if (VERBOSE || !agrees) {
    for (const [name, r] of g.checks) {
      if (r.ok && !VERBOSE) continue;
      console.log(`       ${r.ok ? "·" : "✗"} ${name}${r.detail ? " — " + r.detail : ""}`);
    }
    if (!agrees && !want) console.log("       this case is supposed to fail, and every check passed");
  }
  return agrees;
}

function runSuite() {
  let files;
  try { files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".md")).sort(); }
  catch (e) { console.error("no cases directory at " + CASES_DIR); process.exit(1); }
  if (!files.length) { console.error("no cases found"); process.exit(1); }

  console.log("\nexplain-like-12 — mechanical checks (no model, no network)\n");
  let agree = 0, broke = 0, bad = 0;
  for (const f of files) {
    const c = parseCase(path.join(CASES_DIR, f));
    const g = grade(c.input, c.output);
    if (reportCase(c, g)) agree++;
    if ((c.meta.expect || "pass") === "pass") { if (g.broke) broke++; } else bad++;
  }
  const good = files.length - bad;

  console.log("\n" + "─".repeat(64));
  console.log(`  ${files.length} cases — ${good} reference, ${bad} known-bad`);
  console.log(`  ${agree}/${files.length} graded as expected`);
  console.log(`  rule 6 ("say where the analogy breaks") present in ${broke}/${good} reference cases`);
  console.log(`  4 rules need judgement and are not checked here — see evals/judge-prompt.md`);
  console.log("─".repeat(64));

  if (agree !== files.length) {
    console.log("\nA case did not grade as expected. If a known-bad case passed, the");
    console.log("grader has a hole — fix the check, not the case.\n");
    process.exit(1);
  }
  process.exit(0);
}

function runOne(outFile, inFile) {
  if (!inFile) { console.error("--check needs --against <file with the original answer>"); process.exit(2); }
  const input = fs.readFileSync(inFile, "utf8").trim();
  const output = fs.readFileSync(outFile, "utf8").trim();
  const g = grade(input, output);
  console.log("\nchecking " + path.basename(outFile) + " against " + path.basename(inFile) + "\n");
  for (const [name, r] of g.checks) {
    console.log(`  ${r.ok ? "✅" : "❌"} ${name}${r.detail ? " — " + r.detail : ""}`);
  }
  console.log(`\n  rule 6 ("say where the analogy breaks"): ${g.broke ? "stated" : "not stated — check whether this answer needed it"}`);
  console.log(`  4 rules need judgement and are not checked here — see evals/judge-prompt.md\n`);
  process.exit(g.passed ? 0 : 1);
}

const check = arg("--check");
if (check) runOne(check, arg("--against"));
else runSuite();

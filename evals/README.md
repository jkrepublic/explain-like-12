# evals

The skill is a prompt, not code. You cannot unit-test it, but you can turn its
rules into checks and run them. That is what this directory is.

```bash
node evals/run.cjs             # grade every case
node evals/run.cjs --verbose   # show every check, not just failures
```

No dependencies. No network. No API key. Node 16+.

---

## What is checked, and by what

`SKILL.md` states six principles plus an output format. They split three ways.

| | Rule | Checked by |
|---|---|---|
| 1 | The technical answer survives **verbatim** | `run.cjs` |
| 2 | The plain-words layer is a marked `🧒` blockquote | `run.cjs` |
| 3 | It sits **beneath** the thing it explains, never first | `run.cjs` |
| 4 | At most **three** blocks in one answer | `run.cjs` |
| 5 | It does **not talk down** to the reader | `run.cjs` |
| 6 | It says **where the analogy breaks** | `run.cjs`, reported as coverage |
| A | The analogy shares the **mechanism**, not the mood | [`judge-prompt.md`](judge-prompt.md) |
| B | **Nothing was invented** that is not in the original | [`judge-prompt.md`](judge-prompt.md) |
| C | Drawn from a world a **12-year-old** knows | [`judge-prompt.md`](judge-prompt.md) |
| D | Numbers made **hand-sized** | [`judge-prompt.md`](judge-prompt.md) |

Rule 6 is reported rather than graded because the skill asks for it
conditionally — only when over-extending the analogy would change a decision.
A check that fires on cases it was never meant for is how a checker turns into
noise nobody reads, so it is counted instead of enforced.

Rules A–D need a reader. They are a prompt you paste, deliberately not an API
call: this repository asks for no keys, and an eval harness that quietly
required one would contradict the thing it is testing.

---

## What this proves — and what it does not

**It proves the grader works.** Three cases in `cases/` are marked
`expect: fail`. Each breaks exactly one rule, and the run fails if any of them
passes. A grader that cannot go red is indistinguishable from one that is not
running.

```
✅ 90-bad-original-replaced   ✗ original preserved verbatim
✅ 91-bad-no-block            ✗ plain-words block present
✅ 92-bad-baby-talk           ✗ no talking down
```

**It does not prove a model follows the skill.** The six reference cases are
written by hand to exemplify the rules. They are fixtures for the grader and a
regression baseline for edits to `SKILL.md` — nothing more. Reading `9/9` as
"the skill works" would be the exact mistake this project is built around.

For evidence about a model, grade an answer you actually received:

```bash
node evals/run.cjs --check my-answer.md --against my-original.md
```

Real output is worth more than the fixtures. If you run this and get something
interesting — a pass, and especially a failure — a PR adding it to `cases/` is
the most useful contribution this repo can receive.

---

## Adding a case

One file, frontmatter plus two sections:

```markdown
---
id: 07-something
title: What it explains
lang: en
expect: pass          # or fail, for a case the grader must catch
note: Why this case exists.
---

## INPUT

The technical answer, before the skill touched it.

## OUTPUT

What came back.
```

If you are adding a `fail` case, make it break **one** rule. A case that breaks
three does not tell you which check caught it, and a check can rot without the
suite noticing.

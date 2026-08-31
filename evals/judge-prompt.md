# judge-prompt

Four of the skill's rules cannot be checked by matching strings. They need a
reader. This file is the prompt for that reader.

**It is a prompt you paste, not an API call.** This repository declares no
tools, needs no key, and makes no network requests; an eval harness that
quietly broke all three would be a strange thing to ship with it. Paste it into
whatever model you already have open, along with the answer you want graded.

---

## How to use

1. Run the mechanical checks first — they are free and catch the obvious breaks:

   ```
   node evals/run.cjs --check your-answer.md --against the-original.md
   ```

2. Then paste the block below, followed by the original answer and the output.

3. Record the four verdicts. If you want to contribute the result, open a PR
   adding your case to `evals/cases/` — real model output is worth more than
   the reference fixtures in there now.

---

## The prompt

````
You are grading one output from a skill called explain-like-12. The skill takes
a technical answer and APPENDS a plain-words explanation beneath it, without
altering the original.

You are checking four rules. Formatting has already been checked mechanically —
ignore it. Judge only the content of the plain-words block.

For each rule answer PASS, FAIL, or N/A, then give one sentence of evidence
quoting the text. Do not be generous: a FAIL here is cheaper than a reader
acting on a broken analogy.

RULE A — the analogy shares the MECHANISM, not the mood.
  A good analogy reproduces the relationships in the original. If the original
  says "A is small, so B must be evicted when it fills", the analogy must have
  something small, something that fills, and something that gets removed.
  "A cache is like a library" is a FAIL — it names a place and stops there.
  Ask: does each moving part of the original have a counterpart that behaves
  the same way? If the analogy only conveys a vibe, FAIL.

RULE B — nothing was invented.
  Every claim in the plain-words block must be traceable to the original or be
  common knowledge. Simplification means leaving detail OUT; adding a plausible
  number, cause, or consequence that is not in the original is distortion, and
  it is the failure this skill exists to prevent. If a reader acted on the block
  alone and would be wrong, FAIL.

RULE C — it is drawn from a world a 12-year-old actually knows.
  School, lunch, homework, pocket money, a corner shop, games, football,
  siblings, tidying a room, a bicycle, a playground. NOT: the stock market,
  mortgages, org charts, tax, credit. An adult analogy with shorter words is a
  FAIL — it has not solved anything.

RULE D — numbers were made hand-sized. (N/A if the original has no numbers.)
  A raw figure does not help; a ratio or a reference point does. "200 ms" alone
  is a FAIL. "200 ms, about one blink" is a PASS. "35 requests a minute, where a
  person shopping makes one or two — twenty times more" is a PASS.

Then answer one more question, separately:

RULE E (reported, not graded) — does the block say where the analogy stops
  being true? The skill asks for this only when the breakage would change a
  decision. So: would a reader who took this analogy literally make a wrong
  call? If yes, and the block does not warn them, say SHOULD HAVE. If the
  analogy is harmless when over-extended, say NOT NEEDED.

Output exactly this shape and nothing else:

  A mechanism: PASS|FAIL — <evidence>
  B invented:  PASS|FAIL — <evidence>
  C world:     PASS|FAIL — <evidence>
  D numbers:   PASS|FAIL|N/A — <evidence>
  E breakage:  STATED|SHOULD HAVE|NOT NEEDED — <evidence>

--- ORIGINAL ANSWER ---
<paste here>

--- SKILL OUTPUT ---
<paste here>
````

---

## What this grading cannot do

- **One reader, one opinion.** Rule A in particular is a judgement call, and two
  competent graders will disagree on borderline analogies. Treat a single FAIL
  as a prompt to look, not as a verdict.
- **The grader has the same blind spots as the writer** if you paste it into the
  same model that produced the output. For anything you care about, grade with a
  different model than the one that wrote it.
- **It says nothing about whether the analogy lands.** Passing all four rules
  means the explanation is not wrong. Whether it actually helps a particular
  reader is not something a rubric can settle.

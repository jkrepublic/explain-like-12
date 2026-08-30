# explain-like-12

> Claude Code / Claude Agent Skill — 기술 설명을 **지우지 않고**, 그 아래에 12살이 이해할 사다리를 놓는다.
> A skill that **adds** a 12-year-old's explanation beneath the technical one, instead of replacing it.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Agent%20Skill-d97757.svg)](https://docs.claude.com/en/docs/claude-code/skills)
[![Single file](https://img.shields.io/badge/1%20file-7.6KB-informational.svg)](skills/explain-like-12/SKILL.md)
[![No tools](https://img.shields.io/badge/tool%20calls-none-success.svg)](#weight-and-safety--무게와-안전)

---

## What changes · 무엇이 달라지나

**Without the skill** — you ask for it simply, and the accurate version is gone:

> **Q.** What's a cache? Explain it simply.
>
> **A.** A cache is like a library where you keep things you need often.

You lost the eviction policy, the size limit, and the speed tradeoff. You also can't act on it.

**With the skill** — the accurate version stays, and a ladder is placed next to it:

> **A.** A cache is a small, fast store placed in front of a slow one. Reads hit it first; misses fall through to the origin and are written back. Because it is small, an eviction policy (LRU, LFU, TTL) decides what gets dropped when it fills.
>
> > 🧒 **In plain words**
> > Instead of walking to the library every time, you keep a few books you read often on your desk. The desk is small, so when it fills up you clear out the ones you stopped opening.
> >
> > The analogy holds up to here — in real life the books on the desk don't vanish on their own; you have to write the rule for clearing them.

Same in Korean, or any language you are working in:

> **A.** MV3 서비스 워커는 유휴 30초면 종료되므로 `setTimeout`으로 장시간 대기를 구현하면 동작하지 않는다. `chrome.alarms`를 써야 한다.
>
> > 🧒 **쉽게 말하면**
> > 서비스 워커는 "할 일 없으면 30초 만에 잠드는 사람"임. 자는 사람 손에 알람시계를 쥐여줘 봐야 소용없음(`setTimeout`). 벽에 걸린 알람시계(`chrome.alarms`)가 대신 울려서 깨워야 함.

Three things are load-bearing and easy to miss:

1. **The technical answer is untouched.** This skill appends; it never rewrites.
2. **The analogy shares the mechanism** — desk/library maps speed, capacity *and* eviction. Not just "a place where things are kept."
3. **It says where the analogy breaks.** That last line is what stops a reader from acting on the metaphor as if it were the fact.

---

## Not the same as `eli5` · 기존 eli5 와 다른 점

There is already an [`eli5` plugin](https://github.com/anthropics/claude-plugins-community/tree/main/eli5) in the Claude community marketplace. It is a good tool for a different job. Pick by what you need:

| | `eli5` | `explain-like-12` (this) |
|---|---|---|
| Output | A **separate** HTML artifact, big pictures, few words | A block **appended beneath** the original answer |
| Audience | Someone who knows **nothing** about the topic | Someone who lacks the **vocabulary**, not the concepts |
| The original explanation | Not part of the output | **Preserved verbatim** — that is the point |
| Invocation | `/eli5 <topic>` — you ask for a standalone explainer | Fires mid-answer, on "I don't get it", "explain simply", "ELI5" |
| Guardrails | — | 6 fixed rules, incl. an explicit **simplify-vs-distort** line |
| Best for | Onboarding a total newcomer to a subject | Reading a technical answer you must **act on** |

Short version: `eli5` **replaces**, this one **annotates**. Use `eli5` to learn a topic cold; use this when you need the precise answer *and* the intuition in the same place.

---

## Weight and safety · 무게와 안전

Loading many skills costs context, and installing someone else's prompt is a real supply-chain question. Both concerns are fair. Here are the measured numbers so you don't have to take it on faith:

| | Measured |
|---|---|
| Files in the skill | **1** (`SKILL.md`, no scripts, no assets) |
| Size | **7,594 bytes** |
| **Always** in your context (the `description`) | 346 chars ≈ **~230 tokens**\* |
| Loaded only **when it fires** (the body) | 3,162 chars ≈ ~2,100 tokens\* |
| `allowed-tools` declared | **none** |
| Shell / command execution | **none** |
| Network calls, URLs, fetches | **none** |
| Executable files (`.py`/`.js`/`.sh`) | **0** |

\* Token counts are an approximation (≈1.5 Korean chars per token), not an exact tokenizer measurement.

It is a text file with instructions for writing. It cannot run anything, reach anything, or read anything. You are encouraged to open [the whole file](skills/explain-like-12/SKILL.md) — it is 134 lines — and to have your agent audit it before installing, as you should with any skill.

**And if you'd rather not install it at all:** take the six rules and write your own. That is a completely reasonable way to use this repo, and the rules are in the README below for exactly that reason.

---

## 한국어

### 이 스킬이 푸는 문제

「쉽게 설명해줘」라고 하면 대부분의 AI는 **정확한 설명을 지우고** 쉬운 걸로 바꿔 놓는다.
그런데 사람이 원한 건 둘 중 하나가 아니라 **둘 다**다. 정확한 정보와 직관적 이해는 맞바꿀 대상이 아니다.

이 스킬은 원래 설명을 그대로 둔 채 그 아래에 한 블록을 덧붙인다.

```
[기술 설명 — 정확도를 전혀 깎지 않은 원래 내용]

> 🧒 **쉽게 말하면**
> [비유 중심 설명]
```

### 다른 ELI5 프롬프트와 무엇이 다른가

대부분의 「쉽게 설명」 프롬프트는 *「초등학생에게 설명하듯 해줘」* 한 줄이다.
그러면 두 가지가 같이 온다 — **아기 말투**와 **분위기만 비슷한 비유**. 둘 다 이해를 돕지 않는다.

이 스킬이 규칙으로 고정한 것:

| 규칙 | 내용 |
|---|---|
| **12살은 바보가 아니다** | 분수·확률·이자·예외·대가 관계를 전부 이해한다. 못 알아듣는 건 개념이 아니라 **용어**다. 그래서 할 일은 「내용을 쉽게 만들기」가 아니라 **「같은 내용을 아는 단어로 바꾸기」** |
| **단순화는 되지만 왜곡은 안 된다** | 단순화 = 세부를 생략, 남은 건 여전히 참. 왜곡 = 쉽게 만들려고 사실이 아닌 걸 말함. 쉬운 설명만 읽고 판단해도 **틀리지 않아야** 한다 |
| **비유는 메커니즘이 같아야 한다** | 분위기가 아니라 **관계의 구조**가 같아야 한다. 「원본에서 A가 B에 하는 일을, 비유에서 A′가 B′에게 똑같이 하는가?」 아니면 버린다 |
| **아이가 아는 세계에서만** | 학교·급식·용돈·편의점·게임·자전거. 주식·부동산·세금·대출은 12살의 세계가 아니다 |
| **숫자는 손에 잡히는 크기로** | 「분당 35회」 ✗ → 「사람이 쇼핑할 땐 1~2회다. **20배**」 ✓ |
| **비유가 깨지는 지점을 밝힌다** | 모든 비유는 어딘가에서 어긋난다. 그 지점이 판단에 영향을 주면 한 줄 덧붙인다. 이 한 줄이 「비유를 사실로 착각하는」 가장 흔한 사고를 막는다 |

### 예시

기술 예시는 [맨 위](#what-changes--무엇이-달라지나)에 있다. 이 스킬이 코드 밖에서도 그대로 도는 걸 보여주는 둘.

**재무**

> ROAS 1.5는 광고비 대비 매출이 1.5배라는 뜻이다. 매출총이익률이 30%라면 광고비 100만 원으로 매출 150만 원, 이익 45만 원이 나오므로 광고비를 못 건진다. 손익분기 ROAS는 약 3.3이다.
>
> 🧒 **쉽게 말하면**
> 붕어빵 장사를 생각해보자. 1000원에 팔지만 밀가루·팥값 빼면 내 손에 남는 건 300원임. 전단지 뿌리는 데 1000원 썼는데 붕어빵 1.5개가 더 팔렸으면, 더 번 돈은 450원임. 전단지값 1000원을 못 채움. 최소한 3개는 더 팔려야 본전임.
>
> 다만 이 비유는 "이번 달"까지만 맞음 — 한 번 온 손님이 다음 달에 또 오면 계산이 달라짐.

코드·시스템 설계뿐 아니라 **마케팅·계약·재무·법률·의학**에 그대로 적용된다.

### 언제 발동하나

"쉽게 설명해줘" · "초등학생도 알아듣게" · "그게 무슨 말이야" · "이해가 안 돼" · "풀어서 말해줘" ·
"비유 들어서 설명해줘" · "아까 그거 쉽게" · "ELI5" · "explain like I'm 12"

### 설치

**방법 1 — `skills` CLI (가장 짧고, 클로드 코드 밖에서도 됨)**

```bash
npx skills add jkrepublic/explain-like-12
```

[skills](https://github.com/vercel-labs/skills) 는 Claude Code · Codex · Cursor · OpenCode 등을 지원한다. 설치 없이 한 번만 써보려면:

```bash
npx skills use jkrepublic/explain-like-12 | claude
```

**방법 2 — 클로드 코드 플러그인으로**

```
/plugin marketplace add jkrepublic/explain-like-12
/plugin install explain-like-12@explain-like-12
```

**방법 3 — 스킬 파일만 직접**

```bash
git clone https://github.com/jkrepublic/explain-like-12.git
cp -r explain-like-12/skills/explain-like-12 ~/.claude/skills/
```

Windows PowerShell:

```powershell
git clone https://github.com/jkrepublic/explain-like-12.git
Copy-Item -Recurse explain-like-12\skills\explain-like-12 "$env:USERPROFILE\.claude\skills\"
```

프로젝트 안에서만 쓰려면 `~/.claude/skills/` 대신 `<프로젝트>/.claude/skills/` 에 둔다.

---

## English

### The problem

Ask an AI to "explain it simply" and most will **delete the accurate explanation** and hand you the simple one instead.
But you wanted both. Precision and intuition are not a trade.

This skill leaves the original intact and appends one block underneath it.

### What makes it different from a one-line ELI5 prompt

A one-line prompt gets you two things you didn't want: **baby talk**, and analogies that only match in *mood*.

This skill fixes six rules:

1. **A 12-year-old is not stupid — they just have fewer words.** They already understand fractions, probability, interest, exceptions, trade-offs. The barrier is vocabulary, not concepts. So the job is not "make it simpler" but **"say the same thing in words they have."**
2. **Simplify, never distort.** Simplifying omits detail and what remains is still true. Distorting says something false to make it easier. If someone acts on the simple version and gets it wrong, the explanation failed.
3. **The analogy must share the mechanism, not the vibe.** Ask: *does A do to B in the original what A′ does to B′ in the analogy?* If no, throw it away.
4. **Draw only from a child's actual world.** School, lunch money, convenience stores, games, bicycles. Not stocks, mortgages, or tax brackets.
5. **Turn numbers into graspable sizes.** "35 requests/min" ✗ → "a human shopping does 1–2. That's **20×**" ✓
6. **Say where the analogy breaks.** Every analogy fails somewhere. If that point affects a decision, add one line. That line prevents the most common failure: mistaking the analogy for the fact.

The skill works on code and system design, but equally on **marketing, contracts, finance, law, and medicine.**

### Install

**With the [`skills`](https://github.com/vercel-labs/skills) CLI** — shortest, and works beyond Claude Code (Codex, Cursor, OpenCode, and others):

```bash
npx skills add jkrepublic/explain-like-12
```

Try it once without installing anything:

```bash
npx skills use jkrepublic/explain-like-12 | claude
```

**As a Claude Code plugin:**

```
/plugin marketplace add jkrepublic/explain-like-12
/plugin install explain-like-12@explain-like-12
```

**Or drop the skill in directly:**

```bash
git clone https://github.com/jkrepublic/explain-like-12.git
cp -r explain-like-12/skills/explain-like-12 ~/.claude/skills/
```

Use `<project>/.claude/skills/` instead of `~/.claude/skills/` to scope it to one project.

### Triggers

"explain simply", "ELI5", "explain like I'm 12", "what does that mean", "I don't get it",
"use an analogy", plus the Korean equivalents listed above.

---

## Design notes

- **The skill adds, never replaces.** The final checklist ends with *"is the original technical explanation still there?"* — that is the failure mode this skill exists to prevent.
- **Max three simple blocks per answer.** More than that and they collide; pick the concepts most likely to block understanding.
- **Written in Korean, works in any language.** The instruction body is Korean; the model applies the rules to whatever language the conversation is in. Examples are Korean by origin.

## License

MIT. See [LICENSE](LICENSE).

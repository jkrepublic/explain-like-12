---
id: 05-two-concepts-en
title: Idempotency and backpressure
lang: en
expect: pass
note: Two concepts, so two blocks, interleaved. Exercises the rule that a block attaches per concept rather than one summary at the end.
---

## INPUT

An endpoint is idempotent when repeating the same request leaves the server in the same state as sending it once, so a client can safely retry after a timeout without risking a duplicate effect.

Backpressure runs the other direction: when a consumer cannot keep up, it signals the producer to slow down, instead of silently dropping work or letting an unbounded queue grow until memory runs out.

## OUTPUT

An endpoint is idempotent when repeating the same request leaves the server in the same state as sending it once, so a client can safely retry after a timeout without risking a duplicate effect.

> 🧒 **In plain words**
> Pressing the lift button five times is idempotent — the lift still comes once. Taking five cookies from the jar is not; each press changes something.

Backpressure runs the other direction: when a consumer cannot keep up, it signals the producer to slow down, instead of silently dropping work or letting an unbounded queue grow until memory runs out.

> 🧒 **In plain words**
> The person washing dishes says "stop stacking, I can't keep up" instead of letting the pile grow until it topples. Saying nothing and hoping is how the pile ends up on the floor.

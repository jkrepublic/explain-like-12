---
id: 06-latency-en
title: p99 latency and index size
lang: en
expect: pass
note: Rule 5 — the raw figures stay in the technical answer, and the block converts them to sizes a reader can hold.
---

## INPUT

The p99 latency on this endpoint is 200 ms and the index is 12 TB, so a full scan is not an option; the planner has to use the partition key or the query will time out.

## OUTPUT

The p99 latency on this endpoint is 200 ms and the index is 12 TB, so a full scan is not an option; the planner has to use the partition key or the query will time out.

> 🧒 **In plain words**
> 200 ms is about one blink. One request in a hundred takes that long, and that is the slow one people complain about. The index is roughly three thousand films' worth of data — you do not flip through that to find one scene, you go to the chapter mark.
>
> The analogy stops being true at the chapter mark: a film has one, and a database only has one if somebody chose the partition key correctly.

---
id: 01-cache-en
title: What a cache is
lang: en
expect: pass
note: The reference case. Analogy shares speed, capacity and eviction, and names its own limit.
---

## INPUT

A cache is a small, fast store placed in front of a slow one. Reads hit it first; misses fall through to the origin and are written back. Because it is small, an eviction policy (LRU, LFU, TTL) decides what gets dropped when it fills.

## OUTPUT

A cache is a small, fast store placed in front of a slow one. Reads hit it first; misses fall through to the origin and are written back. Because it is small, an eviction policy (LRU, LFU, TTL) decides what gets dropped when it fills.

> 🧒 **In plain words**
> Instead of walking to the library every time, you keep a few books you read often on your desk. The desk is small, so when it fills up you clear out the ones you stopped opening.
>
> The analogy holds up to here — in real life the books on the desk don't vanish on their own; you have to write the rule for clearing them.

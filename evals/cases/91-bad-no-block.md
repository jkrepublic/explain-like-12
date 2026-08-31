---
id: 91-bad-no-block
title: KNOWN BAD — plain words merged into prose instead of a marked block
lang: ko
expect: fail
note: The original survives, so this looks harmless. It is not — a reader skimming cannot tell where the precise part ends and the analogy begins, which is the exact confusion the format prevents.
---

## INPUT

MV3 서비스 워커는 유휴 30초면 종료되므로 `setTimeout`으로 장시간 대기를 구현하면 동작하지 않는다. `chrome.alarms`를 써야 한다.

## OUTPUT

MV3 서비스 워커는 유휴 30초면 종료되므로 `setTimeout`으로 장시간 대기를 구현하면 동작하지 않는다. `chrome.alarms`를 써야 한다. 쉽게 말하면 서비스 워커는 할 일이 없으면 30초 만에 잠드는 사람이라서, 자는 사람 손에 알람시계를 쥐여줘 봐야 소용이 없고 벽에 걸린 알람시계가 대신 울려 줘야 한다.

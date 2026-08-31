---
id: 02-service-worker-ko
title: MV3 service worker idle termination
lang: ko
expect: pass
note: No breakage note. Rule 6 is conditional and nothing here misleads a decision.
---

## INPUT

MV3 서비스 워커는 유휴 30초면 종료되므로 `setTimeout`으로 장시간 대기를 구현하면 동작하지 않는다. `chrome.alarms`를 써야 한다.

## OUTPUT

MV3 서비스 워커는 유휴 30초면 종료되므로 `setTimeout`으로 장시간 대기를 구현하면 동작하지 않는다. `chrome.alarms`를 써야 한다.

> 🧒 **쉽게 말하면**
> 서비스 워커는 "할 일 없으면 30초 만에 잠드는 사람"임. 자는 사람 손에 알람시계를 쥐여줘 봐야 소용없음(`setTimeout`). 벽에 걸린 알람시계(`chrome.alarms`)가 대신 울려서 깨워야 함.

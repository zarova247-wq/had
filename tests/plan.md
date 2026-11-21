# P06 — тест-план

| # | Проверка | Ожидание | Факт | Статус |
|---|---|---|---|---|
| T1 | Поиск `LAB-5012` + ALL | 1 запись | 1 запись | PASS |
| T2 | Фильтр READY, пустой поиск | 2 записи | 2 записи | PASS |
| T3 | Поиск `LAB-9999` | 0 записей + текст пустой выборки | виден `#empty` | PASS |
| T4 | `<img src=x onerror=alert(1)>` в `#safe-input` | как текст, без alert | без alert | PASS |
| T5 | 3× `render()` + 1 клик | `listClickHandlerCalls=1` | 1 | PASS |
| T6 | 1 клик по «Учебное локальное изменение» | `successfulTransitions=1`, версия +1 | v1→v2 (READY→ISSUED) | PASS |
| T7 | Устаревшая версия | `applyTransition(o, stale, …)` → `ok:false` | ok:false | PASS |
| T8 | Терминальный статус | кнопка disabled + aria-describedby + видимая причина | PASS | PASS |
| T9 | Tab-сценарий | все элементы доступны, ловушек нет | пройдено | PASS |
| T10 | Отправка формы не перезагружает | `location.href` не меняется | PASS | PASS |
| T11 | `LAB!` в поиске | `#query-err` текст, `aria-invalid=true`, фокус в поле | PASS | PASS |
| T12 | Версия +1 на успешный переход | v+1 | PASS | PASS |

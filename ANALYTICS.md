# 방문 분석 (analytics.js)

GA4 + Microsoft Clarity. 모든 페이지 `<head>` 에서 `<script defer src="/analytics.js?v=...">` 로 로드.
`analytics.js` 상단 `GA_ID` (현재 `G-S7FJXKTDS3`), `CLARITY_ID` (현재 `z21wd7tgjr`) 가 비어 있으면 해당 도구는 로드하지 않는다 (둘 다 비면 아무것도 안 함).
analytics.js 를 고치면 6개 페이지(index·winter·guide·rules·support·gileum)의 `?v=` 값을 함께 올린다.

## GA4 설정

관리 > 맞춤 정의에 등록해야 보고서에서 나뉜다: 측정기준 `section`, `branch`, `label`, `popup`, `method`, `grade`, `who`, `period`, `target` / 측정항목 `seconds`.

## 이벤트

`section` 값 = `페이지/섹션` (페이지: main, winter, guide, rules, support. 섹션: `data-track` > id > 첫 class 순. 같은 이름이 반복되면 `_2`).

| 이벤트 | 파라미터 | 의미 |
|---|---|---|
| `section_reach` | section | 섹션이 보이는 상태로 누적 1초 (방문당 섹션별 1회) |
| `section_time` | section, seconds | 섹션이 보인 누적 초. 탭이 가려질 때/이탈 시 전송 |
| `popup_view` / `popup_click` / `popup_never` / `popup_close` | popup, method | 메인 윈터스쿨 팝업 노출 / 이미지 클릭 / 다시 열지 않기 / 닫기(button·esc·overlay) |
| `winter_link_click` | label, section | /winter/ 로 가는 링크 (상단·모바일 메뉴) |
| `naver_click` | branch, label, section | naver.me 링크 (상담신청·플레이스·리뷰) |
| `call_click` | branch, section | 전화 링크 |
| `map_click` | branch, section | 메인 지점 지도 |
| `cta_click` | label, target, section | 페이지 내 이동 링크 (`#...`, 메뉴 포함) |
| `calc_use` | section | 윈터 이용 금액 계산기 첫 조작 |
| `apply_start` / `apply_attempt` / `apply_submit` | branch, grade, who, period | 윈터 신청서 첫 입력 / 제출 버튼 누름 / 필수 항목이 모두 채워진 첫 제출. 이름·연락처는 보내지 않음 |
| `chatbot_open` / `chatbot_message` | section | 챗봇 (현재 비활성) |

섹션 "보는 중" = 섹션 자신의 절반 이상이 보이거나 화면 절반 이상을 차지. 여러 섹션이 동시에 해당될 수 있다. 탭이 가려져 있거나 팝업이 열려 있는 동안은 세지 않는다.

신청서 접수가 서버에 연결되면 `apply_submit` 은 접수 성공 시점에 보내도록 옮긴다 (지금은 필수 항목 충족 기준).

# ubase.kr 도메인 & 호스팅 설정

## 1. 도메인 (가비아)

| 항목 | 값 |
|------|---|
| 도메인 | ubase.kr |
| 등록일 | 2025-05-16 |
| 만기일 | 2029-05-16 |
| 소유자 | 프로네시스 (jjy@prnss.io) |
| 관리자 | 진주영 (jjy@prnss.io) |

### 네임서버 (가비아)

| 순서 | 호스트 |
|------|--------|
| 1차 | ns.gabia.co.kr |
| 2차 | ns1.gabia.co.kr |

---

## 2. DNS 레코드 (가비아 DNS 관리)

| 타입 | 호스트 | 값 | TTL |
|------|--------|---|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | techownerns.github.io | 600 |
| A | dev | 3.37.17.87 | 600 |
| A | dev-umanager | 3.37.17.87 | 600 |
| A | push | 15.164.58.141 | 600 |
| A | umanager | 3.36.210.135 | 600 |
| A | uclass | 3.36.210.135 | 600 |
| A | web | 3.36.210.135 | 600 |
| A | was | 43.202.168.126 | 600 |
| A | dev-uclass | 52.78.207.137 | 600 |
| TXT | googleplay | google-site-verification=YynjIgwvVogQ-MBq9RBkG6FL9Vm2yOlWQlghJacWebo | 600 |
| TXT | @ | google-site-verification=YynjIgwvVogQ-MBq9RBkG6FL9Vm2yOlWQlghJacWebo | 600 |
| CNAME | _4942a0e5f660277cf9f400e718cc4c40 | e55a962a13284...comodoca.com (SSL 인증) | 600 |

---

## 3. 호스팅 (GitHub Pages)

| 항목 | 값 |
|------|---|
| 리포지토리 | techownerns/ubase-website |
| 브랜치 | main |
| CNAME | ubase.kr |
| SSL | Let's Encrypt (만료 2026-06-11) |
| HTTPS 강제 | 미설정 |

---

## 4. 구조 요약

```
ubase.kr (가비아 도메인)
  └─ 네임서버: 가비아 (ns.gabia.co.kr, ns1.gabia.co.kr)
       └─ A 레코드 → 185.199.108/109/110/111.153 (GitHub Pages)
            └─ techownerns/ubase-website (GitHub Pages)

www.ubase.kr
  └─ CNAME → techownerns.github.io → GitHub Pages

서브도메인:
  ├─ dev.ubase.kr → 3.37.17.87
  ├─ dev-umanager.ubase.kr → 3.37.17.87
  ├─ umanager.ubase.kr → 3.36.210.135
  ├─ uclass.ubase.kr → 3.36.210.135
  ├─ web.ubase.kr → 3.36.210.135
  ├─ was.ubase.kr → 43.202.168.126
  ├─ dev-uclass.ubase.kr → 52.78.207.137
  └─ push.ubase.kr → 15.164.58.141
```

---

*최종 확인: 2026-03-14*

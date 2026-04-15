# 스타일 비교 Showcase 설계

---

## 1. 개요

Apple, Airtable, Coinbase 3개 브랜드 스타일을 Showcase 페이지에 적용하여 비교하고, Stock Alarm 전체 프로젝트에 적용할 스타일을 선택한다.

**도구:**
- getdesign.md — DESIGN.md 스타일 파일 (Apple, Airtable, Coinbase)
- anthropics/skills/frontend-design — 랜딩 페이지 리빌딩 (스타일 선택 후)

---

## 2. 라우트 구조

```
/showcase/                        → default 카테고리 목록
/showcase/layout                  → Layout 컴포넌트
/showcase/navigation              → Navigation 컴포넌트
/showcase/forms                   → Form 컴포넌트
/showcase/display                 → Display 컴포넌트
/showcase/feedback                → Feedback 컴포넌트
/showcase/overlay                 → Overlay 컴포넌트
/showcase/prototype               → 페이지 구성 예시

/showcase/apple/                  → Apple 카테고리 목록
/showcase/apple/layout            → Apple Layout 컴포넌트
/showcase/apple/navigation        → Apple Navigation 컴포넌트
/showcase/apple/forms             → Apple Form 컴포넌트
/showcase/apple/display           → Apple Display 컴포넌트
/showcase/apple/feedback          → Apple Feedback 컴포넌트
/showcase/apple/overlay           → Apple Overlay 컴포넌트
/showcase/apple/prototype         → Apple 페이지 구성 예시

/showcase/airtable/               → (동일 구조)
/showcase/airtable/layout         →
...
/showcase/airtable/prototype      →

/showcase/coinbase/               → (동일 구조)
/showcase/coinbase/layout         →
...
/showcase/coinbase/prototype      →
```

총 페이지: 기존 8 + 신규 24 = 32페이지

---

## 3. 작업 순서

### 3.1 prototype 페이지 정리

기존 내용 유지 + 2개 예시 추가:

**기존 (유지):**
- 대시보드: Alert Card, Alert Card List, Skeleton, Empty State
- 종목 상세: DetailHeader, StockPriceHero, ChartPlaceholder, AlertHistorySection, MemoSection, 전체 레이아웃
- 설정: SettingsPrototype (이미지 없음/있음)

**추가:**
- 데이터 테이블 예시 — 알림 이력 테이블 (Table + 필터 탭 + 페이지네이션)
- 로그인 카드 예시 — 로그인 Card (제목 + 설명 + Google 버튼)

### 3.2 DESIGN.md 설치

```bash
npx getdesign@latest add apple
npx getdesign@latest add airtable
npx getdesign@latest add coinbase
```

DESIGN.md 파일 위치: `docs/design/styles/{apple,airtable,coinbase}/DESIGN.md`

### 3.2.1 폰트 대체 (라이선스 문제)

3개 스타일 모두 전용 폰트를 사용하고 있어 상업적 사용 불가. 한글 지원 오픈소스 폰트로 대체:

| 스타일 | 원본 폰트 | 대체 폰트 | 라이선스 |
|--------|----------|----------|---------|
| Apple | SF Pro Display/Text | **Pretendard** | SIL Open Font License |
| Airtable | Haas / Haas Groot Disp | **IBM Plex Sans KR** | SIL Open Font License |
| Coinbase | CoinbaseDisplay/Sans/Text | **Noto Sans KR** | SIL Open Font License |

DESIGN.md의 폰트 관련 속성(weight, line-height, letter-spacing)은 대체 폰트에 그대로 적용.

### 3.3 스타일별 Showcase 생성

스타일 하나씩 순차 진행:

```
3-3-1. Apple 스타일 8페이지
3-3-2. Airtable 스타일 8페이지
3-3-3. Coinbase 스타일 8페이지
```

**스타일 적용 범위 (깊은 적용):**
- CSS 변수 (색상, 간격, border-radius 등)
- 폰트
- 컴포넌트 구조/레이아웃
- 모션/애니메이션
- 과하다고 판단되면 가벼운 적용으로 조정

**스타일 적용 방식:**
- 각 스타일 라우트의 layout.tsx에서 해당 DESIGN.md 기반 CSS 변수 오버라이드
- 필요시 컴포넌트 레벨에서 스타일 변경

---

## 4. 비교 방법

브라우저 탭 4개 (default + 3 스타일) 동시 열기:

```
탭 1: /showcase/prototype          (default)
탭 2: /showcase/apple/prototype    (Apple)
탭 3: /showcase/airtable/prototype (Airtable)
탭 4: /showcase/coinbase/prototype (Coinbase)
```

개별 컴포넌트도 카테고리별로 비교:

```
탭 1: /showcase/forms              (default)
탭 2: /showcase/apple/forms        (Apple)
탭 3: /showcase/airtable/forms     (Airtable)
탭 4: /showcase/coinbase/forms     (Coinbase)
```

---

## 5. 비교 후 작업

### 5.1 스타일 선택

비교 결과를 바탕으로 1개 스타일 선택.

### 5.2 전체 프로젝트 적용

선택한 스타일의 DESIGN.md를 기반으로 전체 프로젝트의 CSS 변수, 폰트, 컴포넌트 스타일을 교체.

### 5.3 랜딩 페이지 리빌딩

anthropics/skills/frontend-design 스킬을 사용하여 랜딩 페이지를 선택된 스타일 기반으로 리빌딩.

### 5.4 보안 점검

최종 코드 기준으로 보안 체크리스트 실행.

---

## 6. 스타일 특성 참고

| 스타일 | 특성 | Stock Alarm 적합성 |
|--------|------|-------------------|
| Apple | 미니멀, 넉넉한 여백, 부드러운 그림자, 깔끔한 카드 | 설정/로그인 같은 심플한 화면에 적합 |
| Airtable | 밝고 컬러풀, 친근한 톤, 둥근 UI, 명확한 데이터 테이블 | 대시보드/테이블 중심 화면에 적합 |
| Coinbase | 금융/핀테크, 진한 네이비/화이트, 신뢰감, 깔끔한 수치 표시 | 금융 서비스 성격과 직접 부합 |

최종 선택은 Showcase 비교 결과로 판단.
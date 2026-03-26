# 알림 이력 페이지 개선 설계

---

## 1. 현재 상태

**경로:** `/history` (사이드바 "알림 이력")

**현재 구현:**
- 서버사이드 페이지네이션 (20건 고정)
- 테이블: 종목명(상세 링크), 기준가, 발동가, 변동률, 유형, 이메일, 발송일시
- 빈 상태 처리
- 전체 건수 Badge

**문제점:**
- 변동률 색상이 `text-red-500` / `text-blue-500`으로 하드코딩 — 프로젝트 전체는 `text-success` / `text-destructive` 사용
- 필터/검색 기능 없음 — 이력이 많아지면 원하는 정보를 찾기 어려움
- 페이지당 건수 고정 (20건) — 대시보드는 10/20/50 선택 가능
- 모바일 가로 스크롤 미처리

---

## 2. 개선 항목

### 2.1 색상 통일

변동률 색상을 프로젝트 컨벤션에 맞게 수정:

- `text-red-500` → `text-success` (상승, 양수)
- `text-blue-500` → `text-destructive` (하락, 음수)

### 2.2 필터 기능

URL searchParams 기반 서버사이드 필터링 (대시보드 `AlertFilterTabs` 패턴 재활용).

**필터 항목:**

| 필터 | URL 파라미터 | 값 | UI 컴포넌트 |
|------|------------|-----|------------|
| 유형 | `?type=upper` / `?type=lower` | upper / lower / (없으면 전체) | 탭 (전체 / 상승 / 하락) |
| 종목 | `?stock=삼성전자` | 종목명 텍스트 | 검색 Input (debounce 300ms) |

날짜 필터는 구현 복잡도 대비 사용 빈도가 낮으므로 이번에는 제외. 이력은 기본적으로 최신순 정렬이라 대부분 최근 이력을 확인하는 패턴.

**필터 동작:**
- 필터 변경 시 page를 1로 초기화
- 기존 필터 파라미터는 유지 (대시보드와 동일 패턴)

### 2.3 페이지당 건수 선택

대시보드의 `AlertPagination` 패턴 재활용:

- 기본값: 20건
- 선택 가능: 10 / 20 / 50
- URL 파라미터: `?size=20`
- 변경 시 page 초기화

### 2.4 UI/레이아웃 개선

**테이블 개선:**
- 모바일 가로 스크롤 (`overflow-x-auto`)
- 종목명 컬럼에 종목코드도 표시 (현재는 종목명만)

---

## 3. 페이지 레이아웃

```
┌──────────────────────────────────────────────────┐
│  알림 이력                           [N건] Badge  │
├──────────────────────────────────────────────────┤
│                                                  │
│  [전체 (N)]  [상승 (N)]  [하락 (N)]    ← 유형 탭  │
│                                                  │
│  [🔍 종목명 검색]                      ← 검색     │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 종목    기준가  발동가  변동률  유형  ...  │    │
│  │ ─────────────────────────────────────── │    │
│  │ 삼성전자  70,000  77,000  +10%  상승  ... │    │
│  │ SK하이닉스 ...                          │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  페이지당 [20 ▾] 개          < 이전 1 2 3 다음 >  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4. URL 파라미터 구조

```
/history?type=upper&stock=삼성&page=2&size=20
```

| 파라미터 | 기본값 | 설명 |
|---------|-------|------|
| `type` | (없음 = 전체) | upper / lower |
| `stock` | (없음 = 전체) | 종목명 검색어 |
| `page` | 1 | 페이지 번호 |
| `size` | 20 | 페이지당 건수 (10/20/50) |

---

## 5. 서버 쿼리 변경

현재:

```ts
const where = { userId };
```

개선 후:

```ts
const where = {
  userId,
  ...(type === "upper" || type === "lower" ? { thresholdType: type } : {}),
  ...(stock ? {
    alert: {
      stockName: { contains: stock, mode: "insensitive" },
    },
  } : {}),
};
```

유형별 건수 집계 (탭에 표시):

```ts
const typeCounts = await prisma.alertLog.groupBy({
  by: ["thresholdType"],
  where: { userId },
  _count: true,
});
```

---

## 6. 컴포넌트 구조

### 신규 컴포넌트

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| HistoryFilterTabs | src/components/stock/history-filter-tabs.tsx | 유형 필터 탭 (전체/상승/하락) |
| HistorySearch | src/components/stock/history-search.tsx | 종목명 검색 Input |

### 수정 컴포넌트

| 컴포넌트 | 파일 | 변경 내용 |
|---------|------|----------|
| FullAlertHistory | src/components/stock/full-alert-history.tsx | 색상 통일, 종목코드 추가, overflow-x-auto |
| HistoryPagination | src/components/stock/history-pagination.tsx | 페이지당 건수 Select 추가 (AlertPagination 패턴) |
| HistoryPage | src/app/(auth)/history/page.tsx | 필터/검색/size searchParams 처리, 쿼리 수정 |

### 재활용 패턴

- `HistoryFilterTabs` → `AlertFilterTabs`와 동일 구조 (Tabs + URL searchParams), 경로만 `/history`로 변경
- `HistorySearch` → `AlertSearch`와 동일 구조 (debounce Input + URL searchParams), 경로와 placeholder만 변경
- `HistoryPagination` → `AlertPagination`의 Select + Pagination 조합을 재활용

---

## 7. 기존 대시보드 패턴과의 일관성

| 기능 | 대시보드 | 알림 이력 (개선 후) |
|------|---------|------------------|
| 필터 탭 | 전체/활성/비활성 | 전체/상승/하락 |
| 검색 | 종목명/종목코드 | 종목명 |
| 페이지당 건수 | 10/20/50 (기본 10) | 10/20/50 (기본 20) |
| 페이지네이션 | 이전/다음 + 번호 | 동일 |
| URL 관리 | searchParams 기반 | 동일 |
| 빈 상태 | Empty State 컴포넌트 | 기존 유지 |
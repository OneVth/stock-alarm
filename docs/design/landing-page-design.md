# 랜딩 페이지 설계

---

## 1. 개요

서비스 소개 + 로그인 유도를 위한 랜딩 페이지.

**경로:** `/`
**레퍼런스:** https://stockalarm.io/ (후기 섹션 제외)

**로그인 상태 동작:** 로그인된 사용자는 `/dashboard`로 자동 리다이렉트.

---

## 2. 페이지 구성

5개 영역: Header → Hero → 기능 소개 → 하단 CTA → Footer

```
┌─────────────────────────────────────────────────────┐
│  [Header]  Stock Alarm                    [로그인]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  매일 확인하지 않아도           ┌─────────────────┐  │
│  괜찮아요                      │                 │  │
│                                │  [스마트폰 목업] │  │
│  종목을 등록하고 알림 조건만     │                 │  │
│  설정하면, 나머지는             │                 │  │
│  Stock Alarm이 알아서           │                 │  │
│                                │                 │  │
│  [시작하기]                     └─────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ BellPlus  │  │CalendarChk│  │ MailCheck │       │
│  │ 간편한    │  │ 매일      │  │ 이메일    │       │
│  │ 알림 설정 │  │ 자동 체크 │  │ 알림     │       │
│  │ 설명...   │  │ 설명...   │  │ 설명...  │       │
│  └───────────┘  └───────────┘  └───────────┘       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│             [대시보드 스크린샷 (전체 너비)]            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                © 2026 Stock Alarm                    │
└─────────────────────────────────────────────────────┘
```

---

## 3. 섹션 상세

### 3.1 Header

기존 `Header` 컴포넌트 수정.

- 좌측: "Stock Alarm" 로고 텍스트
- 우측: "로그인" 버튼 → `/login`으로 이동
- sticky 헤더 (`sticky top-0`)
- container 너비 제한 (`max-w-5xl mx-auto`)

### 3.2 Hero 섹션

2컬럼 레이아웃: 좌측 텍스트+CTA / 우측 스마트폰 목업.
모바일에서는 세로 배치 (텍스트 → 목업).

**레이아웃:** `grid grid-cols-1 md:grid-cols-2 gap-8 items-center`

**좌측 — 텍스트 + CTA:**

캐치프레이즈:
```
매일 확인하지 않아도 괜찮아요
```
- `text-2xl md:text-4xl font-bold`
- 좌측 정렬 (중앙 정렬 아님)

설명 문구:
```
종목을 등록하고 알림 조건만 설정하면,
나머지는 Stock Alarm이 알아서
```
- `text-lg text-muted-foreground`

CTA 버튼:
- "시작하기" → `/login`으로 링크
- `size="lg"`

**우측 — 스마트폰 목업:**

- 이미지 파일: `public/images/Isolated_Smartphone_Mockup.png` (업로드된 목업 이미지)
- `next/image` Image 컴포넌트 사용
- 적절한 크기 제한 (예: `max-w-md mx-auto`)

### 3.3 기능 소개 섹션

3개 카드, 가로 정렬 (`grid grid-cols-1 md:grid-cols-3 gap-6`).

| # | 아이콘 | 제목 | 설명 |
|---|--------|------|------|
| 1 | `BellPlus` | 간편한 알림 설정 | 종목을 등록하고 상승/하락 임계값만 설정하면 준비 끝 |
| 2 | `CalendarCheck` | 매일 자동 체크 | 매일 시장을 확인해서 설정한 조건에 도달했는지 체크합니다 |
| 3 | `MailCheck` | 이메일 알림 | 조건 충족 시 이메일로 알려드립니다 |

**카드 레이아웃:**
- 아이콘: 상단 중앙, `size-8` 정도, `text-primary`
- 제목: 아이콘 아래, `text-lg font-semibold`, 중앙 정렬
- 설명: 제목 아래, `text-sm text-muted-foreground`, 중앙 정렬
- Card 컴포넌트 사용 또는 단순 div

### 3.4 대시보드 스크린샷 섹션

기능 소개 아래에 대시보드 전체 화면 스크린샷 배치.

- 이미지 파일: `public/images/dashboard-screenshot.png`
- 전체 너비, `max-w-5xl mx-auto`
- `rounded-lg shadow-lg` 스타일링

### 3.5 Footer

```
© 2026 Stock Alarm
```

- 중앙 정렬
- `text-sm text-muted-foreground`
- `border-t` 구분선 위에 배치
- 간격: `py-6`

---

## 4. 기술 사항

### 로그인 상태 리다이렉트

서버 컴포넌트에서 `auth()` 호출 후 로그인된 사용자는 `/dashboard`로 리다이렉트:

```ts
const session = await auth();
if (session) redirect("/dashboard");
```

### Google 로그인 버튼

로그인 페이지(`/login`)의 기존 패턴 재활용:

```tsx
<form action={async () => {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}}>
  <Button type="submit" className="gap-2">
    <GoogleIcon className="h-5 w-5" />
    Google로 시작하기
  </Button>
</form>
```

### 대시보드 스크린샷

- 파일 위치: `public/images/dashboard-screenshot.png`
- 수동으로 캡처하여 추가해야 함
- 구현 시 이미지가 없으면 placeholder로 대체
- `next/image`의 `Image` 컴포넌트 사용 권장

### 반응형

- Hero 캐치프레이즈: 모바일 `text-2xl`, 데스크톱 `md:text-4xl`
- 기능 카드: 모바일 1열, 데스크톱 3열 (`grid-cols-1 md:grid-cols-3`)
- 대시보드 스크린샷: `max-w-4xl mx-auto` 등으로 너비 제한

---

## 5. 컴포넌트 구조

| 파일 | 유형 | 설명 |
|------|------|------|
| src/app/page.tsx | Server + Client 혼합 | 랜딩 페이지 전체 (auth 체크 + UI) |
| src/components/layout/header.tsx | Client | 로그인 버튼 추가 |

별도 컴포넌트 분리 없이 `page.tsx`에서 직접 구현해도 충분한 크기.
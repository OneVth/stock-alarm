# 설정 모달 리디자인 설계 문서

> 작성일: 2026-04-25 (Session 14 — N+2)
> 상태: 설계 합의 완료, Showcase 프로토타입 진입 전
> 관련 문서: `docs/backlog/settings-features.md`, `docs/design/settings-page-redesign.md`

---

## 1. 배경

Stock Alarm v2의 설정 페이지는 현재 `/settings` 라우트에 단일 페이지(프로필 카드 + 계정 섹션 카드)로 구현되어 있다. Session 11 v2 리디자인으로 정착됐다. Phase 1 기능 확장(로그아웃, 버전 표시, CSV 내보내기, 알림 이력 초기화) 진입 시점에 섹션 수가 2개 → 4개로 늘어나면서 단일 스크롤 페이지의 한계가 가시화됐다.

LiveWiki(누구나 유튜브 정리 SaaS) 등 동시대 SaaS 레퍼런스 분석 결과 **모달 + 좌측 탭 네비** 패턴이 다음 이점이 있어 도입한다:

- **컨텍스트 유지**: 대시보드 작업 중 설정만 잠깐 변경하고 복귀하는 흐름이 자연스러움
- **섹션 확장성**: Phase 2+에서 5~6탭으로 확장 시 좌측 탭 추가만으로 수용
- **fintech/SaaS 표준 메타포**: Coinbase, Toss, LiveWiki 등 다수 서비스가 동일 패턴

---

## 2. 목표 / 비목표

### 목표
- 설정 진입 시 페이지 이동 없이 모달로 표시
- 좌측 탭 네비 + 우측 컨텐츠 2단 구조 (LiveWiki 패턴 참조)
- 데스크톱 Dialog + 모바일 Sheet 자동 분기
- Phase 1 4탭 (프로필 / 데이터 & 개인정보 / 앱 정보 / 계정) 컨텐츠 수용
- Phase 2+ 확장(알림 탭 등) 시 추가만으로 가능한 구조

### 비목표
- URL 라우팅 (해시/쿼리 기반 탭 상태 동기화) — 가족 규모에서 딥링크 공유 시나리오 없음
- Next.js Intercepting Routes — 복잡도 대비 이득 없음
- 프로필 탭 신기능 추가 (사진 변경, 소개 필드 등) — Phase 1 범위 외, 현행 유지

---

## 3. 결정 사항 요약

| 축 | 결정 |
|---|---|
| 표시 방식 | 모달 |
| 레이아웃 | 좌측 탭 네비 + 우측 컨텐츠 |
| URL 전략 | 순수 모달 (URL 변경 없음) |
| 모바일 대응 | 데스크톱 Dialog + 모바일 Sheet 분기 |
| 모달 크기 (데스크톱) | `max-w-3xl` × `max-h-[80vh]` |
| 좌측 탭 너비 | `w-48` (192px) |
| 사이드바 진입점 | footer 드롭다운만. 네비 본체 "설정" 제거 |
| 로그아웃 진입점 | 드롭다운(빠른 접근) + 계정 탭(인라인) |
| 데이터 페칭 | `useSession()` 즉시 표시 + 모달 mount 시 `/api/user/profile` fetch로 갱신 |
| `/settings` 라우트 | 제거 |

---

## 4. 탭 구조 (Phase 1)

총 4탭. 좌측 네비 순서:

1. **프로필** — 사용자 정보 표시 및 편집
2. **데이터 & 개인정보** — 사용자 데이터 처리 액션
3. **앱 정보** — 서비스 메타 정보
4. **계정** — 인증 및 위험 액션

순서 근거:
- 프로필은 가장 자주 보는 항목 (현재도 그러함)
- 계정은 위험 액션(탈퇴) 포함이라 맨 아래
- 데이터 vs 앱 정보는 사용 빈도(데이터 > 앱 정보) 기준

---

## 5. 탭별 상세 컨텐츠

### 5.1 프로필 탭

**현행 유지.** `settings-client.tsx`의 프로필 카드 컨텐츠를 모달 프로필 탭으로 그대로 이식한다.

**컨텐츠**:
- **이미지** — `size-16` Avatar, 표시만 (변경 기능 없음)
- **이메일** — 읽기 전용 텍스트
- **닉네임** — 인라인 편집 (수정 버튼 → 인풋 + 저장/취소 토글)

**현행 동작 유지**:
- 닉네임 변경 → `PATCH /api/user/profile` → toast + `router.refresh()`
- 변경 없으면 저장 버튼 disabled

**Phase 1 신규 사항**: 없음 (현행 그대로 이식)

### 5.2 데이터 & 개인정보 탭

Phase 1에서 신규 도입.

**컨텐츠**:

#### 알림 이력 CSV 내보내기
- 라벨: `알림 이력 CSV 내보내기`
- 설명: `발송된 알림 이력을 CSV 파일로 다운로드합니다`
- 액션: 우측 버튼 `다운로드` → `GET /api/user/export/alert-logs`
- 파일명: `stock-alarm-history-{YYYY-MM-DD}.csv`
- 컬럼: 발송일시, 종목명, 종목코드, 발송 시점 가격, 등록가, 변동률(%), 임계값(%)
- 인코딩: UTF-8 with BOM (Excel 호환)

#### 알림 이력 초기화 (파괴적 액션)
- 라벨: `알림 이력 초기화` (destructive 색상)
- 설명: `모든 알림 발송 이력을 영구적으로 삭제합니다. 등록된 알림은 유지됩니다.`
- 액션: 우측 버튼 `초기화` → 확인 Dialog 중첩 → `DELETE /api/user/alert-logs`
- 확인 Dialog 문구: `모든 알림 발송 이력이 영구적으로 삭제됩니다. 등록된 알림은 유지됩니다. 계속하시겠습니까?`

**Base UI Dialog 중첩 주의**: 설정 모달 위에 확인 Dialog가 떠야 함. Showcase 단계에서 focus trap 동작 검증 필수.

### 5.3 앱 정보 탭

Phase 1에서 신규 도입.

**컨텐츠**:

#### 버전
- 라벨: `버전`
- 값: `v{NEXT_PUBLIC_APP_VERSION}` (예: `v0.2.1`)
- 정적 텍스트, 우측 정렬
- 환경변수 노출: `next.config.ts`에서 `package.json`의 `version` 읽어 `NEXT_PUBLIC_APP_VERSION`으로 expose

#### 개인정보 처리방침
- 라벨: `개인정보 처리방침`
- 설명: 없음 (단일 행)
- 액션: 우측에 외부 링크 아이콘 + 텍스트 — 클릭 시 `/privacy` 페이지로 이동
- 모달 동작: 페이지 이동 시 모달 닫힘
- 새 탭 vs 같은 탭 정책 → **Showcase 단계에서 확정**

**Phase 2+ 추가 예정**: 서비스 약관 (`/terms` 페이지 작성 후)

### 5.4 계정 탭

기존 `settings-client.tsx`의 계정 섹션을 이식하되 로그아웃 추가.

**컨텐츠**:

#### 연결된 계정 + 로그아웃 (LiveWiki 패턴)
- 좌측: Google 아이콘 + 이메일
- 우측: `로그아웃` 버튼 (outline)
- 액션: `signOut({ redirectTo: "/login" })`

#### 계정 탈퇴 (파괴적 액션, 현행 유지)
- 라벨: `계정 탈퇴`
- 설명: `계정과 데이터가 전부 삭제됩니다.`
- 액션: 우측 버튼 `탈퇴` (destructive) → 기존 확인 Dialog → `DELETE /api/user/account`

---

## 6. 컴포넌트 구조

```
src/components/settings/
├── index.ts
├── settings-modal.tsx              # 모달 shell (Dialog/Sheet 분기 + 탭 네비)
├── settings-tabs.ts                # 탭 정의 (id, label, icon)
├── tabs/
│   ├── profile-tab.tsx
│   ├── data-tab.tsx
│   ├── app-info-tab.tsx
│   └── account-tab.tsx
└── hooks/
    └── use-settings-modal.ts       # 전역 open/close 상태
```

### settings-modal.tsx 골격

```tsx
"use client";

const isMobile = useMediaQuery("(max-width: 767px)");
const Container = isMobile ? Sheet : Dialog;

return (
  <Container open={open} onOpenChange={onOpenChange}>
    <ContainerContent className={isMobile ? "h-[90vh]" : "max-w-3xl max-h-[80vh] p-0"}>
      <div className="flex h-full">
        <nav className="w-48 border-r p-4 ...">
          {/* 탭 네비 */}
        </nav>
        <div className="flex-1 overflow-y-auto p-6">
          {/* 활성 탭 컨텐츠 */}
        </div>
      </div>
    </ContainerContent>
  </Container>
);
```

### use-settings-modal.ts

전역 상태로 모달 open/close 관리. 사이드바 footer 드롭다운에서 모달 컴포넌트까지 거리가 있어 prop drilling 비효율.

- **옵션 A**: Context API
- **옵션 B**: zustand 도입 (현재 미사용 라이브러리)
- **옵션 C**: 단순 useState + AppSidebar 내부에 모달 마운트

→ **Showcase 단계에서 확정**. 현재로선 옵션 C가 가장 단순. 다만 사이드바가 mobile sheet 내부에 들어갈 경우 z-index 충돌 우려.

---

## 7. 모바일 대응

### 분기 기준

```tsx
const isMobile = useMediaQuery("(max-width: 767px)");
```

또는 Tailwind `md:` 기반 CSS 분기 (컴포넌트는 동일, 클래스만 다름).

### 데스크톱 (≥ 768px)
- shadcn/ui Dialog
- 중앙 정렬, `max-w-3xl × max-h-[80vh]`
- 좌측 탭 네비 (`w-48`) + 우측 컨텐츠 (가변)

### 모바일 (< 768px)
- shadcn/ui Sheet (하단에서 슬라이드)
- 높이: `h-[90vh]`
- **레이아웃 패턴 후보**:
  - 옵션 1: 상단 가로 탭 + 하단 컨텐츠 (좁은 화면 표준)
  - 옵션 2: 좌측 좁은 네비 (`w-32`) 유지
  - 옵션 3: 탭 선택 → 컨텐츠 풀스크린 + 뒤로가기 (네이티브 앱 패턴)
- → **Showcase 단계에서 시각 결정**

---

## 8. 데이터 페칭 전략

### 즉시 표시 (paint 빠름)
```tsx
const { data: session } = useSession();
// 즉시 사용 가능: session.user.email, image, name
```

### Mount 시 갱신 (최신 데이터)
```tsx
const [user, setUser] = useState(null);

useEffect(() => {
  if (!open) return;
  fetch("/api/user/profile")
    .then(r => r.json())
    .then(setUser);
}, [open]);
```

### 표시 우선순위
- **이메일/이미지**: `session.user`에서 즉시 표시 (변경 빈도 0)
- **닉네임**: `user?.nickname ?? session.user?.name`로 fallback. fetch 완료 시 갱신

### 갱신 시점
- 모달 열림 시 (`open === true`)
- 닉네임 변경 PATCH 응답 직후 (현재 동작 유지: `router.refresh()` 또는 직접 `setUser`)

---

## 9. 진입 동선 변경

### 변경 전
- 사이드바 네비 본체 `설정` 메뉴 → `/settings` 페이지 이동
- 사이드바 footer 드롭다운 `설정` 메뉴 → `/settings` 페이지 이동

### 변경 후
- 사이드바 네비 본체 `설정` 메뉴 → **제거**
- 사이드바 footer 드롭다운 `설정` 메뉴 → **모달 오픈**

### 코드 변경 지점
- `app-sidebar.tsx` `baseNavItems`에서 `{ href: "/settings", ... }` 제거 (line 66)
- footer 드롭다운 onClick: `router.push("/settings")` → `setSettingsOpen(true)` (line 226)
- `src/app/(auth)/settings/` 디렉토리 삭제

---

## 10. Showcase 프로토타입 범위

### 위치
`src/app/showcase/settings-modal/page.tsx`

### 구현 범위
- 모달 shell (Dialog/Sheet 분기) — 실제 작동
- 4탭 모두 더미 데이터로 시각 구현
- 데스크톱 + 모바일 둘 다 검증 가능 (DevTools 모바일 에뮬레이션)
- 탭 전환 동작 (URL 변경 없음, useState 기반)
- 확인 Dialog 중첩 1건 동작 (알림 이력 초기화)

### 제외 범위
- 실제 API 호출 (CSV 다운로드, 이력 삭제, 닉네임 변경 모두 `console.log` stub)
- 인증/세션 (더미 user 객체 사용)
- 환경변수 (`NEXT_PUBLIC_APP_VERSION`은 하드코딩 `"v0.2.1"`)

### 더미 데이터
```ts
const dummyUser = {
  email: "user@example.com",
  nickname: "테스트유저",
  image: null,
};
const dummyVersion = "v0.2.1";
```

### 시각 검증 항목
- 모달 크기/여백 적절성
- 좌측 탭 네비 활성/hover 상태
- 우측 컨텐츠 영역 스크롤 동작
- 모바일에서 자연스러움 (Sheet 분기 + 레이아웃 패턴 결정)
- destructive 액션의 시각 위계 (계정 탈퇴, 알림 이력 초기화)
- 확인 Dialog 중첩 시 focus trap 정상 동작

---

## 11. 구현 단계 (5브랜치)

| # | 브랜치 | 범위 |
|---|---|---|
| 1 | `feat/settings-modal-showcase` | Showcase 프로토타입 (`/showcase/settings-modal`) |
| 2 | `feat/settings-modal-shell` | 실제 모달 shell + 4탭 컨텐츠 (현행 프로필/계정 이식 + 빈 데이터/앱정보 탭). 사이드바 진입점 변경. `/settings` 라우트 제거 |
| 3 | `feat/settings-app-info` | 앱 정보 탭에 버전 + 처리방침 링크 활성화. `next.config.ts`에 env 노출 |
| 4 | `feat/settings-data-section` | 데이터 탭에 CSV 내보내기 + 알림 이력 초기화 활성화. API 라우트 신규 (`GET /api/user/export/alert-logs`, `DELETE /api/user/alert-logs`) |
| 5 | `feat/settings-logout-button` | 계정 탭에 로그아웃 버튼 추가 |

### 머지 순서 주의
2번(shell)이 머지되면 모달 자체는 활성화되지만 데이터/앱 정보 탭이 비어 있음. 빈 탭에 `Phase 2에서 추가 예정` 또는 적절한 placeholder 표시. 짧은 노출 시간(같은 세션 내 3, 4, 5 머지 진행) 가정하면 허용. 사용자가 우려 시 2번을 마지막에 머지하는 옵션도 가능.

---

## 12. 검증 항목 (각 브랜치)

### 1번 (Showcase)
- 데스크톱/모바일 시각 검증
- 4탭 전환 동작
- 확인 Dialog 중첩 동작

### 2번 (Shell + 라우트 변경)
- 사이드바 네비 본체 `설정` 메뉴 제거 확인
- footer 드롭다운 `설정` 클릭 → 모달 오픈
- 프로필 탭 닉네임 편집 동작 (현행 그대로)
- 계정 탭 계정 탈퇴 동작 (현행 그대로)
- `/settings` URL 직접 접근 시 404
- 빈 데이터/앱 정보 탭 placeholder 표시

### 3번 (앱 정보)
- 버전 표시 정확성 (`package.json` 값 일치)
- 처리방침 링크 클릭 → `/privacy` 이동 + 모달 닫힘

### 4번 (데이터)
- CSV 다운로드 — 파일명, 컬럼, BOM 인코딩 확인
- 알림 이력 초기화 → 확인 Dialog → 삭제 → AlertLog 0건 확인 (DB)
- 등록된 Alert는 유지됨 확인

### 5번 (로그아웃)
- 계정 탭 `로그아웃` 버튼 클릭 → 로그인 페이지 이동
- footer 드롭다운 `로그아웃`도 정상 동작 (회귀 없음)

---

## 13. Phase 2+ 확장 고려

이 설계는 Phase 2+ 기능을 자연스럽게 수용해야 함:

- **알림 탭 신설** — 5탭으로 확장. 좌측 네비 순서: 프로필 → **알림** → 데이터 → 앱 정보 → 계정
- **알림 탭 컨텐츠**: 전역 on/off, Vacation, DND, 쿨다운, 기본 임계값, 일일/장 요약 (`settings-features.md` Phase 2 참조)
- **앱 정보에 약관 링크 추가** — `/terms` 페이지 신설 후
- **데이터에 이력 보관 기간** — Select UI 추가

탭 5~6개에서 좌측 네비가 답답해지면 그 시점에 다시 설계 검토. 현재 4탭에선 답답하지 않음.

---

## 14. 미결정 사항 (Showcase 단계에서 확정)

- 모바일 레이아웃 패턴: 상단 가로 탭 vs 좁은 좌측 네비 vs 탭 풀스크린 전환
- 모달 전역 상태 관리: Context API vs prop drilling vs zustand
- 처리방침 링크 클릭 시 새 탭 vs 같은 탭
- 모달 닫기 액션 시 진행 중 닉네임 편집 처리 (비저장 상태에서 닫으면? 경고? 자동 폐기?)

---

## 부록: 관련 결정 출처

- 모달 패턴 결정 — Session 14 (N+2)
- 4탭 구성 — `settings-features.md` 재검토 섹션 (2026-04-16)
- Phase 1 4건 정의 — `settings-features.md` Phase 1
- 5브랜치 분할 — Session 14 결정
- 데이터 페칭 L1+L2 병행 — Session 14 결정
- 진입점 K1 (네비 본체 제거) — Session 14 결정

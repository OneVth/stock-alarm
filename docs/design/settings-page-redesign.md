# 설정 페이지 리디자인 설계

> 기존 설계: `docs/design/settings-page-design.md` (v1, 초기 구현)
> 이 문서: **v2 리디자인** — StyleSeed Coinbase Skin 적용 후 구조 정비

---

## 1. 배경 / 목표

### 배경

- 초기 설계(v1)는 **단일 카드** 구조. 프로필 정보와 계정 삭제가 한 카드에 섞여 있어 섹션 구분이 약함.
- StyleSeed 레퍼런스(`showcase/styleseed-reference-settings`) 도입 후, **섹션 분리 + 메뉴 리스트 항목 스타일**이 이 서비스 톤에 더 맞는다는 판단.
- 추후 **로그아웃 버튼 추가**(현재는 사이드바 드롭다운에만 존재)를 백로그에 두고 있어, 확장 가능한 구조로 재편.

### 목표

1. 단일 카드 → **2개 섹션 카드**로 분리 (프로필 / 계정)
2. 계정 섹션은 **메뉴 리스트 항목** 스타일로 재구성 → 로그아웃 추가 시 자연스럽게 확장
3. 프로필 섹션 레이블을 **상하 스택**으로 바꿔 모던한 settings 톤 구현
4. **기능 추가 없음** — 현재 동작(닉네임 편집, 계정 삭제)만 유지. 로그아웃 추가는 이번 범위 아님.

### 비범위 (이번에 하지 않는 것)

- 로그아웃 버튼 실제 구현 (구조만 준비)
- 이미지 업로드 기능
- 이메일 변경 기능
- 알림 설정 / 쿨다운 / 조용한 시간 등 레퍼런스에 있는 추가 기능들 (백로그)

---

## 2. 결정사항 요약 (Q1-Q6)

| # | 질문 | 결정 |
|---|------|------|
| Q1 | 섹션 분리 구조 | **A — 2섹션** (프로필 + 계정) |
| Q2 | 그라데이션 strip | **B — 스킵** (Coinbase 담백한 톤 우선) |
| Q3 | 레이블 레이아웃 | **B — 상하 스택** (label 위, value 아래) |
| Q4 | 데스크톱 폭 | **A — `max-w-2xl` 유지** (다른 페이지와 일관) |
| Q5 | 계정 섹션 스타일 | **C — 메뉴 리스트 항목** (향후 로그아웃 확장 대비) |
| Q6 | Showcase 프로토타입 | **A — 생략**, 바로 실제 페이지 적용 |

---

## 3. 페이지 구조

### 전체 레이아웃

```
[ 설정 ] (page title, h1)

┌─ 프로필 섹션 ────────────────────────────┐
│ Card (max-w-2xl, border + shadow-card)    │
│                                           │
│  내 프로필 (섹션 제목)                     │
│                                           │
│  [Avatar 64px]                             │
│                                           │
│  이메일                                    │
│  foo@bar.com                               │
│                                           │
│  닉네임                          [수정]    │
│  Onev                                     │
│                                           │
└───────────────────────────────────────────┘

┌─ 계정 섹션 ──────────────────────────────┐
│ SectionLabel (카드 밖, 위쪽 작은 라벨)     │
│ 계정                                      │
│                                           │
│ ┌─ Card ─────────────────────────────┐   │
│ │ [🗑 아이콘박스]  계정 삭제        │   │ ← danger 톤
│ │                 모든 데이터 영구 삭제 │  │
│ └─────────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

### 닉네임 편집 모드

```
  닉네임                            [저장] [취소]
  ┌──────────────────────────┐
  │ Onev                      │
  └──────────────────────────┘
```

### 계정 섹션 — 로그아웃 추가 후 (참고: 이번 구현 대상 아님)

```
 계정
┌────────────────────────────────────────┐
│ [↪ 아이콘박스]  로그아웃               │
│ ──────────────────────────────────     │
│ [🗑 아이콘박스]  계정 삭제             │
│                 모든 데이터 영구 삭제  │
└────────────────────────────────────────┘
```

---

## 4. 섹션별 상세

### 4.1 프로필 섹션

#### 구조

- **Card** 하나 (`max-w-2xl`, 기본 shadow-card)
- CardContent 내부 상단에 섹션 제목 "내 프로필" (text-lg font-semibold)
- 세 항목 세로 스택 (space-y-6 또는 space-y-8로 충분한 리듬):
  - 이미지 (Avatar)
  - 이메일
  - 닉네임 (편집 가능)

#### 레이블 스타일 (상하 스택)

```
label : text-xs text-muted-foreground font-medium (작은 상단 레이블)
value : text-base text-foreground (값)
```

레퍼런스 참고: `text-[10px] uppercase tracking-[0.1em]`도 대안이나, 데스크톱에서는 **소형 소문자 레이블**이 더 읽기 좋음. `text-xs`(12px) 기본 톤 사용.

#### 이미지 항목

- label: "이미지"
- value: Avatar (size-16) — 현재와 동일, 업로드 기능 없음
- 레이블과 Avatar 사이 작은 gap (mt-2)

#### 이메일 항목

- label: "이메일"
- value: 이메일 문자열 (text-base text-foreground)
- 편집 불가 — 별도 액션 없음

#### 닉네임 항목

- label: "닉네임"
- 읽기 모드:
  - label 줄에 우측 정렬된 [수정] 버튼 배치 (variant="outline", size="sm", PencilIcon + "수정")
  - 아래 줄에 현재 닉네임 표시
- 편집 모드:
  - label 줄에 우측 정렬된 [저장] [취소] 버튼
  - 아래 줄에 Input (max-w 제한 없이 충분한 폭)
- Input 폭: `w-full max-w-sm` 정도 (기존 `max-w-48`는 너무 좁아서 개선)

#### 레이블 줄 배치

```
┌─────────────────────────────────────────┐
│ 닉네임                         [수정]   │ ← label (좌) + 액션 버튼 (우)
│                                         │
│ Onev                                    │ ← value
└─────────────────────────────────────────┘
```

`flex items-center justify-between` 패턴.

### 4.2 계정 섹션

#### 구조 (레퍼런스 패턴)

1. **SectionLabel** (카드 밖, 카드 상단) — 작은 UPPERCASE/tracking 스타일 제목 "계정"
2. **Card** — 메뉴 리스트 항목들의 컨테이너. `p-0` + 내부 항목이 padding 가짐
3. 각 항목 = **full-width 버튼** 또는 **AlertDialog/Dialog Trigger**

#### 이번 구현 (계정 삭제만)

카드 안에 항목 1개:

```
[🗑 아이콘박스 (bg-destructive/10, 32px)]  계정 삭제               (text-destructive)
                                           모든 데이터 영구 삭제    (text-xs muted)
```

- 클릭 영역: 카드 내부 전체 너비 버튼
- 호버: `hover:bg-destructive/5` (빨간 톤이 살짝 비침)
- 최소 높이: 44px (터치 타겟)

#### 추후 로그아웃 추가 시 (구조만 준비, 이번 범위 아님)

카드 안에 항목 2개 + Separator:

```
[↪ 아이콘박스 (bg-muted/60)]  로그아웃
──────── Separator ──────────
[🗑 아이콘박스 (bg-destructive/10)]  계정 삭제
                                    모든 데이터 영구 삭제
```

이번 구현에서는 로그아웃을 **추가하지 않지만**, 구조가 확장 가능하도록 짜둠:
- 카드 안에 `<Separator />` 끼워넣는 패턴 익숙화
- 공통 메뉴 항목 컴포넌트(내부 헬퍼)로 분리하면 나중에 편함

### 4.3 SectionLabel 스타일 (데스크톱 버전)

레퍼런스는 `text-[10px] uppercase tracking-[0.1em]` — 모바일 소형 화면 기준. 데스크톱에서는 살짝 키워서:

```
text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground
```

위치: 카드 위 `mb-3` 간격.

---

## 5. 상호작용 플로우

### 5.1 닉네임 편집 (기존과 동일)

```
[읽기] → 수정 클릭 → [편집 Input 포커스]
      → 저장 클릭 → API 호출 → 성공 toast → [읽기] 갱신
      → 취소 클릭 → 원래 값 복원 → [읽기]
```

변경 없음. 단, Input 폭을 `max-w-sm`으로 넓혀 가독성 개선.

### 5.2 계정 삭제 (기존과 동일, 단 Trigger 스타일 변경)

```
[메뉴 항목 클릭] → Dialog 열림 → 삭제 확인 → API 호출 → signOut
                               → 취소 → Dialog 닫힘
```

**중요: Dialog 컴포넌트 유지.** 레퍼런스는 `AlertDialog`를 쓰지만, 이 프로젝트는 과거 `AlertDialog`의 **backdrop click 재오픈 버그** 때문에 `Dialog`로 교체한 이력이 있음 (stock detail page). 설정 페이지도 현재 `Dialog`를 사용 중이므로 **그대로 유지**.

`AlertDialogTrigger` 대신 일반 `button`에 `onClick={() => setDialogOpen(true)}` 유지.

---

## 6. 스타일 가이드

### 6.1 토큰 사용

| 용도 | 토큰 |
|---|---|
| 카드 배경 | `bg-card` |
| 일반 텍스트 | `text-foreground` |
| 보조 텍스트 / 레이블 | `text-muted-foreground` |
| 위험(삭제) 톤 | `text-destructive`, `bg-destructive/10`, `hover:bg-destructive/5` |
| 구분선 | `<Separator />` 또는 `border-border` |

**주의: 가격 토큰(`--price-up/down`)은 절대 쓰지 말 것.** 이 페이지는 가격 맥락이 아니므로 `text-destructive`가 올바른 선택 (위험 액션 의미).

### 6.2 간격 / 정렬

- 섹션 간: `space-y-6` (24px)
- 프로필 카드 내부 항목 간: `space-y-6` 또는 `space-y-8`
- 카드 padding: 기존 `px-12 pt-12 pb-8`은 과함 → `p-6` 또는 `p-8`로 조정 (다른 페이지 카드와 일관성)
- 페이지 최대 폭: `max-w-2xl`
- 페이지 상단 여백: 기존 유지

### 6.3 터치 타겟

- 계정 섹션 메뉴 버튼: `min-h-[44px]` 필수
- 닉네임 수정 버튼 (`size="sm"`): 기본 36px이지만 내부 padding으로 hit area 확보

### 6.4 아이콘

| 위치 | 아이콘 |
|---|---|
| 닉네임 수정 버튼 | `PencilIcon` (size-3.5, 기존 유지) |
| 계정 삭제 메뉴 | `Trash2` (size-4) |
| (향후) 로그아웃 메뉴 | `LogOut` (size-4) |

아이콘 박스:
- 크기: `size-8` (32px)
- 모양: `rounded-xl`
- 배경: 일반은 `bg-muted/60`, danger는 `bg-destructive/10`

---

## 7. 주의사항

### 7.1 Dialog 유지 (AlertDialog 아님)

- 레퍼런스는 `AlertDialog` 사용 중이지만 **사용하지 말 것**
- 과거 stock detail 재설계에서 발견된 **backdrop click 재오픈 버그**로 인해 프로젝트 표준이 `Dialog`로 정착
- 기존 `settings-client.tsx`의 Dialog import + state 관리 그대로 유지

### 7.2 Base UI vs Radix UI

- `shadcn/ui v4`는 Base UI 기반. `asChild` 대신 `render` prop 사용.
- 레퍼런스의 `<AlertDialogTrigger render={...}>` 패턴을 Dialog에 적용하려면 현재 `Dialog` 구현이 `render`를 지원하는지 확인 필요. 기존 패턴(state 기반 제어)이 더 안전.

### 7.3 반응형

- `max-w-2xl`로 고정되어 있어 모바일에서는 자연스럽게 줄어듬
- 닉네임 편집 모드의 버튼 2개(저장/취소)는 모바일에서 **줄바꿈 허용** 또는 한 줄 유지 결정 필요 → `flex-wrap gap-2`로 둘 다 커버 추천

### 7.4 접근성

- 닉네임 label의 `htmlFor="nickname-input"` 유지
- 계정 삭제 버튼은 의미있는 label (aria-label 또는 명시적 텍스트 사용 — 이미 "계정 삭제" 텍스트 있으므로 OK)
- Dialog 포커스 관리는 Base UI Dialog 기본 동작 신뢰

---

## 8. 구현 체크리스트

### 파일

- `src/app/(auth)/settings/settings-client.tsx` 수정 (단일 파일)
- 기존 `page.tsx`는 props 전달만 하므로 변경 없음
- 공통 헬퍼 분리는 선택 — **이번 구현에서는 단일 파일 유지**가 단순함. 로그아웃 추가 시점에 공통화 고려.

### 작업 순서

1. 컨테이너: `max-w-2xl`에 `space-y-6` 주고 2개 카드를 스택
2. 프로필 카드 재작성 (상하 스택 레이블 + 3항목)
3. 계정 섹션 추가 (SectionLabel + 카드 안에 삭제 버튼)
4. Dialog 트리거 연결 (기존 state 그대로)
5. 스타일 토큰 검증 — `text-destructive`만 사용, `text-price-*` 사용 금지
6. `pnpm lint` / `pnpm build` 통과 확인
7. 다크 모드 토글 확인 — 모든 색상 자연스럽게 전환

### 검증 체크리스트

- [ ] 프로필 카드: 이미지 / 이메일 / 닉네임 3항목 상하 스택 표시
- [ ] 닉네임 [수정] 버튼 클릭 → Input + [저장]/[취소] 전환
- [ ] 저장 시 API 호출 성공 → toast + 읽기 모드 복귀
- [ ] 취소 시 원래 값 복원
- [ ] 계정 섹션: SectionLabel "계정" + 카드 안 [계정 삭제] 메뉴 항목 (danger 톤)
- [ ] 계정 삭제 클릭 → Dialog 오픈 → 삭제/취소 정상 동작
- [ ] 다크 모드에서 색상 자연스러움 (bg-destructive/10 너무 튀지 않는지)
- [ ] 모바일 폭(375px)에서도 레이아웃 깨짐 없음
- [ ] 터치 타겟 모든 버튼 44px 이상

---

## 9. 확장성 노트 — 로그아웃 추가 시 참고

이번 구현은 로그아웃 없음. 추후 추가 시:

1. `signOut` 이미 next-auth에서 import 되어 있음 (현재 계정 삭제에서 사용 중) → 재활용
2. 계정 카드 안 삭제 항목 **위쪽**에 로그아웃 버튼 추가 + `<Separator />` 끼워넣기
3. 로그아웃은 Dialog 없이 바로 `signOut({ redirectTo: "/login" })` 호출 (사이드바 드롭다운 로그아웃과 동일 동작)
4. 사이드바 드롭다운의 로그아웃은 **그대로 유지**(중복 OK — 접근성 향상 목적)

---

## 10. 참고

- 기존 v1 설계: `docs/design/settings-page-design.md` (로그아웃 제외 명시 → 이번에 방침 전환)
- 레퍼런스: `src/app/showcase/styleseed-reference-settings/page.tsx`
- StyleSeed 가이드: `CLAUDE-styleseed.md`
- 기존 구현: `src/app/(auth)/settings/settings-client.tsx`
- 설정 기능 백로그: `docs/backlog/settings-features-backlog.md`
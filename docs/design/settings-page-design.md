# 설정 페이지 설계

---

## 1. 개요

사용자 프로필 확인/수정 + 계정 삭제 기능을 제공하는 페이지.

**경로:** `/settings`
**접근:** 사이드바 네비게이션 항목 + 사이드바 프로필 드롭다운 링크 (둘 다)

---

## 2. 설계 결정

### 제외한 항목

| 항목 | 이유 |
|------|------|
| 테마 (모드 + 색상) | 사이드바 프로필 드롭다운에 이미 구현. 중복 불필요 |
| 로그아웃 | 사이드바 프로필 드롭다운에 이미 구현. 중복 불필요 |

### 포함 항목

| 항목 | 이유 |
|------|------|
| 프로필 (Avatar + 이메일 + 닉네임 수정) | 닉네임 수정 UI가 현재 어디에도 없음 |
| 계정 삭제 | 위험한 액션으로 별도 페이지에서 제공하는 것이 적절 |

---

## 3. 정보 계층

```
1순위: 내 정보 (Avatar + 이메일 + 닉네임 수정) — 페이지 상단
2순위: 계정 삭제 — 구분선 아래, 우측 정렬
```

카드 분리 없이, 프로필이 상단을 차지하고 계정 삭제가 구분선 아래에 위치하는 단일 흐름.

---

## 4. 레이아웃

```
┌────────────────────────────────────────┐
│                                        │
│  설정                                  │  ← 페이지 제목
│                                        │
│  [큰 Avatar]                           │
│  user@gmail.com                        │  ← text-muted-foreground
│  닉네임: [ 홍길동           ] [저장]    │  ← Input + Button
│                                        │
│  ────────────────────────────────────  │  ← border-t
│                                        │
│                           [계정 삭제]   │  ← 우측 정렬, destructive
│                                        │
└────────────────────────────────────────┘
```

---

## 5. 프로필 영역 상세

### Avatar

- `user.image`가 있으면 이미지, 없으면 닉네임 이니셜 fallback
- 크기: 기본보다 크게 (예: size="lg" 또는 w-16 h-16)

### 이메일

- `user.email` 텍스트 표시
- `text-sm text-muted-foreground`
- 수정 불가 (Google OAuth 제공)

### 닉네임 수정

- label "닉네임" + Input + 저장 버튼
- Input: 현재 닉네임으로 초기화, `maxLength={20}`
- 저장 버튼: `size="sm"`
- 비활성화 조건: 닉네임이 비어있거나 현재 값과 동일할 때
- 저장 → `PATCH /api/user/profile` 호출
- 성공 → toast("닉네임이 변경되었습니다") + `router.refresh()`
- 실패 → toast.error(에러 메시지)

---

## 6. 계정 삭제 상세

### 버튼

- `variant="destructive"`, 우측 정렬 (`flex justify-end`)
- 구분선(`border-t`) 아래에 위치하여 프로필 영역과 분리

### 삭제 흐름

1. "계정 삭제" 버튼 클릭
2. Dialog 열림:
   - 제목: "계정 삭제"
   - 설명: "정말 삭제하시겠습니까? 모든 알림, 이력, 메모가 영구적으로 삭제되며 복구할 수 없습니다."
   - 버튼: [취소] [삭제] (삭제 버튼 `variant="destructive"`)
3. "삭제" 클릭 → `DELETE /api/user/account` 호출
4. 성공 → `signOut({ redirectTo: "/login" })` 자동 호출
5. 실패 → toast.error

### 데이터 처리

Prisma Cascade 설정으로 `prisma.user.delete()` 호출 시 자동 처리:

| 테이블 | onDelete | 동작 |
|--------|----------|------|
| Alert | Cascade | 삭제됨 |
| AlertLog | Cascade | 삭제됨 |
| UserRole | Cascade | 삭제됨 |
| File | Cascade | 삭제됨 |
| SystemLog | SetNull | userId만 null (로그 보존) |

### Dialog 컴포넌트

`Dialog` 사용 (`AlertDialog` 아님) — backdrop dismiss 지원.

---

## 7. API

### PATCH /api/user/profile

닉네임 수정.

```
요청: { nickname: string }
응답 200: { id, email, nickname }
에러 400: { error: "닉네임은 1~20자로 입력해주세요" }
에러 401: { error: "Unauthorized" }
```

### DELETE /api/user/account

계정 삭제.

```
응답 200: { success: true }
에러 401: { error: "Unauthorized" }
```

---

## 8. 네비게이션

### 사이드바 네비게이션

baseNavItems에 "설정" 추가:

```ts
{ href: "/settings", label: "설정", icon: SettingsIcon }
```

### 프로필 드롭다운

사이드바 프로필 드롭다운에 "설정" 링크 추가 (테마 서브메뉴 위):

```tsx
<DropdownMenuItem onClick={() => router.push("/settings")}>
  <SettingsIcon />
  설정
</DropdownMenuItem>
```

---

## 9. 컴포넌트 구조

| 파일 | 유형 | 설명 |
|------|------|------|
| src/app/(auth)/settings/page.tsx | Server | 사용자 정보 조회 → 클라이언트에 전달 |
| src/app/(auth)/settings/settings-client.tsx | Client | 프로필 + 계정 삭제 UI |
| src/app/api/user/profile/route.ts | API | PATCH — 닉네임 수정 |
| src/app/api/user/account/route.ts | API | DELETE — 계정 삭제 |
| src/components/layout/app-sidebar.tsx | 수정 | 네비게이션 + 드롭다운에 설정 링크 |
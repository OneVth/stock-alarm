# CLAUDE.md - Stock Alarm v2

> Claude Code가 참조하는 프로젝트 가이드 문서

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Stock Alarm v2 |
| 설명 | 주식 가격 알림 서비스 (등록가 대비 ±N% 도달 시 이메일 발송) |
| 도메인 | stockalarm.co.kr |
| 저장소 | https://github.com/OneVth/stock-alarm |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14+ (App Router) |
| 언어 | TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| 테마 | next-themes |
| 에디터 | Tiptap |
| 차트 | Recharts |
| DB | PostgreSQL + Prisma |
| 인증 | NextAuth.js (Google OAuth) |
| 배포 | 라즈베리파이 (PM2 + Nginx) / AWS Lightsail |

---

## Git 전략

### Git 작업 규칙

| 규칙 | 설명 |
|------|------|
| commit/push 수동 | **commit과 push는 항상 사용자가 수동으로 진행한다** |
| Claude Code 역할 | 코드 작성만 담당, git 명령어 직접 실행하지 않음 |
| 커밋 메시지 | 제안 가능, 실행은 사용자가 함 |

### 브랜치 구조 (Git Flow)

```
main           ← 프로덕션
develop        ← 개발 메인
feature/*      ← 기능 개발
release/*      ← 릴리즈 준비
hotfix/*       ← 긴급 수정
legacy/flask   ← 기존 Flask 코드 보존 (읽기 전용)
```

### 작업 흐름

```
1. develop에서 feature 브랜치 생성
   git checkout develop
   git checkout -b feature/기능명

2. 기능 개발 (Claude Code가 코드 작성)

3. 사용자가 수동으로 커밋
   git add .
   git commit -m "feat: 기능 설명"

4. 사용자가 수동으로 develop에 머지
   git checkout develop
   git merge feature/기능명
   git push origin develop

5. (선택) feature 브랜치 삭제
   git branch -d feature/기능명
```

### 커밋 컨벤션 (Conventional Commits)

| 타입 | 용도 | 예시 |
|------|------|------|
| feat | 새 기능 | `feat: add google oauth login` |
| fix | 버그 수정 | `fix: resolve chart rendering issue` |
| docs | 문서 수정 | `docs: update README` |
| style | 포맷팅 | `style: format code with prettier` |
| refactor | 리팩토링 | `refactor: extract email service` |
| test | 테스트 | `test: add alert api tests` |
| chore | 빌드/설정 | `chore: install tiptap dependencies` |

### 커밋 단위

**기능 단위로 커밋한다.** "이 커밋을 revert하면 하나의 독립된 기능이 깨끗하게 빠진다"가 기준이다.

| 단위 | 적합성 | 이유 |
|------|--------|------|
| 함수 단위 | ❌ 너무 작음 | 개별 커밋만 봐서는 뭘 완성한 건지 알 수 없음 |
| 기능 전체 | ❌ 너무 큼 | 되돌릴 지점이 없고, 오래 커밋 없이 작업하게 됨 |
| 기능 단위 | ✅ 적절 | 여러 파일이 모여 하나의 완결된 기능을 이루는 단위 |

**커밋 예시:**

```
feat: add tiptap editor component
feat: add tiptap toolbar with formatting buttons
feat: add tiptap editor section to showcase
chore: install tiptap dependencies
test: add tiptap editor unit tests
```

**테스트 커밋 정책:**
- 기능 커밋에 테스트를 함께 포함하거나, 바로 다음 커밋으로 분리
- 테스트 없는 기능 커밋이 여러 개 쌓인 후 테스트를 몰아서 넣지 않음

---

## 폴더 구조

### 전체 구조

```
src/
├── app/                          # App Router
│   ├── (public)/                 # 비로그인 접근
│   ├── (auth)/                   # 로그인 필수
│   ├── (admin)/                  # admin 역할 필수
│   ├── showcase/                 # 개발 환경 전용
│   └── api/                      # API Routes
│
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── layout/                   # 레이아웃 (header, sidebar, footer)
│   ├── editor/                   # Tiptap 에디터
│   ├── dashboard/                # 대시보드 관련
│   ├── stock/                    # 종목 관련
│   └── admin/                    # 관리자 관련
│
├── lib/
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── auth.ts                   # NextAuth 설정
│   ├── utils.ts                  # 유틸리티
│   └── validations.ts            # Zod 스키마
│
├── services/
│   ├── stock.ts                  # 주가 조회
│   ├── mail.ts                   # 이메일 발송
│   └── llm.ts                    # LLM 코멘트
│
├── hooks/                        # 커스텀 훅
│
└── types/                        # 타입 정의
```

### 에디터 폴더 구조

```
src/components/editor/
├── index.ts                      # 공개 API 내보내기
├── tiptap-editor.tsx             # 메인 에디터 컴포넌트
├── tiptap-viewer.tsx             # 읽기 전용 뷰어
│
├── config/
│   ├── editor-config.ts          # 에디터 기본 설정 (옵션, 기본값)
│   └── extensions.ts             # 확장 조합 설정
│
├── extensions/
│   ├── index.ts                  # 확장 내보내기
│   ├── link.ts                   # 링크 확장 (커스텀 설정)
│   ├── placeholder.ts            # 플레이스홀더 확장
│   └── ...                       # 추후 확장 (image, mention 등)
│
├── toolbar/
│   ├── toolbar.tsx               # 툴바 메인
│   ├── toolbar-button.tsx        # 툴바 버튼 컴포넌트
│   └── link-popover.tsx          # 링크 입력 팝오버
│
├── hooks/
│   ├── use-editor.ts             # 에디터 인스턴스 훅
│   └── use-editor-state.ts       # 에디터 상태 관리 훅
│
└── utils/
    ├── content.ts                # JSON ↔ 텍스트 변환, 미리보기 추출
    └── validation.ts             # 내용 검증 (최대 길이 등)
```

### 새 Tiptap 확장 추가 시

1. `extensions/` 폴더에 파일 생성 (예: `image.ts`)
2. `extensions/index.ts`에 내보내기 추가
3. `config/extensions.ts`에 확장 조합 추가
4. 필요시 `toolbar/`에 버튼 컴포넌트 추가

---

## 코드 컨벤션

### 파일 네이밍

| 유형 | 네이밍 | 예시 |
|------|--------|------|
| 컴포넌트 | kebab-case.tsx | `tiptap-editor.tsx` |
| 훅 | use-xxx.ts | `use-editor.ts` |
| 유틸리티 | kebab-case.ts | `content.ts` |
| 타입 | kebab-case.ts | `editor-types.ts` |

### 컴포넌트 구조

```tsx
// 1. imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. types
interface Props {
  content: string;
  onChange: (value: string) => void;
}

// 3. component
export function TiptapEditor({ content, onChange }: Props) {
  // hooks
  // state
  // handlers
  // render
}
```

### Import 순서

```tsx
// 1. React/Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. 외부 라이브러리
import { useEditor } from "@tiptap/react";

// 3. 내부 컴포넌트 (절대 경로)
import { Button } from "@/components/ui/button";

// 4. 상대 경로
import { useEditorState } from "./hooks/use-editor-state";

// 5. 타입
import type { EditorContent } from "@/types/editor";
```

### Docstring (JSDoc)

#### 작성 기준

| 대상 | 필수 여부 | 이유 |
|------|----------|------|
| 공개 API (export) | ✅ 필수 | 다른 파일에서 사용 |
| 커스텀 훅 | ✅ 필수 | 재사용 가능, 사용법 명시 |
| 유틸리티 함수 | ✅ 필수 | 재사용 가능 |
| 컴포넌트 Props | ✅ 필수 | 인터페이스 명확화 |
| 내부 헬퍼 함수 | ⚠️ 선택 | 복잡한 경우만 |
| 간단한 핸들러 | ❌ 불필요 | 코드로 충분 |

#### 함수/훅 Docstring

```tsx
/**
 * Tiptap JSON 콘텐츠에서 미리보기 텍스트를 추출합니다.
 *
 * @param content - Tiptap JSON 콘텐츠
 * @param maxLength - 최대 길이 (기본값: 30)
 * @returns 텍스트 미리보기 (초과 시 "..." 추가)
 *
 * @example
 * ```ts
 * const preview = extractPreview(content, 30);
 * // "반도체 업황 회복 기대..."
 * ```
 */
export function extractPreview(content: JSONContent, maxLength = 30): string {
  // ...
}
```

#### 커스텀 훅 Docstring

```tsx
/**
 * Tiptap 에디터 인스턴스를 생성하고 관리합니다.
 *
 * @param options - 에디터 옵션
 * @param options.content - 초기 콘텐츠 (JSON)
 * @param options.editable - 편집 가능 여부 (기본값: true)
 * @param options.onUpdate - 콘텐츠 변경 콜백
 * @returns 에디터 인스턴스와 상태
 *
 * @example
 * ```tsx
 * const { editor, isEmpty } = useEditor({
 *   content: initialContent,
 *   onUpdate: (json) => setContent(json),
 * });
 * ```
 */
export function useEditor(options: UseEditorOptions) {
  // ...
}
```

#### 컴포넌트 Props Docstring

```tsx
/**
 * Tiptap 에디터 Props
 */
interface TiptapEditorProps {
  /** 초기 콘텐츠 (Tiptap JSON 형식) */
  content?: JSONContent;
  /** 편집 가능 여부 */
  editable?: boolean;
  /** 빈 상태 플레이스홀더 */
  placeholder?: string;
  /** 콘텐츠 변경 시 호출 */
  onChange?: (content: JSONContent) => void;
  /** 에디터 클래스명 */
  className?: string;
}
```

#### 주석 언어

- **한글 사용**: 한국어 프로젝트이므로 docstring은 한글로 작성
- **@param, @returns**: 영문 태그 유지, 설명은 한글

---

## 주요 설정

### 환경변수 (.env.local)

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://stockalarm.co.kr"
NEXTAUTH_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Admin
ADMIN_EMAILS="admin@gmail.com"

# External APIs
OPENAI_API_KEY="..."
GMAIL_ADDRESS="..."
GMAIL_APP_PASSWORD="..."

# App
NODE_ENV="development"
```

### Showcase 접근 제어

- 개발 환경 (`NODE_ENV=development`): 접근 가능
- 프로덕션 (`NODE_ENV=production`): 404 반환

---

## 참고 문서

| 문서 | 위치 | 내용 |
|------|------|------|
| 아키텍처 설계 | docs/ARCHITECTURE_DESIGN_V2.md | 기술 스택, DB 스키마, API, 보안 |
| UI/UX 설계 | docs/UI_UX_DESIGN.md | 페이지 구조, 레이아웃, 컴포넌트 |
| 코딩 가이드 | CLAUDE.md | 코딩 컨벤션, Git 규칙 |

**⚠️ 설계 문서와 CLAUDE.md 내용이 충돌할 경우, 설계 문서가 우선한다.**

---

## 자주 쓰는 명령어

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# Prisma
pnpm prisma generate    # 타입 생성
pnpm prisma migrate dev # 마이그레이션 (개발)
pnpm prisma studio      # DB GUI

# shadcn/ui 컴포넌트 추가
pnpm dlx shadcn@latest add [컴포넌트명]
```

---

## 자주 하는 실수 방지

### Git

- ❌ main 또는 develop 브랜치에 직접 push하지 않는다
- ❌ Claude Code가 git commit/push를 자동 실행하지 않는다
- ❌ 테스트 없는 기능 커밋이 여러 개 쌓인 후 테스트를 몰아서 넣지 않는다

### Next.js

- ❌ 클라이언트 훅(useState, useEffect 등) 사용 시 `"use client"` 누락
- ❌ Server Component에서 브라우저 API(window, localStorage) 직접 접근
- ❌ 클라이언트 컴포넌트에서 Prisma 직접 호출 — API Route 통해서만 접근
- ❌ 환경변수를 클라이언트에서 사용 시 `NEXT_PUBLIC_` 접두사 누락
- ❌ `async` Server Component에서 훅 사용 — 훅은 클라이언트 컴포넌트에서만

### Tiptap

- ❌ Tiptap 컴포넌트에 `"use client"` 누락 — SSR에서 오류 발생
- ❌ 에디터 콘텐츠를 HTML로 저장 — JSON으로 저장
- ❌ extensions 추가 후 `config/extensions.ts` 업데이트 누락

### shadcn/ui

- ❌ 컴포넌트 설치 없이 import — 먼저 `pnpm dlx shadcn@latest add` 실행
- ❌ 설치된 컴포넌트 파일(`src/components/ui/*`) 직접 수정 — 필요시 래퍼 컴포넌트 생성

### 인증/인가

- ❌ API Route에서 인증 체크 누락
- ❌ 관리자 API에서 역할(admin) 검증 누락
- ❌ 클라이언트에서 세션 정보 신뢰 — 서버에서 항상 재검증

### 타입

- ❌ `any` 타입 사용 — 구체적인 타입 명시
- ❌ 타입 단언(`as`) 남용 — 타입 가드 사용
- ❌ API 응답 타입 미정의 — Zod 스키마로 검증

### 환경변수

- ❌ `.env.local` 파일을 Git에 커밋하지 않는다
- ❌ API 키를 로그, 에러 메시지, 클라이언트 코드에 노출하지 않는다
- ❌ 하드코딩된 시크릿 — 반드시 환경변수 사용
# Stock Alarm - 고도화 설계 문서 (Next.js)

> 작성일: 2026-03-07
> 버전: 2.0
> 상태: 설계 단계

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [DB 스키마](#3-db-스키마)
4. [인증 및 권한](#4-인증-및-권한)
5. [API 설계](#5-api-설계)
6. [비동기 처리](#6-비동기-처리)
7. [기능 목록](#7-기능-목록)
8. [마이그레이션 계획](#8-마이그레이션-계획)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | stock-alarm-v2 |
| 설명 | 주식 가격 알림 서비스 (등록가 대비 ±N% 도달 시 이메일 발송) |
| 도메인 | stockalarm.co.kr |
| 저장소 | https://github.com/OneVth/stock-alarm |
| 브랜치 | develop (개발), main (프로덕션), legacy/flask (기존 코드) |

### 주요 기능

- 종목 등록 및 알림 임계값 설정
- 실시간 가격 모니터링 (cron 기반)
- 이메일 알림 발송 (LLM 코멘트 포함)
- 종목별 메모 작성 (Tiptap 에디터)
- 알림 이력 조회
- 테마 시스템 (Light/Dark, 8개 컬러 팔레트)
- 관리자 대시보드

### 대상 사용자

- 주 사용자: 개인 (가족)
- 관리자: 개발자 본인

---

## 1. 기술 스택

### 1.1 프레임워크

| 항목 | 선택 | 대안 | 선정 이유 |
|------|------|------|----------|
| 프레임워크 | **Next.js 14+ (App Router)** | Flask, Remix | React 생태계, 풀스택 단일 프로젝트, shadcn/ui 호환 |
| 언어 | **TypeScript** | JavaScript | 타입 안전성, 자동완성, 런타임 오류 방지 |

**상세 근거:**
- shadcn/ui 사용을 위해 React 기반 필수
- 프론트/백 분리 대신 풀스택으로 복잡도 감소 (1인 개발)
- App Router로 서버 컴포넌트, 레이아웃 등 최신 기능 활용
- Rebuilding 결정으로 기존 Flask 코드 재사용 고려 불필요

---

### 1.2 데이터베이스

| 항목 | 선택 | 대안 | 선정 이유 |
|------|------|------|----------|
| DBMS | **PostgreSQL** | SQLite, MongoDB | 비동기 병렬 처리 시 동시 쓰기 안정성 |
| ORM | **Prisma** | Drizzle, TypeORM | Next.js 생태계 표준, 타입 안전성, 마이그레이션 내장 |
| 어댑터 | **@prisma/adapter-pg** | - | Prisma v7 필수, PostgreSQL 연결 |

**상세 근거:**
- SQLite 제외: 동시 쓰기 1개 제한, cron 비동기 처리 시 충돌 가능
- MongoDB 제외: 관계형 데이터 구조, ORM 재작성 비용
- Prisma 선택: 스키마 기반 타입 자동 생성, 직관적 문법
- Prisma v7: `prisma-client` generator는 PrismaPg 어댑터 사용 필수

---

### 1.3 인증

| 항목 | 선택 | 대안 | 선정 이유 |
|------|------|------|----------|
| 인증 라이브러리 | **NextAuth.js (Auth.js)** | Clerk, Lucia | Next.js 공식 권장, Google OAuth 지원, 무료 |
| 세션 방식 | **JWT** | Database Session | Stateless, 서버 이전 용이 |

**상세 근거:**
- NextAuth.js: Next.js와 완벽 통합, 다양한 OAuth Provider 지원
- JWT: 별도 세션 저장소 불필요, 라즈베리파이 ↔ AWS 이전 시 호환

---

### 1.4 프론트엔드

| 항목 | 선택 | 대안 | 선정 이유 |
|------|------|------|----------|
| UI 라이브러리 | **shadcn/ui** | MUI, Chakra UI | 컴포넌트 소유권, 커스터마이징 자유, 44개 컴포넌트 |
| 스타일링 | **Tailwind CSS v4** | CSS Modules, Styled Components | shadcn/ui 기본, 유틸리티 기반, 빠른 개발 |
| 테마 | **next-themes** | 직접 구현 | 다크모드 표준 솔루션, 로컬스토리지 자동 관리 |
| 차트 | **Recharts** | Chart.js, Lightweight Charts | React 네이티브, shadcn/ui 차트 컴포넌트 기반 |
| 에디터 | **Tiptap** | Novel, Plate, Quill | Headless, shadcn/ui 호환, 확장성, 종목 메모 기능용 |
| 폰트 | **Pretendard (한글), JetBrains Mono (코드)** | Noto Sans KR | 가독성, 현대적 디자인 |

**Tiptap 에디터 설정:**
- 기능: Bold, Italic, 리스트 (bullet, numbered), 링크
- 저장 형식: JSON (JSONB로 DB 저장)
- 용도: 종목별 메모 작성

---

### 1.5 외부 서비스

| 항목 | 선택 | 용도 |
|------|------|------|
| 주가 데이터 | **Naver Finance API** | 실시간 현재가 조회 |
| 종목 목록 | **KRX 또는 캐시 파일** | 종목 검색 |
| 이메일 | **Gmail SMTP** 또는 **Resend** | 알림 발송 |
| LLM | **OpenAI API (gpt-5-nano)** | 시장 코멘트 생성 |

**이메일 서비스 비교:**

| 항목 | Gmail SMTP | Resend |
|------|-----------|--------|
| 비용 | 무료 | 무료 (월 3000건) |
| 설정 | App Password 필요 | API Key |
| 안정성 | 일일 한도 있음 | 안정적 |
| 권장 | 소규모 | 확장 시 |

---

### 1.6 배포

#### 컨테이너화

| 항목 | 선택 | 대안 | 선정 이유 |
|------|------|------|----------|
| 컨테이너 | **Docker** | 직접 설치 | 환경 일관성, 설치 간소화, 멀티 환경 지원 |
| 오케스트레이션 | **Docker Compose** | Kubernetes | 소규모 서비스에 적합, 단순함 |

**Docker 선정 이유:**
- Windows (개발) → 라즈베리파이 (현재) → AWS (이전 시) 동일 환경
- PostgreSQL, Node.js 등 개별 설치 불필요
- docker-compose.yml로 버전 고정 및 재현 가능
- 라즈베리파이 5 + Docker 공식 지원 (ARM 이미지 호환)

#### 컨테이너 구성

| 서비스 | 이미지 | 용도 |
|--------|--------|------|
| db | postgres:16-alpine | PostgreSQL 데이터베이스 |
| app | 커스텀 빌드 | Next.js 애플리케이션 (프로덕션만) |

**개발 환경:**
- DB만 Docker로 실행
- Next.js는 로컬에서 `pnpm dev` 실행 (HMR 활용)

**프로덕션 환경:**
- 전체 Docker Compose로 실행
- Next.js standalone 빌드

#### 배포 환경

| 항목 | 선택 | 대안 | 선정 이유 |
|------|------|------|----------|
| 현재 배포 | **라즈베리파이** | - | 무료, 기존 인프라, 시스템 cron |
| 이전 옵션 | **AWS Lightsail** | Vercel, EC2 | 시스템 cron 사용, 비용 합리적 ($5/월) |
| 프로세스 관리 | **PM2** (비Docker) / **Docker** (컨테이너) | systemd | Node.js 표준, 재시작 자동화 |
| 리버스 프록시 | **Nginx** | Caddy | 기존 경험, 안정적 |

**양방향 이전 가능:**
- Docker Compose로 동일 환경 구성
- 환경변수(.env)만 변경하면 이전 완료

---

### 1.7 보안

#### 보안 계층 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare (1차 방어)                        │
│  WAF, DDoS 방어, Bot 차단, Rate Limiting, SSL/TLS              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx (2차 방어)                             │
│  보안 헤더, 요청 필터링, 리버스 프록시                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js (3차 방어)                             │
│  Rate Limiting (API), 입력 검증 (Zod), CSRF 보호               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Prisma (4차 방어)                             │
│  SQL Injection 방지 (ORM), Prepared Statements                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Cloudflare WAF (1차 방어)

| 항목 | Free 플랜 | Pro 플랜 ($20/월) |
|------|----------|------------------|
| DDoS 방어 | ✅ 자동 | ✅ 고급 |
| SSL/TLS | ✅ | ✅ |
| Bot 차단 | ✅ 기본 | ✅ 고급 |
| Rate Limiting | ✅ 5개 규칙 | ✅ 무제한 |
| 관리형 WAF 규칙 | ❌ | ✅ |
| OWASP 규칙 | ❌ | ✅ |
| IP 차단 | ✅ 수동 | ✅ |

**선정:** Free 플랜 (현재 규모에 충분)

**상세 근거:**
- 소규모 개인 서비스로 기본 보호만으로 충분
- DDoS, 기본 봇 차단, SSL/TLS 자동 적용
- 필요 시 Pro 플랜으로 업그레이드 가능

#### Nginx 보안 헤더 (2차 방어)

| 헤더 | 값 | 용도 |
|------|-----|------|
| X-Frame-Options | SAMEORIGIN | Clickjacking 방지 |
| X-Content-Type-Options | nosniff | MIME 스니핑 방지 |
| X-XSS-Protection | 1; mode=block | XSS 필터 |
| Referrer-Policy | strict-origin-when-cross-origin | 리퍼러 정보 제한 |
| Content-Security-Policy | default-src 'self' ... | CSP 설정 |
| Strict-Transport-Security | max-age=31536000 | HTTPS 강제 |

#### Next.js 보안 (3차 방어)

| 항목 | 구현 |
|------|------|
| Rate Limiting | API 엔드포인트별 제한 (upstash/ratelimit 또는 직접 구현) |
| 입력 검증 | Zod 스키마 검증 |
| CSRF 보호 | NextAuth.js 기본 제공 |
| 인증/인가 | JWT + 역할 기반 접근 제어 |

#### Prisma 보안 (4차 방어)

| 항목 | 설명 |
|------|------|
| SQL Injection 방지 | ORM 사용으로 자동 방지 |
| Prepared Statements | Prisma 내부적으로 사용 |
| Raw Query 주의 | $queryRaw 사용 시 파라미터 바인딩 필수 |

---

### 1.8 개발 도구

| 항목 | 선택 |
|------|------|
| 패키지 관리 | pnpm |
| 린터 | ESLint |
| 포맷터 | Prettier |
| Git 훅 | Husky + lint-staged |
| 테스트 | Vitest (단위), Playwright (E2E) |
| 개발 방식 | TDD (핵심 로직) |

#### 테스트 전략

| 구분 | 대상 | 테스트 유형 |
|------|------|------------|
| 핵심 로직 | 인증, 알림 트리거, 이메일 발송, 가격 계산 | TDD (단위 테스트) |
| API | 라우트 핸들러 | 통합 테스트 |
| UI | 페이지 흐름 | E2E (주요 시나리오만) |
| 제외 | UI 컴포넌트, 단순 CRUD, 레이아웃 | 수동 테스트 |

---

### 1.9 기술 스택 요약도

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│  React 18 + shadcn/ui + Tailwind CSS v4 + next-themes          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 14+ (App Router)                    │
│  ┌─────────────────┐              ┌─────────────────┐          │
│  │  Server         │              │  API Routes     │          │
│  │  Components     │              │  (/api/*)       │          │
│  └─────────────────┘              └─────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend                                  │
│  NextAuth.js (인증) + Prisma (ORM) + Node.js 비동기             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database                                 │
│                       PostgreSQL                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  Google OAuth │ Naver Finance │ OpenAI │ Gmail/Resend          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 시스템 아키텍처

### 2.1 전체 구조

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   사용자     │────▶│  Cloudflare │────▶│   Nginx     │
│  (브라우저)  │     │  (HTTPS)    │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┴────────────────────┐
                          │                                         │
                          ▼                                         ▼
                   ┌─────────────┐                          ┌─────────────┐
                   │  Next.js    │                          │   Google    │
                   │   (PM2)     │◀────── OAuth 2.0 ───────▶│   OAuth     │
                   └──────┬──────┘                          └─────────────┘
                          │
       ┌──────────────────┼──────────────────┬─────────────────────┐
       │                  │                  │                     │
       ▼                  ▼                  ▼                     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐      ┌─────────────┐
│ PostgreSQL  │    │  Naver API  │    │ Gmail/Resend│      │  OpenAI API │
│  (Prisma)   │    │  (주가)      │    │  (이메일)   │      │  (LLM)      │
└─────────────┘    └─────────────┘    └─────────────┘      └─────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         시스템 Cron (11:35)                            │
│  Node.js 스크립트 ──▶ 비동기 가격 조회 ──▶ 비동기 이메일 발송          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 디렉토리 구조

```
stock-alarm/
├── src/
│   ├── app/                          # App Router
│   │   ├── (public)/                 # 비로그인 접근
│   │   │   ├── page.tsx              # 랜딩 (/)
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                   # 로그인 필수 (레이아웃 공유)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── stock/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── history/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/                  # admin 역할 필수
│   │   │   ├── layout.tsx
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       ├── users/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       └── logs/
│   │   │           └── page.tsx
│   │   │
│   │   ├── showcase/                 # 개발 환경 전용
│   │   │   ├── page.tsx
│   │   │   ├── layout/
│   │   │   ├── navigation/
│   │   │   ├── forms/
│   │   │   ├── display/
│   │   │   ├── feedback/
│   │   │   └── overlay/
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── alerts/
│   │   │   │   ├── route.ts          # GET (목록), POST (생성)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PUT, DELETE
│   │   │   ├── stocks/
│   │   │   │   ├── search/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [code]/
│   │   │   │       └── price/
│   │   │   │           └── route.ts
│   │   │   └── admin/
│   │   │       ├── users/
│   │   │       └── logs/
│   │   │
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── icons/                    # 커스텀 아이콘 (브랜드 등)
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── dashboard/                # 대시보드 관련
│   │   ├── stock/                    # 종목 관련
│   │   └── admin/                    # 관리자 관련
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma 클라이언트
│   │   ├── auth.ts                   # NextAuth 설정 (Node.js Runtime)
│   │   ├── auth.config.ts            # NextAuth 기본 설정 (Edge Runtime)
│   │   ├── auth-callbacks.ts         # 인증 콜백 로직 (테스트 가능)
│   │   ├── auth-middleware.ts        # 미들웨어 로직 (테스트 가능)
│   │   ├── utils.ts                  # 유틸리티
│   │   └── validations.ts            # Zod 스키마
│   │
│   ├── services/
│   │   ├── stock.ts                  # 주가 조회
│   │   ├── mail.ts                   # 이메일 발송
│   │   └── llm.ts                    # LLM 코멘트
│   │
│   ├── hooks/                        # 커스텀 훅
│   │
│   └── types/                        # 타입 정의
│
├── prisma/
│   ├── schema.prisma                 # DB 스키마
│   └── seed.ts                       # 초기 데이터
│
├── tests/
│   ├── unit/                         # 단위 테스트 (Vitest)
│   │   ├── auth.test.ts              # 인증 로직
│   │   ├── alert-trigger.test.ts     # 알림 트리거
│   │   └── price.test.ts             # 가격 계산
│   ├── integration/                  # 통합 테스트 (Vitest)
│   │   └── api/
│   │       ├── alerts.test.ts
│   │       └── users.test.ts
│   ├── e2e/                          # E2E 테스트 (Playwright)
│   │   ├── login.spec.ts
│   │   └── dashboard.spec.ts
│   ├── mocks/                        # Mock 데이터 및 설정
│   │   └── prisma.ts
│   └── setup.ts                      # 테스트 설정
│
├── scripts/
│   └── check-alerts.ts               # Cron 스크립트
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 2.3 요청 흐름

#### 페이지 요청

```
사용자 → Nginx → Next.js → Server Component → Prisma → PostgreSQL
                                  │
                                  ▼
                             HTML 렌더링 → 사용자
```

#### API 요청

```
사용자 (클라이언트) → API Route → Prisma → PostgreSQL
                                    │
                                    ▼
                               JSON 응답 → 사용자
```

#### Cron 알림 흐름

```
시스템 Cron (11:35)
    │
    ▼
Node.js 스크립트 (scripts/check-alerts.ts)
    │
    ├── Prisma: 활성 알림 조회
    │
    ├── [비동기 병렬] Naver API: 가격 조회
    │
    ├── 트리거 조건 체크
    │
    ├── [비동기 병렬] 트리거된 알림 처리:
    │   ├── Naver API: 시장 지수 조회
    │   ├── OpenAI: LLM 코멘트 생성
    │   ├── Gmail/Resend: 이메일 발송
    │   ├── Prisma: AlertLog 생성
    │   └── Prisma: basePrice 갱신
    │
    └── 결과 로깅
```

---

## 3. DB 스키마

### 3.1 ERD

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │      Role       │       │    UserRole     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ email (unique)  │       │ name (unique)   │       │ userId          │
│ nickname        │       │ description     │       │ roleId          │
│ image           │       │ createdAt       │       │ createdAt       │
│ googleId        │       └─────────────────┘       └─────────────────┘
│ createdAt       │                │                        │
│ updatedAt       │                └────────────────────────┘
└─────────────────┘                         │
        │                                   │
        │ 1:N                               │
        ▼                                   │
┌─────────────────┐                         │
│     Alert       │                         │
├─────────────────┤                         │
│ id              │                         │
│ userId          │◀────────────────────────┘
│ stockCode       │
│ stockName       │
│ basePrice       │
│ thresholdUpper  │
│ thresholdLower  │
│ memo (JSONB)    │  ← 종목 메모 (Tiptap JSON)
│ status          │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│   AlertLog      │
├─────────────────┤
│ id              │
│ alertId         │
│ userId          │
│ stockCode       │
│ basePrice       │
│ triggeredPrice  │
│ changeRate      │
│ thresholdType   │
│ emailSent       │
│ createdAt       │
└─────────────────┘


┌─────────────────┐
│      File       │  ← 향후 파일 업로드 대비 (프로필, 메모 이미지 등)
├─────────────────┤
│ id              │
│ userId          │
│ type            │
│ purpose         │
│ filename        │
│ mimeType        │
│ size            │
│ url             │
│ createdAt       │
└─────────────────┘


┌─────────────────┐
│   SystemLog     │  ← 시스템 로그 (에러, 경고, 정보)
├─────────────────┤
│ id              │
│ level           │  ← ERROR, WARN, INFO
│ category        │  ← auth, alert, cron, api, system
│ message         │
│ metadata (JSON) │
│ userId (FK?)    │  ← nullable (User N:1)
│ createdAt       │
└─────────────────┘
```

### 3.2 테이블 상세

#### User

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| email | String | UNIQUE, NOT NULL | 이메일 (Google 계정) |
| nickname | String | NOT NULL | 표시 이름 (기본값: Google name) |
| image | String | NULL | 프로필 이미지 URL (Google) |
| googleId | String | UNIQUE, NULL | Google 고유 ID (첫 로그인 시 설정) |
| createdAt | DateTime | NOT NULL, DEFAULT now | 가입일 |
| updatedAt | DateTime | NOT NULL, 자동갱신 | 수정일 |

#### Role

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| name | String | UNIQUE, NOT NULL | 역할명 (user, admin) |
| description | String | NULL | 역할 설명 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 생성일 |

**초기 데이터:**
- user: 일반 사용자
- admin: 관리자

#### UserRole

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| userId | String | FK(User.id), NOT NULL | 사용자 |
| roleId | String | FK(Role.id), NOT NULL | 역할 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 부여일 |

**제약조건:**
- UNIQUE(userId, roleId) - 중복 부여 방지

#### Alert

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| userId | String | FK(User.id), NOT NULL | 소유자 |
| stockCode | String | NOT NULL | 종목 코드 (예: "005930") |
| stockName | String | NOT NULL | 종목명 (예: "삼성전자") |
| basePrice | Int | NOT NULL | 기준가 (원 단위) |
| thresholdUpper | Float | NULL | 상승 기준 (%) |
| thresholdLower | Float | NULL | 하락 기준 (%, 음수) |
| memo | Json | NULL | 종목 메모 (Tiptap JSON 형식) |
| status | String | NOT NULL, DEFAULT "active" | 상태 (active/inactive) |
| createdAt | DateTime | NOT NULL, DEFAULT now | 등록일 |
| updatedAt | DateTime | NOT NULL, 자동갱신 | 수정일 |

**메모 필드 상세:**
- 저장 형식: Tiptap JSON (확장성 고려)
- 지원 기능: Bold, Italic, 리스트, 링크
- 최대 길이: 5000자 (텍스트 기준)
- 렌더링: Tiptap 에디터로 파싱 후 표시

**인덱스:**
- (userId, status) - 활성 알림 조회
- (userId, stockCode) - 중복 체크

#### AlertLog

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| alertId | String | FK(Alert.id), NULL | 알림 (삭제 시 NULL) |
| userId | String | FK(User.id), NOT NULL | 사용자 |
| stockCode | String | NOT NULL | 종목 코드 |
| basePrice | Int | NOT NULL | 트리거 시점 기준가 |
| triggeredPrice | Int | NOT NULL | 트리거 시점 현재가 |
| changeRate | Float | NOT NULL | 변동률 (%) |
| thresholdType | String | NOT NULL | "upper" 또는 "lower" |
| emailSent | Boolean | NOT NULL, DEFAULT false | 발송 성공 여부 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 발생일 |

**인덱스:**
- (alertId, createdAt DESC) - 종목별 이력
- (userId, createdAt DESC) - 사용자별 이력

#### File

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| userId | String | FK(User.id), NOT NULL | 업로드한 사용자 |
| type | String | NOT NULL | 파일 유형 (image, video, document) |
| purpose | String | NOT NULL | 용도 (profile, memo, etc) |
| filename | String | NOT NULL | 원본 파일명 |
| mimeType | String | NOT NULL | MIME 타입 (image/png 등) |
| size | Int | NOT NULL | 파일 크기 (bytes) |
| url | String | NOT NULL | 스토리지 URL |
| createdAt | DateTime | NOT NULL, DEFAULT now | 업로드일 |

**인덱스:**
- (userId, purpose) - 사용자별 용도별 조회
- (userId, createdAt DESC) - 사용자별 최신순

**비고:**
- 현재 미구현, 향후 확장 대비 스키마만 정의
- 스토리지 서비스: S3, Cloudflare R2, MinIO 중 선택 예정

#### SystemLog

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| id | String | PK, cuid | 고유 식별자 |
| level | Enum | NOT NULL | ERROR, WARN, INFO |
| category | String | NOT NULL | 로그 분류 (auth, alert, cron, api, system) |
| message | String | NOT NULL | 로그 메시지 |
| metadata | JSON | NULL | 추가 정보 (에러 스택, 요청 정보 등) |
| userId | String | FK(User.id), NULL | 관련 사용자 (선택적) |
| createdAt | DateTime | NOT NULL, DEFAULT now | 발생 시간 |

**Level (Enum):**

| 값 | 용도 | 예시 |
|-----|------|------|
| ERROR | 에러 | 이메일 발송 실패, API 호출 실패, DB 연결 실패 |
| WARN | 경고 | Rate limit 근접, 재시도 발생 |
| INFO | 정보 | Cron 실행 완료, 사용자 로그인, 종목 추가 |

**Category 예시:**

| 값 | 설명 |
|-----|------|
| auth | 인증 관련 (로그인, 로그아웃) |
| alert | 알림 관련 (생성, 수정, 삭제, 트리거) |
| cron | Cron 스크립트 실행 |
| api | 외부 API 호출 (Naver, OpenAI, Gmail) |
| system | 시스템 이벤트 (DB, 서버) |

**인덱스:**
- (level) - 레벨별 필터링
- (category) - 카테고리별 필터링
- (createdAt) - 시간순 정렬, 보관 정책 적용
- (userId) - 사용자별 로그 조회

**보관 정책:**
- 보관 기간: 90일
- 정리 방식: Cron으로 주기적 삭제

---

## 4. 인증 및 권한

### 4.1 NextAuth.js 설정

| 항목 | 설정 |
|------|------|
| Provider | Google OAuth |
| Session 전략 | JWT |
| Callbacks | signIn, jwt, session |

### 4.2 인증 흐름

```
1. 사용자 → /login → "Google 로그인" 클릭
2. NextAuth → Google OAuth 페이지로 리다이렉트
3. 사용자 → Google 로그인
4. Google → NextAuth 콜백으로 사용자 정보 전달
5. NextAuth → signIn 콜백:
   - 신규 사용자: User 생성 + user 역할 부여
   - 기존 사용자: 로그인 허용
   - 관리자 이메일: admin 역할 추가 부여
6. NextAuth → JWT 토큰 발급 (roles 포함)
7. 클라이언트 → 쿠키에 저장
8. 리다이렉트 → /dashboard
```

### 4.3 JWT 페이로드

| 필드 | 설명 |
|------|------|
| sub | User ID |
| email | 이메일 |
| name | 닉네임 |
| image | 프로필 이미지 |
| roles | 역할 배열 ["user", "admin"] |

### 4.4 역할별 권한

| 역할 | 권한 |
|------|------|
| user | 본인 종목 CRUD, 본인 알림 이력 조회, 설정 수정 |
| admin | user 권한 + 전체 사용자 조회, 역할 관리, 시스템 로그 |

### 4.5 관리자 지정

**방식:** 환경변수로 관리자 이메일 지정

```
ADMIN_EMAILS=admin@gmail.com,another@gmail.com
```

해당 이메일로 첫 로그인 시 자동으로 admin 역할 부여.

### 4.6 페이지별 접근 제어

| 페이지 | 조건 | 미들웨어 처리 |
|--------|------|--------------|
| / | 없음 | - |
| /login | 비로그인 | 로그인 시 /dashboard 리다이렉트 |
| /dashboard/* | 로그인 | 비로그인 시 /login 리다이렉트 |
| /settings | 로그인 | 비로그인 시 /login 리다이렉트 |
| /admin/* | 로그인 + admin | 미충족 시 /dashboard 리다이렉트 |
| /showcase/* | 개발 환경 | 프로덕션에서 404 |

---

## 5. API 설계

### 5.1 인증 API

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET/POST | /api/auth/* | NextAuth.js 핸들러 | - |

### 5.2 알림 API

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | /api/alerts | 내 알림 목록 | 필요 |
| POST | /api/alerts | 알림 추가 | 필요 |
| GET | /api/alerts/:id | 알림 상세 | 필요 + 소유권 |
| PUT | /api/alerts/:id | 알림 수정 | 필요 + 소유권 |
| DELETE | /api/alerts/:id | 알림 삭제 | 필요 + 소유권 |
| PATCH | /api/alerts/:id/toggle | 상태 전환 | 필요 + 소유권 |
| GET | /api/alerts/:id/chart | 차트 데이터 | 필요 + 소유권 |
| GET | /api/alerts/:id/logs | 알림 이력 | 필요 + 소유권 |

### 5.3 종목 API

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | /api/stocks/search?q= | 종목 검색 | 필요 |
| GET | /api/stocks/:code/price | 현재가 조회 | 필요 |

### 5.4 사용자 API

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | /api/users/me | 내 정보 | 필요 |
| PATCH | /api/users/me | 내 정보 수정 (닉네임) | 필요 |

### 5.5 관리자 API

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | /api/admin/stats | 통계 | admin |
| GET | /api/admin/users | 사용자 목록 | admin |
| GET | /api/admin/users/:id | 사용자 상세 | admin |
| PATCH | /api/admin/users/:id/roles | 역할 수정 | admin |
| GET | /api/admin/logs | 시스템 로그 | admin |

### 5.6 Rate Limiting

| 엔드포인트 | 제한 |
|-----------|------|
| /api/auth/* | 10회/분 |
| /api/stocks/search | 30회/분 |
| /api/alerts (POST) | 20회/분 |
| 기타 API | 60회/분 |

---

## 6. 비동기 처리

### 6.1 Cron 스크립트 구조

**파일:** scripts/check-alerts.ts

**실행:** 시스템 cron (평일 11:35)

```
crontab:
35 11 * * 1-5 cd /path/to/stock-alarm && pnpm run check-alerts >> /var/log/stock-alarm/cron.log 2>&1
```

### 6.2 처리 흐름

```
1. Prisma로 활성(status=active) 알림 전체 조회

2. 종목 코드 중복 제거 → 유니크 종목 목록

3. [비동기 병렬] 각 종목 현재가 조회
   - Promise.allSettled 사용
   - 개별 실패해도 다른 종목 계속 처리

4. 각 알림별 트리거 조건 체크
   - 상승: changeRate >= thresholdUpper
   - 하락: changeRate <= thresholdLower (음수)

5. [비동기 병렬] 트리거된 알림 처리
   - 시장 지수 조회
   - LLM 코멘트 생성
   - 이메일 발송
   - AlertLog 생성
   - basePrice 갱신

6. 결과 로깅
   - 처리 건수, 트리거 건수, 발송 성공/실패
```

### 6.3 에러 처리

| 단계 | 실패 시 동작 |
|------|-------------|
| 가격 조회 실패 | 해당 알림 스킵, 로그 기록 |
| LLM 실패 | 기본 코멘트 사용 |
| 이메일 발송 실패 | 3회 재시도 (지수 백오프), 최종 실패 시 emailSent=false |
| DB 저장 실패 | 에러 로그 기록, 다음 알림 계속 처리 |

### 6.4 예상 성능

| 시나리오 | 동기 처리 | 비동기 처리 |
|----------|----------|------------|
| 100개 종목 가격 조회 | ~50초 | ~2초 |
| 10개 이메일 발송 | ~10초 | ~2초 |

---

## 7. 기능 목록

### 7.1 기존 기능 (Flask에서 이전)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 종목 등록 | 종목 검색 + 임계값 설정 | 필수 |
| 종목 수정 | 임계값 변경 | 필수 |
| 종목 삭제 | 알림 삭제 | 필수 |
| 종목 상태 전환 | active/inactive 전환 | 필수 |
| 종목 상세 | 차트 + 알림 이력 | 필수 |
| 알림 이력 | 전체 발송 이력 | 필수 |
| 알림 발송 | cron + 이메일 | 필수 |
| LLM 코멘트 | 시장 동향 코멘트 | 필수 |
| 연속 추적 | 발송 후 basePrice 갱신 | 필수 |

### 7.2 신규 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| Google 로그인 | OAuth 인증 | 필수 |
| 역할 시스템 | user, admin 역할 | 필수 |
| 닉네임 수정 | 프로필 설정 | 필수 |
| 테마 시스템 | Light/Dark + 8개 컬러 팔레트 | 필수 |
| 관리자 대시보드 | 통계, 사용자 목록 | 필수 |
| 사용자 관리 | 역할 부여/회수 | 필수 |
| 시스템 로그 | 에러/이벤트 로그 | 필수 |
| Rate Limiting | API 호출 제한 | 필수 |
| 컴포넌트 Showcase | 개발용 UI 카탈로그 | 개발 |

### 7.3 개선 사항

| 항목 | 기존 | 개선 |
|------|------|------|
| 인증 | UUID URL | Google OAuth |
| 비동기 | 동기 순차 | 비동기 병렬 |
| DB | SQLite | PostgreSQL |
| 타입 | 런타임 체크 | 컴파일 타임 (TypeScript) |
| UI | Jinja2 + Alpine.js | React + shadcn/ui |

---

## 8. 마이그레이션 계획

### 8.1 데이터 마이그레이션

#### 기존 데이터 (SQLite)

| 테이블 | 레코드 수 (예상) |
|--------|----------------|
| users | ~5 |
| alerts | ~50 |
| alert_logs | ~100 |

#### 마이그레이션 전략

| 방식 | 설명 |
|------|------|
| 1. 스키마 생성 | Prisma migrate로 PostgreSQL 스키마 생성 |
| 2. 데이터 변환 | SQLite 덤프 → JSON → PostgreSQL INSERT |
| 3. ID 매핑 | 기존 INT id → 신규 cuid |
| 4. 사용자 매핑 | 기존 email → Google OAuth 연동 |

#### 사용자 마이그레이션

| 기존 필드 | 신규 필드 | 처리 |
|----------|----------|------|
| email | email | 유지 |
| uuid | - | 삭제 (더 이상 사용 안 함) |
| - | googleId | 첫 Google 로그인 시 설정 |
| - | nickname | 기존 email 또는 Google name |
| - | image | Google 프로필 이미지 |

#### Google OAuth 연동 시나리오

기존 v1 사용자(이메일만 있는 사용자)가 v2에서 Google 로그인을 했을 때의 처리 방법.

**시나리오별 처리:**

| 시나리오 | 조건 | 처리 |
|----------|------|------|
| A. 기존 사용자 연동 | Google 이메일과 동일한 이메일이 DB에 존재 | 기존 User 레코드에 googleId 연동, 기존 데이터 유지 |
| B. 신규 사용자 | Google 이메일이 DB에 없음 | 신규 User 생성 |
| C. 이미 연동된 사용자 | googleId가 이미 설정되어 있음 | 정상 로그인 진행 |

**연동 흐름 (시나리오 A):**

| 단계 | 동작 |
|------|------|
| 1 | 사용자가 Google 로그인 시도 |
| 2 | NextAuth signIn 콜백에서 Google 이메일로 기존 User 조회 |
| 3 | User 존재 + googleId 없음 → googleId 필드 업데이트 |
| 4 | 기존 Alert, AlertLog 등 모든 관계 데이터 자동 유지 (userId 변경 없음) |
| 5 | nickname, image는 기존 값 유지 또는 Google 정보로 업데이트 (사용자 선택 가능) |

**데이터 무결성 보장:**

| 항목 | 방법 |
|------|------|
| 이메일 고유성 | email 필드에 unique 제약 유지 |
| 중복 연동 방지 | 하나의 Google 계정은 하나의 User에만 연동 |
| 기존 데이터 보존 | userId(FK) 변경 없이 googleId만 추가 |

**예외 처리:**

| 상황 | 처리 |
|------|------|
| Google 이메일 ≠ 기존 이메일 | 신규 User로 생성 (기존 데이터 접근 불가) |
| 이메일 변경 필요 시 | 관리자가 수동으로 이메일 매핑 후 연동 |

#### Alert 마이그레이션

| 기존 필드 | 신규 필드 | 처리 |
|----------|----------|------|
| base_price (Float) | basePrice (Int) | 정수 변환 |
| threshold_upper | thresholdUpper | 동일 |
| threshold_lower | thresholdLower | 동일 |
| triggered_at | - | 삭제 (미사용) |
| created_at | createdAt | 유지 |
| - | updatedAt | 현재 시간 |

### 8.2 단계별 구현 계획

| 단계 | 작업 | 예상 기간 |
|------|------|----------|
| **1. 프로젝트 셋업** | Next.js 초기화, shadcn/ui 설치, 기본 구조 | 1일 |
| **2. DB 설계** | Prisma 스키마, PostgreSQL 설정, 시드 데이터 | 1일 |
| **3. 인증** | NextAuth.js, Google OAuth, 역할 시스템 | 2일 |
| **4. 레이아웃** | Header, Sidebar, 테마, 공통 컴포넌트 | 2일 |
| **5. 대시보드** | 종목 목록, 추가, 수정, 삭제, 상태 전환 | 3일 |
| **6. 종목 상세** | 차트, 알림 이력, 기준값 수정 | 2일 |
| **7. 알림 이력** | 전체 이력 페이지, 페이지네이션 | 1일 |
| **8. 설정** 닉네임 수정, 테마 설정 | 1일 |
| **9. 관리자** | 대시보드, 사용자 관리, 로그 | 2일 |
| **10. Cron 스크립트** | 비동기 알림 체크, 이메일 발송 | 2일 |
| **11. 서비스 통합** | 주가 조회, LLM, 이메일 서비스 | 2일 |
| **12. Showcase** | 컴포넌트 카탈로그 (개발용) | 1일 |
| **13. 데이터 마이그레이션** | 기존 데이터 이전 | 1일 |
| **14. 테스트 및 배포** | E2E 테스트, 배포 설정 | 2일 |
| **총계** | | **23일** |

### 8.3 배포 설정

#### 컨테이너 구성

| 서비스 | 이미지 | 용도 | 환경 |
|--------|--------|------|------|
| db | postgres:16-alpine | PostgreSQL 데이터베이스 | 개발 + 프로덕션 |
| app | 커스텀 빌드 (Next.js standalone) | 애플리케이션 | 프로덕션만 |

#### 개발 환경

| 구성 요소 | 실행 방식 |
|----------|----------|
| PostgreSQL | Docker 컨테이너 |
| Next.js | 로컬 (pnpm dev) |

#### 프로덕션 환경

| 구성 요소 | 실행 방식 |
|----------|----------|
| PostgreSQL | Docker 컨테이너 |
| Next.js | Docker 컨테이너 (standalone) |
| Nginx | 호스트 |

#### 배포 단계

| 단계 | 작업 |
|------|------|
| 1 | Docker, Docker Compose 설치 |
| 2 | 환경변수 파일(.env) 설정 |
| 3 | docker compose up -d |
| 4 | Prisma 마이그레이션 실행 |
| 5 | Nginx 리버스 프록시 설정 |
| 6 | Cloudflare Tunnel 연결 |
| 7 | 시스템 cron 등록 |

---

#### AWS Lightsail 이전 시

| 항목 | 내용 |
|------|------|
| 구성 | Docker 방식과 동일 |
| 변경 사항 | 환경변수(.env)만 수정 |
| 데이터 이전 | PostgreSQL 덤프 → 복원 |
| DNS | Cloudflare에서 A 레코드 변경 |

---

## 부록: 환경변수

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stock_alarm"

# NextAuth
NEXTAUTH_URL="https://stockalarm.co.kr"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Admin
ADMIN_EMAILS="admin@gmail.com"

# External APIs
OPENAI_API_KEY="your-openai-key"

# Email (Gmail)
GMAIL_ADDRESS="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Email (Resend - 대안)
RESEND_API_KEY="your-resend-key"

# App
NEXT_PUBLIC_APP_URL="https://stockalarm.co.kr"
NODE_ENV="production"
```
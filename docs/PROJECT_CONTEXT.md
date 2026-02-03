# Stock Alarm - 프로젝트 컨텍스트

## 프로젝트 개요

### 목적
주식 시장을 모니터링하여 사용자가 설정한 종목이 특정 기준에 도달하면 이메일로 알림을 발송하는 웹 서비스.

### 사용자
- 주 사용자: 개인 (클라이언트 1명)
- 설계: 멀티유저 대응 (웹 공개 배포 고려)

### 핵심 기능
1. 이메일 등록 → UUID 기반 설정 URL 발급
2. 종목 추가/삭제, 알림 기준 설정
3. 매일 오전 장 마감(11:30) 기준 체크 → 조건 충족 시 이메일 발송
4. LLM을 활용한 시장 동향 포함 알림 메일 작성

### 알림 기준

다양한 기준이 추가될 수 있으며, 기준별로 독립적으로 동작한다.

| 기준 | 설명 | 상태 |
|------|------|------|
| 등록가 대비 변동률 | base_price 대비 ±N% 도달 시 알림 | MVP |
| 특정 가격 도달 | 지정한 가격 이상/이하 도달 시 알림 | 예정 |
| 전일 대비 변동률 | 전일 종가 대비 ±N% 도달 시 알림 | 예정 |
| 거래량 급증 | 평균 거래량 대비 N배 이상 시 알림 | 예정 |
| 기타 | 클라이언트 요청에 따라 추가 | 예정 |

> MVP에서는 "등록가 대비 변동률" 기준만 구현한다.
> 기준 추가 시 DB 스키마 및 체크 로직 확장 필요.

---

## 기술 스택

| 항목 | 기술 | 비고 |
|------|------|------|
| 백엔드 | Flask | |
| DB | SQLite | data/stock_alarm.db |
| 프론트 | Jinja2 + Tailwind CSS | 서버 템플릿 방식 |
| 주식 데이터 | FinanceDataReader | 국내 주식 |
| 이메일 발송 | Gmail SMTP | |
| LLM | OpenAI API | 추후 로컬 LLM 전환 고려 |
| 스케줄러 | cron | 라즈베리파이에서 실행 |
| 서버 환경 | Raspberry Pi 5 (8GB) | |
| 배포 | Cloudflare Tunnel | HTTPS 자동 제공, 포트포워딩 불필요 |

---

## 배포 환경

| 항목 | 내용 |
|------|------|
| 도메인 | stockalarm.co.kr |
| DNS | Cloudflare |
| 터널 | Cloudflare Tunnel (stockalarm) |
| HTTPS | Cloudflare 자동 제공 |
| 웹서버 | Nginx (localhost:80) |

---

## 프로젝트 구조

```
stock-alarm/
├── app/
│   ├── __init__.py          # Flask 앱 생성
│   ├── config.py            # 설정 (DB 경로, SMTP, API 키 등)
│   ├── models.py            # SQLAlchemy 모델
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── main.py          # 홈, 이메일 등록
│   │   └── settings.py      # 종목/기준 관리 (UUID URL)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── stock.py         # 주식 데이터 조회
│   │   ├── mail.py          # 이메일 발송
│   │   └── llm.py           # LLM 메시지 생성
│   ├── templates/
│   │   ├── base.html
│   │   ├── home.html
│   │   └── settings.html
│   └── static/
│       └── css/
├── prompts/
│   └── alert_mail.txt       # LLM 프롬프트 템플릿
├── scripts/
│   └── check_alert.py       # cron 실행 스크립트
├── data/
│   └── stock_alarm.db
├── docs/
│   ├── CLAUDE.md
│   ├── README.md
│   └── DEPLOY.md
├── requirements.txt
└── run.py
```

---

## DB 스키마

### users (사용자)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | |
| email | TEXT | UNIQUE, NOT NULL | 이메일 |
| uuid | TEXT | UNIQUE, NOT NULL | 설정 페이지 접근용 |
| created_at | DATETIME | NOT NULL | 등록일 |

### alerts (알림 설정)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | |
| user_id | INTEGER | FK(users.id) | |
| stock_code | TEXT | NOT NULL | 종목코드 (예: 005930) |
| stock_name | TEXT | NOT NULL | 종목명 (예: 삼성전자) |
| base_price | REAL | NOT NULL | 등록 시점 기준가 |
| threshold_upper | REAL | | 상승 기준 (예: 10.0 = +10%) |
| threshold_lower | REAL | | 하락 기준 (예: -10.0 = -10%) |
| status | TEXT | NOT NULL | 'active' / 'triggered' / 'inactive' |
| triggered_at | DATETIME | | 알림 발송 시점 |
| created_at | DATETIME | NOT NULL | 등록일 |

### alert_logs (알림 발송 기록)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | |
| alert_id | INTEGER | FK(alerts.id) | |
| user_id | INTEGER | FK(users.id) | |
| stock_code | TEXT | NOT NULL | 종목코드 |
| base_price | REAL | NOT NULL | 기준가 |
| current_price | REAL | NOT NULL | 발송 시점 현재가 |
| change_rate | REAL | NOT NULL | 변동률 (%) |
| threshold_type | TEXT | NOT NULL | 'upper' / 'lower' |
| email_sent | BOOLEAN | NOT NULL | 발송 성공 여부 |
| sent_at | DATETIME | NOT NULL | 발송 시점 |

---

## MVP 범위 (1차)

### 포함

- [ ] 이메일 등록 → UUID URL 발급 및 이메일 발송
- [ ] 종목 추가/삭제
- [ ] 알림 기준 설정 (상승/하락 %)
- [ ] 매일 11:35 cron 실행 → 기준 체크
- [ ] 조건 충족 시 이메일 발송 (LLM 코멘트 포함)
- [ ] 알림 발송 로그 기록

### 메일 구성
1. 알림 요약 - 종목명, 도달 기준
2. 시장 동향 - 코스피/코스닥 현황
3. 투자 코멘트 - LLM 생성

### 제외 (2차 개발)

- 관리자 페이지 (/admin)
- 대시보드 차트 (Chart.js)
- 섹터별 동향 분석
- 카카오톡 알림 채널
- 알림 발송 후 처리 방식 선택 (1회성/반복/재설정)

---

## 인증 방식

- 회원가입/로그인 없음
- 이메일 등록 시 UUID 생성 → 해당 이메일로 설정 URL 발송
- URL을 아는 사람만 본인 설정 접근 가능
- URL 분실 시 홈에서 이메일 재입력 → 동일 URL 재발송

---

## 코딩 컨벤션

### Python
- PEP 8 준수
- 함수/변수: snake_case
- 클래스: PascalCase
- 들여쓰기: 4 spaces
- 문자열: 작은따옴표 (') 우선

### 파일/폴더
- 소문자, 언더스코어 구분

### 주석
- 함수: docstring 필수
- 복잡한 로직: 인라인 주석

### Git 커밋
- feat: 새 기능
- fix: 버그 수정
- docs: 문서
- refactor: 리팩토링
- style: 포맷팅

---

## 환경 변수 (.env)

```
FLASK_SECRET_KEY=
GMAIL_ADDRESS=
GMAIL_APP_PASSWORD=
OPENAI_API_KEY=
DATABASE_PATH=data/stock_alarm.db
```

---

## 참고 사항

- 알림 기준 판단: MVP에서는 등록 시점 base_price 대비 현재가 비교
- 알림 발송 후 처리 방식: 클라이언트 협의 후 결정 예정
- 대상 시장: 국내 주식 (추후 확장 가능)

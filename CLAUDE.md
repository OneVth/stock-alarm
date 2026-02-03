# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

주식 시장 모니터링 후 설정 기준 도달 시 이메일 알림을 발송하는 웹 서비스.
- 인증: 이메일 등록 → UUID 기반 설정 URL 발급 (회원가입/로그인 없음)
- 알림 체크: 매일 장 마감(11:30) 후 cron 실행
- LLM을 활용한 시장 동향 코멘트 포함 알림 메일

## 기술 스택

- **백엔드**: Flask + SQLAlchemy
- **DB**: SQLite (`data/stock_alarm.db`)
- **프론트**: Jinja2 + Tailwind CSS (서버 템플릿)
- **주식 데이터**: FinanceDataReader (국내 주식)
- **이메일**: Gmail SMTP
- **LLM**: OpenAI API
- **배포**: Raspberry Pi 5 + Nginx + Cloudflare Tunnel

## 개발 명령어

```bash
# 의존성 설치
uv sync

# 개발 서버 실행
uv run python run.py

# cron 알림 체크 스크립트 실행
uv run python scripts/check_alert.py
```

## 프로젝트 구조

```
app/
├── routes/
│   ├── main.py          # 홈, 이메일 등록
│   └── settings.py      # 종목/기준 관리 (UUID URL)
├── services/
│   ├── stock.py         # 주식 데이터 조회 (FinanceDataReader)
│   ├── mail.py          # 이메일 발송 (Gmail SMTP)
│   └── llm.py           # LLM 메시지 생성
├── models.py            # SQLAlchemy 모델 (users, alerts, alert_logs)
├── config.py            # 설정 관리
└── templates/           # Jinja2 템플릿

scripts/
└── check_alert.py       # cron 실행 스크립트 (매일 11:35)

prompts/
└── alert_mail.txt       # LLM 프롬프트 템플릿
```

## DB 스키마

**users**: email, uuid (설정 페이지 접근용)

**alerts**: user_id, stock_code, stock_name, base_price (등록 시점 기준가), threshold_upper/lower (변동률 %), status (active/triggered/inactive)

**alert_logs**: alert_id, base_price, current_price, change_rate, threshold_type, email_sent

## 알림 기준

MVP: 등록가(base_price) 대비 변동률 (±N%) 도달 시 알림

향후 추가 예정: 특정 가격 도달, 전일 대비 변동률, 거래량 급증

## 코딩 컨벤션

- PEP 8 준수
- 함수/변수: snake_case, 클래스: PascalCase
- 문자열: 작은따옴표(') 우선
- 함수 docstring 필수
- 커밋: feat/fix/docs/refactor/style 접두사

## 환경 변수 (.env)

```
FLASK_SECRET_KEY=
GMAIL_ADDRESS=
GMAIL_APP_PASSWORD=
OPENAI_API_KEY=
DATABASE_PATH=data/stock_alarm.db
```

## 배포

- 도메인: stockalarm.co.kr
- Cloudflare Tunnel → Nginx (localhost:80) → Flask

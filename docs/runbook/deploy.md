# Stock Alarm v2 배포 런북

| 항목 | 값 |
|------|-----|
| 대상 | Stock Alarm v2 (`stockalarm.co.kr`) 초기 배포 수행자 |
| 독자 수준 | Docker Compose 기본 명령과 터미널에 익숙한 사용자 |
| 최초 작성 | 2026-04-20 |
| 참조 | [`CLAUDE.md`](../../CLAUDE.md), [`docs/security-check/security-checklist-stock-alarm.md`](../security-check/security-checklist-stock-alarm.md) |

---

## 개요

이 문서는 Stock Alarm v2를 라즈베리파이 환경에 처음 배포할 때 수행해야 할 절차를 정리한 런북이다.
배포 아키텍처는 **전면 컨테이너화**이다:

- 라즈베리파이 호스트에는 Docker만 설치
- `docker-compose.prod.yml` 단일 파일로 db + app + nginx + cloudflared 관리
- Cloudflare Tunnel이 유일한 외부 진입점 (호스트에 포트 노출 없음)
- 초기 배포는 `v2.stockalarm.co.kr` 서브도메인에서 legacy와 병렬 운영 → 검증 후 메인 도메인 스위치

모든 단계는 순서대로 수행하는 것을 전제로 한다. 섹션을 건너뛰면 후속 단계에서 누락된 자원이나 자격증명을 요구해 중단될 수 있다.

---

## 1. 사전 준비

배포를 시작하기 전 다음 자원이 준비되어야 한다.

### 1.1 계정

- **Cloudflare 계정**: `stockalarm.co.kr` 도메인이 등록되어 있고 DNS가 Cloudflare 네임서버를 사용 중이어야 한다.
- **Google Cloud Console 계정**: OAuth Client가 생성된 프로젝트에 접근 권한이 있어야 한다.
- **GitHub 계정**: 리포지토리에 읽기 권한 필요 (`OneVth/stock-alarm`, `main` 브랜치 clone 대상).
- **Gmail 계정**: 알림 메일 발송용. 2단계 인증 활성화 및 **앱 비밀번호** 발급 필요.
- **UptimeRobot 계정** (무료 tier로 충분): 헬스체크용.

### 1.2 하드웨어 / 네트워크

- **Raspberry Pi** (4B 이상 권장, RAM 4GB 이상): Docker Engine이 동작하는 상태.
- **인터넷 연결**: outbound 허용. Cloudflare Tunnel이 아웃바운드로 동작하므로 포트포워딩 불필요.

### 1.3 소프트웨어 (라즈베리파이에 설치 필요)

- **Docker Engine** (v24 이상 권장)
- **Docker Compose Plugin** (v2)
- **Git**

설치 확인:

```bash
docker --version
docker compose version
git --version
```

### 1.4 확보해둘 값 (민감 정보 — 런북에 기록하지 말 것)

배포 과정에서 아래 값들이 필요하다. **`.env.prod` 외부 어디에도 기록하지 말 것.**

- Google OAuth Client ID / Secret
- Gmail 앱 비밀번호
- Cloudflare Tunnel Token (섹션 3에서 발급)
- NextAuth Secret (배포 중 `openssl rand -base64 32`로 생성)
- OpenAI API Key (선택, LLM 코멘트 기능 사용 시)
- 관리자 Gmail 주소

### 1.5 사전 지식

- Docker Compose 기본 명령 (`up`, `down`, `ps`, `logs`)
- 텍스트 에디터로 환경 파일 편집 (`nano`, `vim` 등)
- SSH로 라즈베리파이 접속 방법

---

## 2. 라즈베리파이 준비

### 2.1 프로젝트 디렉토리 준비

작업 디렉토리를 결정한다. 이 런북에서는 `$HOME/stock-alarm`을 사용한다.

```bash
cd $HOME
git clone https://github.com/OneVth/stock-alarm.git
cd stock-alarm
git checkout main
```

### 2.2 `.env.prod` 파일 작성

저장소의 `.env.prod.example`을 복사해서 실제 값을 채운다. **이 파일은 gitignore되어 있으므로 커밋되지 않는다.**

```bash
cp .env.prod.example .env.prod
```

에디터로 `.env.prod`를 열어 각 값을 입력한다:

```bash
nano .env.prod
```

**값 입력 가이드**:

| 변수 | 값 출처 |
|------|---------|
| `DB_USER` | 기본값 `stockalarm_user` 유지 가능 |
| `DB_PASSWORD` | 강력한 랜덤 문자열. `openssl rand -base64 24` 실행 결과 사용 |
| `DB_NAME` | 기본값 `stockalarm` 유지 가능 |
| `NEXTAUTH_URL` | `https://v2.stockalarm.co.kr` (병렬 운영 기간) 또는 최종 `https://stockalarm.co.kr` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 실행 결과 |
| `AUTH_TRUST_HOST` | `true` 유지 |
| `AUTH_GOOGLE_ID` | 섹션 4에서 확보 |
| `AUTH_GOOGLE_SECRET` | 섹션 4에서 확보 |
| `ADMIN_EMAILS` | 관리자 Gmail 주소 (콤마 구분 다수 가능) |
| `OPENAI_API_KEY` | OpenAI 콘솔에서 발급 (선택) |
| `GMAIL_ADDRESS` | 발송용 Gmail 주소 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 (공백 제거하여 입력) |
| `TUNNEL_TOKEN` | 섹션 3에서 확보 |
| `NEXT_PUBLIC_APP_URL` | `NEXTAUTH_URL`과 동일 |
| `NODE_ENV` | `production` 유지 |

**보안 경고**:

- `.env.prod`는 반드시 파일 권한 `600`으로 제한한다:
  ```bash
  chmod 600 .env.prod
  ```
- 값 복사 시 터미널 히스토리에 남지 않도록 주의. `openssl` 실행 결과를 직접 에디터에 붙여넣는다.

### 2.3 호스트 UID/GID 확인

tools-py 컨테이너가 호스트 파일에 root 소유로 쓰지 않도록, 배포 사용자의 UID/GID를 `.env.prod`에 기록한다.

```bash
id -u    # UID 출력
id -g    # GID 출력
```

출력값을 `.env.prod`의 `HOST_UID`, `HOST_GID`에 설정한다. 라즈베리파이 기본 사용자는 보통 UID/GID 1000이다.

### 2.4 디렉토리 구조 확인

다음 경로가 존재해야 한다:

```
$HOME/stock-alarm/
├── docker-compose.prod.yml
├── Dockerfile
├── .env.prod              (방금 생성)
├── deploy/nginx/nginx.conf
└── prisma/
    └── schema.prisma
```

### 2.5 초기 빌드 (선택적 검증)

본격 배포(섹션 6) 전에 빌드만 먼저 실행해서 문제를 조기 발견할 수 있다:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml build
```

이 단계에서 이미지가 정상 생성되면 Next.js 빌드 + Prisma generate가 성공한 것이다. 실제 실행은 섹션 6에서 다룬다.

---

## 3. Cloudflare Zero Trust Tunnel 설정

라즈베리파이 외부에 포트를 열지 않고 외부 접근을 허용하기 위해 Cloudflare Tunnel을 사용한다.

### 3.1 사전 조건

- Cloudflare 계정에 `stockalarm.co.kr` 도메인이 등록되어 있다.
- 도메인의 네임서버가 Cloudflare를 가리킨다 (대시보드에서 "Active" 상태 확인).
- Zero Trust가 활성화되어 있다 (무료 tier 가능).

### 3.2 Tunnel 생성

1. Cloudflare Zero Trust 대시보드 접속: <https://one.dash.cloudflare.com>
2. 왼쪽 메뉴에서 **Networks → Tunnels** 선택
3. **Create a tunnel** 클릭
4. 커넥터 선택: **Cloudflared** → **Next**
5. Tunnel 이름: `stockalarm-v2` (권장) → **Save tunnel**

### 3.3 Tunnel Token 확보

Tunnel 생성 직후 커넥터 설치 화면이 표시된다.

1. **Docker** 탭을 선택한다.
2. 표시되는 커맨드에서 `--token` 뒤의 **토큰 문자열**만 복사한다 (`eyJ`로 시작하는 긴 문자열).
3. 라즈베리파이의 `.env.prod` 파일에 `TUNNEL_TOKEN=<복사한 값>` 형태로 기록한다.
4. 대시보드의 **Next**를 누른다. 실제 `docker run` 명령은 실행하지 않는다 — compose에 cloudflared 서비스가 이미 정의되어 있다.

**토큰 보안**:

- 이 토큰은 Tunnel 제어 권한을 가진 자격증명이다.
- `.env.prod` 외부 어디에도 저장하지 않는다 (클립보드에서 바로 `.env.prod`로 붙여넣는다).
- 토큰 노출 의심 시 즉시 Tunnel을 삭제하고 재생성한다.

### 3.4 Public Hostname 설정

1. Tunnel 생성 마지막 단계의 **Public Hostnames** 화면 (또는 생성 완료 후 Tunnel 상세 → **Public Hostname** 탭).
2. **Add a public hostname** 클릭.
3. 입력 값:

| 필드 | 값 |
|------|-----|
| Subdomain | `v2` |
| Domain | `stockalarm.co.kr` (드롭다운에서 선택) |
| Type | `HTTP` |
| URL | `nginx:80` |

4. **Save hostname**.

`nginx:80`은 docker-compose 내부 네트워크(`stockalarm-network`)의 서비스명이다. cloudflared 컨테이너는 같은 네트워크에 속하므로 서비스명으로 nginx에 접근할 수 있다. 호스트 포트를 노출하지 않기 때문에 외부에서는 직접 접근 불가.

설정 후 Cloudflare가 자동으로 DNS 레코드(`v2.stockalarm.co.kr` → tunnel)를 생성한다.

### 3.5 TLS / SSL 모드 확인

Cloudflare Edge가 TLS를 종료하므로 라즈베리파이에 인증서를 설치할 필요가 없다.

Cloudflare 대시보드 → 해당 도메인 → **SSL/TLS → Overview**에서 암호화 모드가 **Full** 이상인지 확인한다. (Flexible 모드는 리다이렉트 루프를 유발할 수 있으므로 사용하지 않는다.)

### 3.6 legacy → v2 도메인 전환 (최종 배포 이후)

v2 서비스가 `v2.stockalarm.co.kr`에서 안정적으로 운영됨을 검증한 뒤 메인 도메인을 전환한다:

1. 현재 legacy용 Tunnel의 **Public Hostnames**에서 `stockalarm.co.kr` 항목을 제거한다.
2. `stockalarm-v2` Tunnel의 **Public Hostnames**에 `stockalarm.co.kr` (또는 빈 subdomain = apex)을 추가한다. URL은 동일하게 `nginx:80`.
3. 변경 즉시 트래픽이 v2로 전환된다 (Cloudflare 내부 라우팅이므로 DNS TTL 대기 없음).
4. legacy cloudflared 컨테이너와 Flask 프로세스를 중단한다.
5. 불필요해진 DNS 레코드(`v2.stockalarm.co.kr`)는 Cloudflare 대시보드에서 제거한다 — 서브도메인 탈취 방지 (보안 체크리스트 8-7).

---

## 4. Google OAuth 설정

NextAuth v5의 Google Provider 동작을 위해 Google Cloud Console에 OAuth Client를 등록한다. 이 섹션은 **OAuth Client를 새로 생성하는 경우**를 기준으로 작성되었다. 기존 Client를 재사용하는 경우는 4.6을 참조한다.

### 4.1 Google Cloud 프로젝트 준비

1. Google Cloud Console 접속: <https://console.cloud.google.com>
2. 상단 프로젝트 선택 드롭다운 → **New Project**.
3. 입력:
   - Project name: `stockalarm` 등 식별 가능한 이름
   - Organization: 개인 계정이면 "No organization"
4. 생성 후 프로젝트 전환.

### 4.2 OAuth Consent Screen 설정

Client 생성 전에 동의 화면부터 구성한다. 이 화면은 로그인 시 사용자에게 표시된다.

1. 좌측 메뉴 **APIs & Services → OAuth consent screen**.
2. User Type: **External** 선택 → **Create**.
3. App information 입력:

| 필드 | 값 |
|------|-----|
| App name | `Stock Alarm` |
| User support email | 관리자 Gmail 주소 |
| App logo | 선택 (생략 가능) |
| Application home page | `https://stockalarm.co.kr` |
| Privacy policy link | `https://stockalarm.co.kr/privacy`. 해당 페이지가 아직 없다면 비워두되, **개인정보처리방침은 한국 개인정보보호법상 필수**이므로 공개 배포 전까지는 반드시 페이지를 작성하고 이 필드에 등록해야 한다. |
| Terms of service link | 선택 |
| Authorized domains | `stockalarm.co.kr` (서브도메인은 자동 커버됨) |
| Developer contact information | 관리자 Gmail 주소 |

4. **Save and continue**.
5. **Scopes** 단계:
   - **Add or remove scopes** 클릭.
   - `userinfo.email`, `userinfo.profile`, `openid` 세 개 선택.
   - 이 scope는 Google이 분류하는 "non-sensitive"이므로 별도 검증(verification) 절차가 필요하지 않다.
6. **Save and continue**.
7. Test users 단계는 건너뛴다 (Production 모드로 전환하면 무의미).
8. **Save and continue** → Summary 확인 → **Back to dashboard**.

### 4.3 Production 모드로 전환

기본값인 Testing 상태에서는 등록된 test users만 로그인할 수 있다. 공개 서비스 운영에는 Production 모드가 필요하다.

1. OAuth consent screen 메인 화면에서 **Publishing status** 확인 (현재 "Testing").
2. **PUBLISH APP** 버튼 클릭.
3. 확인 대화상자 → **Confirm**. non-sensitive scope만 사용하므로 Google의 추가 검증 없이 즉시 Production으로 전환된다.

**Testing 모드 제약 (참고)**: Testing 모드를 유지할 경우 refresh token이 7일 후 만료된다. Production 전환 시 이 제약은 사라진다.

### 4.4 OAuth Client ID 생성

1. 좌측 메뉴 **APIs & Services → Credentials**.
2. **+ Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Name: `Stock Alarm Web` 등.
5. **Authorized JavaScript origins** 추가:
   - `https://v2.stockalarm.co.kr` (초기 배포)
   - `https://stockalarm.co.kr` (전환 후)
6. **Authorized redirect URIs** 추가:
   - `https://v2.stockalarm.co.kr/api/auth/callback/google` (초기 배포)
   - `https://stockalarm.co.kr/api/auth/callback/google` (전환 후)
7. **Create**.

### 4.5 Client ID / Secret 확보

생성 직후 Client ID와 Client Secret이 대화상자에 표시된다.

1. Client ID 복사 → `.env.prod`의 `AUTH_GOOGLE_ID`에 기록.
2. Client Secret 복사 → `.env.prod`의 `AUTH_GOOGLE_SECRET`에 기록.
3. **대화상자를 닫으면 Client Secret은 다시 조회할 수 없다** (재생성만 가능). `.env.prod`에 정확히 기록했는지 확인 후 닫는다.

**보안 경고**:

- Client Secret은 서버 전용 자격증명이다. 클라이언트 코드, 로그, 공개 저장소에 절대 노출 금지.
- `.env.prod`는 이미 `chmod 600`으로 제한되어 있어야 한다 (섹션 2.2).

### 4.6 기존 Client를 재사용하는 경우

legacy 등에서 이미 사용 중인 OAuth Client를 재활용하는 경우, 4.1~4.5 대신 다음 절차를 수행한다.

1. **APIs & Services → Credentials** → 기존 OAuth Client 선택.
2. **Authorized JavaScript origins**에 다음 추가 (기존 항목 유지):
   - `https://v2.stockalarm.co.kr`
   - `https://stockalarm.co.kr` (전환 후)
3. **Authorized redirect URIs**에 다음 추가 (기존 항목 유지):
   - `https://v2.stockalarm.co.kr/api/auth/callback/google`
   - `https://stockalarm.co.kr/api/auth/callback/google` (전환 후)
4. **Save**.
5. 이미 발급된 Client ID / Secret을 `.env.prod`에 기록한다. Client Secret을 모르는 경우 **Add secret**으로 새 Secret을 발급하고 기록 후 이전 Secret은 삭제한다.
6. 동의 화면이 Testing 상태라면 4.3에 따라 Production으로 전환한다.

### 4.7 legacy 전환 이후 URI 정리

v2 서비스가 `stockalarm.co.kr`에서 안정 운영됨을 검증한 뒤 반드시 수행한다:

1. Authorized redirect URIs에서 `https://v2.stockalarm.co.kr/api/auth/callback/google` **제거**.
2. Authorized JavaScript origins에서 `https://v2.stockalarm.co.kr` **제거**.
3. **Save**.

사용하지 않는 서브도메인을 승인 목록에 남겨두면 서브도메인 탈취 공격의 접점이 될 수 있다 (보안 체크리스트 8-7).

### 4.8 변경 반영 대기

Google 측 설정 전파에는 최대 몇 분이 걸린다. 배포 직후 로그인이 실패하면 5분 정도 기다린 뒤 재시도한다.

---

## 5. UptimeRobot 모니터링 설정

`/api/health` 엔드포인트를 외부에서 주기적으로 체크해 서비스 장애를 이메일로 알림받는다. UptimeRobot 무료 tier(5분 간격, 모니터 50개)로 충분하다.

### 5.1 계정 생성

1. <https://uptimerobot.com> 접속 → **Register for FREE**.
2. 관리자 Gmail 주소로 가입.
3. 이메일 인증 완료.

### 5.2 알림 수신처 등록 (Alert Contact)

모니터보다 먼저 알림을 받을 이메일을 등록한다.

1. 좌측 메뉴 **My Settings → Alert Contacts**.
2. **Add Alert Contact**.
3. 입력:

| 필드 | 값 |
|------|-----|
| Alert Contact Type | `E-mail` |
| Friendly Name | `Primary Email` 또는 식별 가능한 이름 |
| Send as Contact | 알림받을 이메일 주소 |

4. **Create Alert Contact**.
5. 등록한 주소로 오는 인증 메일의 링크를 클릭해 활성화.

### 5.3 Health 모니터 생성

1. 좌측 메뉴 **Dashboard → + New monitor**.
2. 입력:

| 필드 | 값 |
|------|-----|
| Monitor Type | `HTTP(s)` |
| Friendly Name | `Stock Alarm Health` |
| URL (or IP) | `https://v2.stockalarm.co.kr/api/health` (초기 배포) |
| Monitoring Interval | `5 minutes` (무료 tier 최소) |
| Monitor Timeout | `30 seconds` |

3. **Advanced Settings** 펼침:
   - **HTTP Method**: `GET`
   - **Expected Status Codes**: `200` (기본값 유지 — 503이나 다른 코드는 실패로 간주)
   - **Keyword Monitoring**: 설정하지 않음 (본문 검증은 불필요. `/api/health`는 status code로 충분히 구분된다)

4. **Alert Contacts To Notify** 섹션에서 5.2에서 등록한 Alert Contact 선택.

5. **Alert When Down → Send alert after** 설정:
   - `1 time` (첫 실패 즉시 알림). 가족 서비스 규모에선 false positive가 많지 않아 민감하게 설정해도 부담 없음.

6. **Create Monitor**.

### 5.4 정상 동작 확인

생성 직후 첫 체크가 실행된다. 대시보드에서:

- 상태가 **Up** (녹색)으로 표시되는지 확인.
- **Paused** 상태라면 모니터를 선택해 **Resume**.

장애 시뮬레이션 (선택):

1. 라즈베리파이에서 `docker compose ... stop nginx` 실행.
2. 5~10분 후 등록한 이메일로 Down 알림이 오는지 확인.
3. `docker compose ... start nginx`로 복구 → Up 알림 수신 확인.

### 5.5 legacy 전환 이후 URL 변경

메인 도메인 전환(섹션 3.6) 완료 후:

1. UptimeRobot 대시보드에서 `Stock Alarm Health` 모니터 선택.
2. **Edit** → URL을 `https://stockalarm.co.kr/api/health`로 변경.
3. **Save Changes**.

### 5.6 운영 팁

- **일시 중지**: 의도적인 유지보수 중(예: 이미지 교체 배포)에는 모니터를 **Pause**해서 불필요한 알림을 피한다. 작업 후 Resume 잊지 말 것.
- **Alert 이메일 자동 필터 만들지 말 것**: Gmail 필터로 UptimeRobot 메일을 자동 삭제하거나 라벨링해 숨기면 실제 장애를 놓친다.
- **무료 tier 한계**: 5분 간격이라 "5분 미만 장애"는 감지하지 못할 수 있다. 가족 서비스 규모에서는 수용 가능한 수준이다. 장기 운영하며 더 촘촘한 간격이 필요하다고 판단되면 다음 대안을 검토한다:
  - **UptimeRobot 유료 tier**: 1분 간격
  - **Better Stack (구 Better Uptime)**: 무료 tier 10개 모니터, 3분 간격
  - **Healthchecks.io**: 무료 tier, passive ping 방식(서버가 주기적으로 ping) — 배치 작업 감시에 특화
  - **자체호스팅 Uptime Kuma**: compose에 컨테이너 추가, 무제한 간격 조정 가능

---

## 6. 초기 배포 + Smoke Test

이 섹션은 **섹션 2~5가 모두 완료된 후** 수행한다. 지금까지가 "파일/설정 준비"였다면 여기서부터는 "실제 컨테이너 기동 + 서비스 접근 검증".

### 6.1 사전 체크

배포 시작 전 다음 모두 준비되어 있어야 한다:

- [ ] 섹션 2 완료: 저장소 clone, `.env.prod` 작성 (chmod 600), 초기 빌드 성공
- [ ] 섹션 3 완료: Cloudflare Tunnel 생성, Public Hostname 등록, `TUNNEL_TOKEN` 확보 → `.env.prod` 기록
- [ ] 섹션 4 완료: Google OAuth Client 생성(또는 재사용 설정), Production 모드 전환, Client ID/Secret → `.env.prod` 기록, Redirect URI 등록
- [ ] 섹션 5 완료: UptimeRobot 모니터 생성 (아직 Up/Down 판정은 나중)
- [ ] `.env.prod`의 **모든 필드가 실제 값으로 채워져 있다** (빈 값 없음)

### 6.2 Database 마이그레이션 준비

v2 스키마로 DB를 초기화하려면 Prisma 마이그레이션이 필요하다. app 컨테이너(standalone 빌드)에는 prisma CLI가 없으므로 **첫 기동 후 tools 이미지를 통해 수동으로 수행**한다 (6.4 참조).

### 6.3 전체 스택 기동

```bash
cd $HOME/stock-alarm
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

초기 기동은 이미지 빌드 + pull 때문에 수 분 소요된다. 완료 후 상태 확인:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

예상 상태:

| 서비스 | STATUS |
|--------|--------|
| `stockalarm-db` | `Up (healthy)` |
| `stockalarm-app` | `Up (healthy)` |
| `stockalarm-nginx` | `Up` |
| `stockalarm-cloudflared` | `Up` |

어느 하나라도 `unhealthy` 또는 `Exited`면 6.7 트러블슈팅으로 이동.

### 6.4 Prisma 마이그레이션 실행 (최초 1회)

프로덕션은 tools 이미지를 통해 수동 실행한다. 세션 2에서 자동화 여부를 검토했으나, 가족 서비스 규모에서는 수동 실행 + 런북 문서화로 충분하다고 결정했다.

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tools run --rm tools \
  npx prisma migrate deploy
```

예상 출력: "N migrations applied" 메시지. Role 시딩이 필요한 경우 이어서:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tools run --rm tools \
  pnpm db:seed:essential
```

`db:seed:essential`은 Role 시딩만 수행하므로 프로덕션에서도 안전하다 (`db:seed`는 더미 알림 포함이므로 프로덕션 실행 금지).

### 6.5 내부 접근 검증 (컨테이너 간 통신)

nginx 컨테이너에서 app의 `/api/health`에 접근되는지 확인:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec nginx \
  wget -qO- http://app:3000/api/health
```

예상 출력: `{"status":"ok"}`

실패 시 6.7 트러블슈팅 참조.

### 6.6 외부 접근 Smoke Test

Cloudflare Tunnel을 거쳐 실제 인터넷에서 접근 가능한지 확인한다.

**1) Health 엔드포인트**:

라즈베리파이가 아닌 **다른 기기**(노트북/휴대폰)에서 브라우저로 접속:

- `https://v2.stockalarm.co.kr/api/health`
- 예상: `{"status":"ok"}`

**2) 홈페이지 로드**:

- `https://v2.stockalarm.co.kr`
- 예상: Stock Alarm 랜딩 또는 로그인 페이지가 정상 렌더링.

**3) Google 로그인 플로우**:

- 로그인 버튼 클릭 → Google 동의 화면 → 콜백 → 대시보드 진입.
- `redirect_uri_mismatch` 에러 발생 시 섹션 4.2/4.6의 redirect URI 등록 확인.

**4) UptimeRobot 정상 감지**:

- UptimeRobot 대시보드에서 해당 모니터가 **Up** 상태로 바뀌었는지 확인.
- 바뀌지 않으면 URL, 타임아웃, 네트워크 방화벽(라즈베리파이 쪽 아님, Cloudflare 쪽) 점검.

### 6.7 트러블슈팅

| 증상 | 첫 확인 |
|------|---------|
| `app unhealthy` | `docker logs stockalarm-app`에서 기동 에러 확인. 환경변수 누락이 가장 흔한 원인 |
| `db unhealthy` | `POSTGRES_*` 변수 누락 또는 볼륨 권한 이슈. `docker logs stockalarm-db` |
| `cloudflared` 로그에 `connection error` | TUNNEL_TOKEN 오타 또는 Cloudflare 대시보드의 Tunnel 상태 `Inactive` |
| `502 Bad Gateway` (외부 접속 시) | nginx → app 연결 실패. nginx 컨테이너 로그 + 6.5 단계로 격리 |
| `redirect_uri_mismatch` (로그인 시) | Google OAuth redirect URI 등록 누락 또는 `NEXTAUTH_URL` 불일치 |
| `Configuration` 에러 (NextAuth) | `NEXTAUTH_SECRET` 미설정 또는 `AUTH_TRUST_HOST` 누락 |
| UptimeRobot이 502/503을 지속 반환 | Cloudflare Tunnel 상태 점검, nginx rate limit 초과 가능성 |

로그 수집 일괄 명령:

```bash
# 모든 서비스 최근 로그
docker compose --env-file .env.prod -f docker-compose.prod.yml logs --tail 100

# 특정 서비스
docker logs --tail 100 stockalarm-app
```

### 6.8 정상 배포 후 확인

모든 smoke test 통과 후:

- [ ] 외부에서 `https://v2.stockalarm.co.kr`에 접속 가능
- [ ] Google 로그인 성공
- [ ] 알림 1개 생성 → 대시보드 표시 확인
- [ ] UptimeRobot "Up" 상태
- [ ] 라즈베리파이 `docker stats`로 리소스 사용량 확인 (app 메모리 200~400MB 예상)

이 단계까지 완료되면 v2 서비스가 서브도메인에서 정상 운영되는 상태. **legacy 서비스는 계속 병렬 운영 중**이므로 가족들에게 안내 전 검증 기간을 둔다 (권장: 최소 3~7일).

검증 기간 안정화 확인 후 섹션 3.6(legacy 전환) + 섹션 4.7(OAuth URI 정리) + 섹션 5.5(UptimeRobot URL 변경) 수행.

---

## 7. 해킹 인지 시 1차 대응 절차

의심 징후 발견 시 **침착함 + 속도**가 동시에 중요하다. 이 섹션은 "첫 10분"에 취할 행동을 정해둔 것이다. 원인 분석과 복구는 그 다음 단계.

### 7.1 의심 징후의 예

다음 중 하나라도 해당되면 "해킹 의심" 상태로 간주하고 7.2로 이동한다.

- 등록하지 않은 관리자 계정이 보인다
- 가족이 받지 않은 시점에 알림 메일이 발송되었다는 보고를 받았다
- UptimeRobot이 정상인데 로그인 또는 페이지 동작이 비정상이다
- 서버 로그에 익숙하지 않은 IP에서의 집중 접근이 보인다
- AWS/Cloudflare/Google/OpenAI 등으로부터 "비정상 사용량" 경고 메일을 받았다
- OpenAI API 사용량이 갑자기 급증한다 (API key 유출 징후)
- GitHub에서 의심스러운 로그인/push 알림이 온다
- 라즈베리파이 CPU/메모리 사용량이 장시간 비정상적으로 높다 (채굴 등 목적의 침입 징후)

### 7.2 1차 대응 — 즉시 격리 (첫 5분)

**목표**: 추가 피해 차단. 진상 규명은 나중.

**단계 1: 외부 접근 차단 (최우선)**

Cloudflare Tunnel을 중단하면 외부 인터넷에서 서비스로 접근할 수 없다. 공격자도 차단된다.

라즈베리파이에서:

```bash
cd $HOME/stock-alarm
docker compose --env-file .env.prod -f docker-compose.prod.yml stop cloudflared
```

앱은 여전히 돌고 있으므로 내부에서 로그 수집 가능. **데이터 삭제가 의심되면 컨테이너 전체를 중단하지 말 것** — 실행 중 프로세스/메모리를 보존해야 포렌식 가능.

**단계 2: 자격증명 무효화**

아래 항목을 **순서대로** 무효화한다. 하나라도 건너뛰면 공격자가 우회 경로로 복귀할 수 있다.

1. **Cloudflare Tunnel 재생성**:
   - Zero Trust 대시보드 → Networks → Tunnels → 해당 tunnel 삭제
   - 신규 tunnel 생성 (섹션 3.2 참조)
   - 새 token을 아직 적용하지 않음 (7.3 복구 단계에서 적용)

2. **Google OAuth Client Secret 재발급**:
   - Google Cloud Console → Credentials → 해당 Client → **Add secret**
   - 기존 secret **삭제**

3. **NextAuth Secret 재생성**:
   - `openssl rand -base64 32` 실행, 결과 보관

4. **DB 비밀번호 변경**:
   - PostgreSQL에 직접 접속해 변경:
     ```bash
     docker compose --env-file .env.prod -f docker-compose.prod.yml exec db \
       psql -U $DB_USER -d $DB_NAME -c "ALTER USER stockalarm_user WITH PASSWORD 'new-strong-password';"
     ```
   - `.env.prod`의 `DB_PASSWORD`를 새 값으로 갱신

5. **Gmail 앱 비밀번호 재발급**:
   - Google 계정 → 보안 → 앱 비밀번호 → 기존 것 삭제, 신규 발급

6. **OpenAI API Key 재발급** (사용 중인 경우):
   - OpenAI 대시보드 → API Keys → 기존 키 revoke → 신규 발급

7. **GitHub Personal Access Token 점검** (사용 중인 경우):
   - GitHub Settings → Developer settings → PAT → 의심스러운 것 revoke

**단계 3: 증거 보존**

원인 분석을 위한 로그 스냅샷을 먼저 저장한 뒤 재기동한다.

```bash
mkdir -p $HOME/incident-$(date +%Y%m%d-%H%M)
cd $HOME/incident-$(date +%Y%m%d-%H%M)

docker compose --env-file $HOME/stock-alarm/.env.prod \
  -f $HOME/stock-alarm/docker-compose.prod.yml \
  logs --no-color > all-services.log

docker logs stockalarm-app     > app.log     2>&1
docker logs stockalarm-nginx   > nginx.log   2>&1
docker logs stockalarm-db      > db.log      2>&1
docker logs stockalarm-cloudflared > cloudflared.log 2>&1

# 이 디렉토리를 외부 저장소(암호화된 USB 등)에 복사 보관
```

### 7.3 2차 대응 — 조사 및 복구 (다음 수 시간)

**조사**:

- 수집한 로그에서 비정상 접근 패턴 식별 (익숙하지 않은 IP, 비정상 User-Agent, 비정상 시간대 요청)
- DB에서 의심 데이터 식별:
  ```bash
  docker compose --env-file .env.prod -f docker-compose.prod.yml exec db \
    psql -U $DB_USER -d $DB_NAME
  # 예: 최근 1시간 내 User 테이블 변화 확인
  ```
- GitHub 커밋 히스토리에 의심스러운 push가 있는지 확인

**복구 판단 기준**:

| 상황 | 조치 |
|------|------|
| 자격증명 유출만, DB 조작 없음 | 7.2의 credential 교체만으로 충분. 재기동 |
| DB 데이터 변조 의심 | 백업에서 복원 (별도 백업 런북 수립 필요) |
| 코드베이스 변조 의심 (GitHub에 모르는 커밋) | 해당 커밋 revert → force push → 재배포 |
| 침해 범위 판단 불가 | 전체 재구축: DB 볼륨 삭제, 이미지 재빌드, 새 계정으로 OAuth Client 재생성 |

### 7.4 재기동

자격증명 교체 및 증거 보존 완료 후:

1. `.env.prod`가 모든 새 값으로 갱신되었는지 재확인 (TUNNEL_TOKEN 포함)
2. 필요시 새 이미지로 재빌드:
   ```bash
   docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
   ```
3. 섹션 6.5~6.6 smoke test 재수행

### 7.5 사후 조치

**법적 의무 (한국 개인정보보호법 제34조)**

근거: 개인정보보호법 제34조(개인정보 유출 등의 통지·신고), 시행령 제39조, 제40조

**1. 정보주체(사용자) 통지 의무**

개인정보 유출을 인지한 시점부터 72시간 이내에 해당 사용자에게 서면, 이메일, 팩스, 전화, 문자 등의 방법으로 통지해야 한다. 통지 내용:

- 유출된 개인정보 항목
- 유출 시점 및 경위
- 피해 최소화를 위해 사용자가 취할 수 있는 조치
- 개인정보처리자의 대응 조치 및 피해 구제 절차
- 문의 접수 연락처

경위 등 일부 사항을 72시간 내 확인 못 한 경우, 확인된 내용만 우선 통지하고 나머지는 확인 즉시 추가 통지할 수 있다.

**2. 개인정보보호위원회/한국인터넷진흥원(KISA) 신고 의무**

다음 중 하나라도 해당되면 72시간 이내에 개인정보보호위원회 또는 한국인터넷진흥원에 신고해야 한다:

- 1,000명 이상의 정보주체 개인정보 유출
- 민감정보 또는 고유식별정보 유출
- **개인정보처리시스템에 대한 외부의 불법적 접근에 의한 유출**

**주의**: Stock Alarm은 가족 서비스라 "1,000명 이상" 조건엔 해당하지 않지만, **해킹에 의한 유출은 세 번째 조건("외부의 불법적 접근")에 해당하므로 유출 인원과 관계없이 신고 의무가 발동**된다. 즉 가족 1명이라도 OAuth 계정이 유출됐다면 신고 대상.

**3. 신고 면제 조건 (예외)**

유출 경로가 확인되어 해당 개인정보를 회수·삭제하는 등의 조치로 정보주체의 권익 침해 가능성이 현저히 낮아진 경우 신고하지 않을 수 있다.

이 면제를 적용받으려면 회수·삭제 조치 내용과 근거를 문서화해두는 것이 좋다.

**4. 과태료**

미신고 시 개인정보보호법 제75조 제2항 제18호에 따라 3천만원 이하의 과태료가 부과된다.

**5. 신고 방법**

- 개인정보보호위원회 유출신고 사이트: <https://www.pipc.go.kr> (대시보드 → 개인정보 유출신고)
- 한국인터넷진흥원(KISA): <https://www.kisa.or.kr>

**6. 법령 최신성 재확인 필수**

개인정보보호법은 2026년 9월 11일 개정 시행 예정이며 이후에도 주기적으로 개정된다. **실제 사고 발생 시 반드시 최신 법령을 재확인**할 것. 위 내용은 이 런북 작성 시점의 이해에 기반한 참고 사항이며 법률 자문이 아니다. 실제 사고 시 개인정보보호 전문 변호사 또는 개인정보보호위원회에 직접 문의할 것을 권장한다.

**재발 방지**:

- 공격 경로 분석 결과를 기반으로 보안 체크리스트 업데이트
- 해당 경로에 대한 방어책을 백로그에 추가 (예: WAF 규칙, Rate limit 강화, 2FA 도입)

### 7.6 평시 준비

해킹이 발생한 **후**에 이 런북을 처음 읽으면 늦다. 평시에 다음을 준비해둔다:

- [ ] Cloudflare / Google / Gmail / OpenAI / GitHub 계정 **복구 이메일/전화번호 최신화**
- [ ] 위 각 계정에 **2단계 인증** 활성화
- [ ] DB 자동 백업 스케줄 동작 (세션 2 이후)
- [ ] 백업 복구 리허설 경험 (별도 백업 런북 수립 이후)
- [ ] 이 런북을 **오프라인에서도 접근 가능한 위치**(예: 종이 인쇄본, 다른 기기의 암호화 저장소)에 복사 보관 — 서버 해킹 시 GitHub에 접근 못 할 수 있음

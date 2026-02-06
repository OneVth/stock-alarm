#!/bin/bash
# Stock Alarm 배포 스크립트
# 사용법: ./deploy/setup.sh

set -e

echo "=========================================="
echo "Stock Alarm 배포 스크립트"
echo "=========================================="

PROJECT_DIR="/home/onev/stock-alarm"
SERVICE_NAME="stock-alarm"

# 1. 프로젝트 디렉토리 확인
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[ERROR] 프로젝트 디렉토리가 없습니다: $PROJECT_DIR"
    echo "먼저 git clone을 실행하세요:"
    echo "  git clone <repository-url> $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# 2. 로그 디렉토리 생성
echo "[1/7] 로그 디렉토리 생성..."
mkdir -p logs data

# 3. 의존성 설치
echo "[2/7] Python 의존성 설치..."
uv sync

# 4. .env 파일 확인
if [ ! -f ".env" ]; then
    echo "[WARNING] .env 파일이 없습니다."
    echo ".env.example을 참고하여 .env 파일을 생성하세요."
    echo ""
    cat .env.example
    echo ""
    read -p ".env 파일을 생성한 후 Enter를 누르세요..."
fi

# 5. systemd 서비스 설치
echo "[3/7] systemd 서비스 설치..."
sudo cp deploy/stock-alarm.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

# 6. Nginx 설정
echo "[4/7] Nginx 설정..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/$SERVICE_NAME
sudo ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. 서비스 시작
echo "[5/7] Flask 서비스 시작..."
sudo systemctl restart $SERVICE_NAME
sleep 2
sudo systemctl status $SERVICE_NAME --no-pager

# 8. cron 작업 안내
echo "[6/7] Cron 작업 설정..."
echo "아래 명령어로 cron 작업을 추가하세요:"
echo "  crontab -e"
echo ""
echo "추가할 내용:"
cat deploy/crontab
echo ""

# 9. Cloudflare Tunnel 안내
echo "[7/7] Cloudflare Tunnel 설정..."
echo "Cloudflare Zero Trust 대시보드에서 발급받은 토큰으로 실행:"
echo "  cloudflared tunnel run --token <YOUR_TOKEN>"
echo ""
echo "서비스로 등록하려면:"
echo "  sudo cloudflared service install <YOUR_TOKEN>"
echo ""

echo "=========================================="
echo "배포 완료!"
echo "=========================================="
echo ""
echo "서비스 상태 확인: sudo systemctl status $SERVICE_NAME"
echo "로그 확인: sudo journalctl -u $SERVICE_NAME -f"
echo "접속 테스트: curl http://localhost:5000"

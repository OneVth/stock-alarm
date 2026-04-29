#!/bin/bash
#
# Stock Alarm v2 - DB 백업 스크립트
#
# 기능:
#   1. db 컨테이너에서 pg_dump로 덤프 추출
#   2. gzip 압축해 backups/stockalarm-YYYY-MM-DD.sql.gz 로 저장
#   3. 7일 이상 된 백업 자동 삭제
#
# 사용법: bash scripts/db-backup.sh
# cron 등록: 매일 02:00 실행 (deploy/crontab 참조)

set -euo pipefail

# ===== 설정 =====
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
RETENTION_DAYS=7
TIMESTAMP="$(date +%Y-%m-%d)"
BACKUP_FILE="${BACKUP_DIR}/stockalarm-${TIMESTAMP}.sql.gz"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env.prod"

# ===== 전제 조건 =====
if [ ! -f "${ENV_FILE}" ]; then
  echo "[db-backup] ERROR: .env.prod 파일이 없습니다: ${ENV_FILE}" >&2
  exit 1
fi

# .env.prod에서 DB_USER, DB_NAME 추출 (주석/공백 무시)
DB_USER="$(grep -E '^DB_USER=' "${ENV_FILE}" | cut -d= -f2- | tr -d '"' | tr -d "'")"
DB_NAME="$(grep -E '^DB_NAME=' "${ENV_FILE}" | cut -d= -f2- | tr -d '"' | tr -d "'")"

if [ -z "${DB_USER}" ] || [ -z "${DB_NAME}" ]; then
  echo "[db-backup] ERROR: DB_USER 또는 DB_NAME을 .env.prod에서 읽을 수 없습니다" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo "[db-backup] 시작: ${TIMESTAMP}"

# ===== 덤프 추출 + gzip =====
# 실패 시 부분 파일 삭제
trap 'rm -f "${BACKUP_FILE}"' ERR

docker compose -p stock-alarm-v2 --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T db \
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" --no-owner --no-privileges \
  | gzip > "${BACKUP_FILE}"

# 생성된 파일이 0 바이트가 아닌지 확인
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "[db-backup] ERROR: 백업 파일이 0 바이트입니다" >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "[db-backup] 저장 완료: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ===== 오래된 백업 삭제 =====
DELETED_COUNT=0
while IFS= read -r -d '' old_file; do
  rm -f "${old_file}"
  echo "[db-backup] 삭제: $(basename "${old_file}")"
  DELETED_COUNT=$((DELETED_COUNT + 1))
done < <(find "${BACKUP_DIR}" -maxdepth 1 -name 'stockalarm-*.sql.gz' -mtime +${RETENTION_DAYS} -print0)

echo "[db-backup] 완료 (삭제된 파일: ${DELETED_COUNT}개)"

#!/bin/bash

# 개발 환경 정리 스크립트

echo "🧹 개발 환경을 정리합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. 백엔드 프로세스 종료
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        log_info "백엔드 프로세스를 종료합니다 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm backend.pid
        log_success "백엔드 프로세스 종료 완료"
    else
        log_warning "백엔드 프로세스가 이미 종료되었습니다"
        rm backend.pid
    fi
fi

# 2. 8080 포트 사용 프로세스 강제 종료
log_info "8080 포트 사용 프로세스를 확인하고 종료합니다..."
PORT_8080_PID=$(lsof -ti:8080 2>/dev/null)
if [ -n "$PORT_8080_PID" ]; then
    log_info "8080 포트 사용 프로세스 종료 (PID: $PORT_8080_PID)..."
    kill -9 $PORT_8080_PID
    log_success "8080 포트 프로세스 종료 완료"
else
    log_info "8080 포트 사용 프로세스가 없습니다."
fi

# 2. Docker 서비스 정리
log_info "Docker 서비스들을 정리합니다..."
docker-compose -f docker-compose.local.yml down

# 3. 프론트엔드 node_modules 정리 (선택사항)
read -p "프론트엔드 node_modules도 삭제하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "프론트엔드 node_modules를 삭제합니다..."
    rm -rf frontend/node_modules
    log_success "node_modules 삭제 완료"
fi

# 4. 로그 파일 정리
if [ -f "backend.log" ]; then
    log_info "백엔드 로그 파일을리합니다..."
    rm backend.log
    log_success "로그 파일 삭제 완료"
fi

log_success "개발 환경 정리 완료!"

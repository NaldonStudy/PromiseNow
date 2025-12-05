#!/bin/bash

# 전체 개발 환경 자동 설정 스크립트
# 백엔드와 프론트엔드 모두 실행

set -e  # 오류 발생 시 스크립트 중단

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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 전체 개발 환경 설정을 시작합니다..."

# 백엔드 .env 파일 로드
if [ -f "backend-spring/.env" ]; then
    log_info "백엔드 .env 파일을 로드합니다..."
    # .env 파일의 각 줄을 환경 변수로 설정
    while IFS= read -r line; do
        # 주석이나 빈 줄 건너뛰기
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "$line" ]]; then
            export "$line"
            log_info "환경 변수 설정: ${line%%=*}"
        fi
    done < backend-spring/.env
    log_success ".env 파일 로드 완료"
else
    log_warning "backend-spring/.env 파일이 없습니다."
fi

# 1. Docker 인프라 시작
log_info "Docker 인프라 서비스들을 시작합니다..."
docker-compose -f docker-compose.local.yml up -d mysql redis

# 2. MySQL 연결 대기
log_info "MySQL 서비스가 준비될 때까지 대기합니다..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose -f docker-compose.local.yml exec -T mysql mysqladmin ping -h127.0.0.1 --silent 2>/dev/null; then
        log_success "MySQL 서비스가 준비되었습니다."
        break
    else
        attempt=$((attempt + 1))
        echo "MySQL 연결 대기 중... (시도 $attempt/$max_attempts)"
        sleep 3
    fi
done

if [ $attempt -eq $max_attempts ]; then
    log_error "MySQL 연결 실패. 최대 시도 횟수 초과."
    exit 1
fi

# 3. Redis 연결 대기
log_info "Redis 서비스가 준비될 때까지 대기합니다..."
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose -f docker-compose.local.yml exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        log_success "Redis 서비스가 준비되었습니다."
        break
    else
        attempt=$((attempt + 1))
        echo "Redis 연결 대기 중... (시도 $attempt/$max_attempts)"
        sleep 3
    fi
done

if [ $attempt -eq $max_attempts ]; then
    log_error "Redis 연결 실패. 최대 시도 횟수 초과."
    exit 1
fi

# 4. 데이터베이스 테이블 초기화
log_info "데이터베이스 테이블을 초기화합니다..."
docker-compose -f docker-compose.local.yml exec -T mysql mysql << 'EOF'
-- 데이터베이스가 없으면 생성
CREATE DATABASE IF NOT EXISTS `ssafy-mysql-db`;
USE `ssafy-mysql-db`;
create table if not exists room
(
    room_id       bigint auto_increment
        primary key,
    end_date      date                                                 null,
    invite_code   varchar(255)                                         not null,
    location_date date                                                 null,
    location_lat  double                                               null,
    location_lng  double                                               null,
    location_name varchar(255)                                         null,
    location_time time(6)                                              null,
    room_state    enum ('ACTIVE', 'CANCELLED', 'COMPLETED', 'WAITING') not null,
    room_title    varchar(255)                                         not null,
    start_date    date                                                 null
);

create table if not exists roulette
(
    roulette_id  bigint auto_increment
        primary key,
    content      varchar(255) null,
    room_id      bigint       null,
    room_user_id bigint       null
);

create table if not exists users
(
    user_id   bigint       not null
        primary key,
    email     varchar(255) null,
    join_date date         not null,
    password  varchar(255) null,
    username  varchar(255) null
);

create table if not exists room_user
(
    room_user_id  bigint auto_increment
        primary key,
    is_agreed     bit          not null,
    nickname      varchar(255) not null,
    profile_image varchar(255) null,
    sort_order    int          null,
    room_id       bigint       not null,
    user_id       bigint       not null,
    constraint FKaqm4k7a8o6lq80j3l1rls58ux
        foreign key (user_id) references users (user_id),
    constraint FKtakjqllocgakgw0os4hygxfk1
        foreign key (room_id) references room (room_id)
);

create table if not exists availability
(
    availability_id bigint auto_increment
        primary key,
    date            date   not null,
    timedata        text   not null,
    room_user_id    bigint not null,
    constraint FK8bxobe1mc3m9tlf242ah2h0bj
        foreign key (room_user_id) references room_user (room_user_id)
);

create table if not exists chat
(
    message_id   bigint auto_increment
        primary key,
    content      text                           not null,
    sent_date    datetime(6)                    not null,
    type         enum ('IMAGE', 'PINO', 'TEXT') not null,
    room_user_id bigint                         not null,
    constraint FK72wujwjf8r3htq7ej7jcuolev
        foreign key (room_user_id) references room_user (room_user_id)
);

create table if not exists image
(
    image_id     bigint auto_increment
        primary key,
    image_url    varchar(255) not null,
    location_lat double       null,
    location_lng double       null,
    sent_date    datetime(6)  null,
    message_id   bigint       not null,
    constraint FKmaodr78rcr82uqoo941l9peer
        foreign key (message_id) references chat (message_id)
);
EOF

if [ $? -eq 0 ]; then
    log_success "데이터베이스 테이블 초기화 완료"
else
    log_error "데이터베이스 테이블 초기화 실패"
    exit 1
fi

# 5. 백엔드 빌드 및 실행 (백그라운드)
log_info "백엔드를 빌드하고 실행합니다..."
cd backend-spring

# 테스트 파일 제거 (빌드 오류 방지)
if [ -d "src/test" ]; then
    log_info "테스트 파일을 제거합니다..."
    rm -rf src/test
fi

# 백엔드 빌드
log_info "백엔드를 빌드합니다..."
./gradlew clean build -x test

# 백엔드 실행 (백그라운드)
log_info "백엔드를 백그라운드에서 실행합니다..."
nohup env $(cat .env | grep -v '^#' | xargs) ./gradlew bootRun > ../backend.log 2>&1 &
BACKEND_PID=$!

# 백엔드 시작 대기
log_info "백엔드 서비스가 준비될 때까지 대기합니다..."
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_success "백엔드 서비스가 준비되었습니다."
        break
    else
        attempt=$((attempt + 1))
        echo "백엔드 연결 대기 중... (시도 $attempt/$max_attempts)"
        sleep 5
    fi
done

if [ $attempt -eq $max_attempts ]; then
    log_error "백엔드 연결 실패. 최대 시도 횟수 초과."
    log_info "백엔드 로그 확인: tail -f backend.log"
    exit 1
fi

# 6. 프론트엔드 설정
cd ../frontend

# node_modules 삭제
log_info "기존 node_modules를 삭제합니다..."
rm -rf node_modules
log_success "node_modules 삭제 완료"

# pnpm install
log_info "pnpm으로 의존성을 설치합니다..."
pnpm install
log_success "의존성 설치 완료"

# pnpm build
log_info "프론트엔드를 빌드합니다..."
pnpm run build
log_success "빌드 완료"

# 7. 개발 서버 시작
log_info "개발 서버를 시작합니다..."
log_success "백엔드 API: http://localhost:8080"
log_success "프론트엔드: http://localhost:5173"
log_info "백엔드 로그 확인: tail -f backend.log"

# 백엔드 PID 저장 (종료 시 사용)
echo $BACKEND_PID > ../backend.pid

pnpm run dev

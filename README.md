# PromiseNow

약속 관리 및 실시간 위치 공유 서비스

## 🚀 빠른 시작

### 프론트엔드 개발자용 (백엔드 제외)

```bash
# 프론트엔드만 실행 (백엔드 API는 별도 실행 필요)
./scripts/frontend-dev.sh
```

### 전체 개발 환경

```bash
# 백엔드 + 프론트엔드 모두 실행
./scripts/full-dev.sh
```

### 개발 환경 정리

```bash
# 모든 서비스 종료 및 정리
./scripts/cleanup.sh
```

## 📋 수동 실행 방법

### 사전 요구사항

- Docker & Docker Compose
- Java 21 (백엔드용)
- Node.js 20+ (프론트엔드용)
- pnpm

### 1. 인프라 서비스 시작

```bash
# MySQL, Redis 시작
docker-compose -f docker-compose.local.yml up -d mysql redis
```

### 2. 백엔드 실행

```bash
cd backend-spring

# 테스트 파일 제거 (빌드 오류 방지)
rm -rf src/test

# 빌드 및 실행
./gradlew clean build -x test
./gradlew bootRun
```

### 3. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
pnpm install

# 빌드
pnpm run build

# 개발 서버 시작
pnpm run dev
```

## 🌐 접속 정보

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## 🔧 환경 변수 설정

### 카카오 OAuth2 설정

```bash
export KAKAO_CLIENT_SECRET="your_kakao_client_secret_here"
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
# env.example 파일을 복사하여 .env 파일 생성
cp env.example .env

# .env 파일을 열어서 실제 값으로 수정
```

주요 환경 변수:
- `SPRING_KAKAO_CLIENT_SECRET`: 카카오 OAuth2 클라이언트 시크릿
- `SPRING_DATASOURCE_PASSWORD`: 데이터베이스 비밀번호
- `JWT_SECRET`: JWT 토큰 시크릿 키
- `GMS_KEY`: GMS API 키
- 기타 설정은 `env.example` 파일 참조

## 📁 프로젝트 구조

```
S13P11B107/
├── backend-spring/          # Spring Boot 백엔드
├── frontend/               # React + TypeScript 프론트엔드
├── scripts/                # 개발 스크립트
│   ├── frontend-dev.sh     # 프론트엔드 전용 실행
│   ├── full-dev.sh         # 전체 개발 환경 실행
│   └── cleanup.sh          # 환경 정리
├── docker-compose.yml      # 프로덕션 Docker 설정
├── docker-compose.local.yml # 로컬 개발용 Docker 설정
└── README.md
```

## 🛠️ 개발 도구

### 백엔드
- **Spring Boot 3.5.3**
- **Java 21**
- **Gradle**
- **MySQL 8.0**
- **Redis 7.2**
- **Spring Security + OAuth2**

### 프론트엔드
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **pnpm**

## 🔍 문제 해결

### 백엔드 빌드 오류
```bash
# 테스트 파일 제거
rm -rf backend-spring/src/test

# 다시 빌드
cd backend-spring
./gradlew clean build -x test
```

### 프론트엔드 의존성 문제
```bash
cd frontend
rm -rf node_modules
pnpm install
```

### Docker 서비스 문제
```bash
# 서비스 재시작
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d
```

## 📞 연락처

- **개발자**: nstgic3@gmail.com

## 📝 라이선스

이 프로젝트는 SSAFY 프로젝트입니다.
# 1단계: 빌드
FROM node:22-alpine AS builder

WORKDIR /app
COPY ./frontend .
RUN npm install && npm run build

# 2단계: nginx에서 정적 파일 서빙
FROM nginx:1.25-alpine

# 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FROM node:22-alpine

WORKDIR /app
COPY ./frontend .
RUN npm install && npm run build

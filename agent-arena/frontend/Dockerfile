# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY frontend/package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY frontend .
RUN npm run build

# 프로덕션 이미지
FROM nginx:alpine

# Nginx 설정
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

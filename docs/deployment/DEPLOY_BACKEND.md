# 백엔드 서버 배포 가이드 (VPS + PM2 + Nginx)

이 가이드는 VPS 서버에 Node.js 백엔드를 PM2와 Nginx를 사용하여 배포하는 방법을 설명합니다.

## 사전 요구사항

- Ubuntu 20.04+ 또는 Debian 11+ 서버
- Node.js 18+ 설치됨
- Nginx 설치됨
- MongoDB 설치됨 또는 MongoDB Atlas 계정
- 도메인 DNS 설정 완료 (api.scorelivenow.com → 서버 IP)

---

## 1단계: 서버 준비

### 1.1 Node.js 설치 확인

```bash
node --version  # v18.0.0 이상
npm --version
```

### 1.2 PM2 설치

```bash
npm install -g pm2
pm2 --version
```

### 1.3 프로젝트 디렉토리 생성

```bash
# 홈 디렉토리에 프로젝트 폴더 생성
mkdir -p ~/livescore-server
cd ~/livescore-server
```

---

## 2단계: 코드 배포

### 2.1 Git을 통한 배포 (권장)

```bash
# Git 저장소 클론
git clone https://github.com/your-username/livescore.git .
cd server

# 또는 기존 저장소 업데이트
cd ~/livescore-server/server
git pull origin main
```

### 2.2 수동 업로드 (대안)

FTP/SFTP로 `server/` 디렉토리 내용을 `~/livescore-server/server/`에 업로드

---

## 3단계: 의존성 설치 및 빌드

### 3.1 의존성 설치

```bash
cd ~/livescore-server/server
npm ci  # 또는 npm install
```

⚠️ **중요**: `node_modules`는 서버에서 설치합니다. Git에 커밋하거나 업로드하지 마세요.

### 3.2 TypeScript 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

---

## 4단계: 환경변수 설정

### 4.1 .env 파일 생성

```bash
cd ~/livescore-server/server
cp .env.production.example .env
nano .env  # 또는 vi .env
```

### 4.2 환경변수 설정

다음 값들을 실제 값으로 변경:

```bash
PORT=5000

# JWT_SECRET 생성 (강력한 랜덤 문자열)
# openssl rand -base64 32 명령어로 생성 가능
JWT_SECRET=your-generated-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d

# CORS 설정 (프론트엔드 도메인)
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
FRONTEND_URL=https://scorelivenow.com

# MongoDB 연결 문자열
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/livescore
# 또는
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/livescore

# 이메일 설정 (선택사항)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

NODE_ENV=production
```

⚠️ **보안**: `.env` 파일은 절대 Git에 커밋하지 마세요!

### 4.3 파일 권한 설정

```bash
chmod 600 .env  # 소유자만 읽기/쓰기 가능
```

---

## 5단계: PM2 설정 및 실행

### 5.1 로그 디렉토리 생성

```bash
mkdir -p ~/livescore-server/server/logs
```

### 5.2 PM2로 앱 시작

```bash
cd ~/livescore-server/server
pm2 start ecosystem.config.js --env production
```

### 5.3 PM2 상태 확인

```bash
pm2 status
pm2 logs livescore-api  # 로그 확인
```

### 5.4 PM2 자동 시작 설정

```bash
# PM2가 시스템 부팅 시 자동으로 시작되도록 설정
pm2 save
pm2 startup

# 출력된 명령어를 실행 (예: sudo env PATH=... pm2 startup systemd -u username --hp /home/username)
```

---

## 6단계: Nginx 설정

### 6.1 SSL 인증서 발급 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d api.scorelivenow.com
```

### 6.2 Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/scorelivenow-api
```

다음 내용을 붙여넣기 (SSL 인증서 경로는 실제 경로로 수정):

```nginx
upstream livescore_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.scorelivenow.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.scorelivenow.com;

    ssl_certificate /etc/letsencrypt/live/api.scorelivenow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.scorelivenow.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/scorelivenow-api-access.log;
    error_log /var/log/nginx/scorelivenow-api-error.log;

    # Socket.io WebSocket 프록시
    location /socket.io/ {
        proxy_pass http://livescore_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
        proxy_buffering off;
    }

    # API 엔드포인트 프록시
    location /api/ {
        proxy_pass http://livescore_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        return 404;
    }
}
```

### 6.3 Nginx 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/scorelivenow-api /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

---

## 7단계: 방화벽 설정

### 7.1 UFW 방화벽 설정

```bash
# SSH, HTTP, HTTPS 허용
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 방화벽 활성화
sudo ufw enable
sudo ufw status
```

---

## 8단계: 배포 확인

### 8.1 헬스체크

```bash
# 로컬에서 확인
curl http://localhost:5000/api/health

# 외부에서 확인
curl https://api.scorelivenow.com/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 8.2 Socket.io 연결 테스트

브라우저 콘솔에서:
```javascript
const socket = io('https://api.scorelivenow.com');
socket.on('connect', () => console.log('Connected!'));
```

### 8.3 PM2 모니터링

```bash
pm2 monit  # 실시간 모니터링
pm2 logs livescore-api  # 로그 확인
pm2 status  # 상태 확인
```

---

## 9단계: 업데이트 절차

코드 업데이트 시:

```bash
# 1. 코드 업데이트
cd ~/livescore-server/server
git pull origin main  # 또는 새 파일 업로드

# 2. 의존성 업데이트 (필요시)
npm ci

# 3. 빌드
npm run build

# 4. PM2 재시작
pm2 restart livescore-api

# 5. 로그 확인
pm2 logs livescore-api --lines 50
```

---

## 문제 해결

### PM2 관련

```bash
# 앱 재시작
pm2 restart livescore-api

# 앱 중지
pm2 stop livescore-api

# 앱 삭제
pm2 delete livescore-api

# 모든 로그 확인
pm2 logs

# 특정 앱 로그만 확인
pm2 logs livescore-api
```

### Nginx 관련

```bash
# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx

# 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/scorelivenow-api-error.log
```

### MongoDB 연결 문제

```bash
# MongoDB 연결 테스트
mongosh "mongodb+srv://username:password@cluster.mongodb.net/livescore"

# 또는 로컬 MongoDB
mongosh mongodb://localhost:27017/livescore
```

### 포트 충돌

```bash
# 포트 5000 사용 중인 프로세스 확인
sudo lsof -i :5000
# 또는
sudo netstat -tulpn | grep 5000

# 프로세스 종료
sudo kill -9 <PID>
```

---

## 보안 체크리스트

- [ ] `.env` 파일이 Git에 커밋되지 않았는지 확인
- [ ] `.env` 파일 권한이 600인지 확인 (`chmod 600 .env`)
- [ ] `JWT_SECRET`이 강력한 랜덤 문자열인지 확인
- [ ] MongoDB 연결 문자열에 비밀번호가 포함되어 있는지 확인
- [ ] Nginx SSL 인증서가 유효한지 확인
- [ ] 방화벽이 올바르게 설정되었는지 확인
- [ ] PM2가 프로덕션 모드로 실행 중인지 확인
- [ ] `node_modules`가 Git에 커밋되지 않았는지 확인

---

## 모니터링 및 유지보수

### 로그 확인

```bash
# PM2 로그
pm2 logs livescore-api

# Nginx 로그
sudo tail -f /var/log/nginx/scorelivenow-api-access.log
sudo tail -f /var/log/nginx/scorelivenow-api-error.log

# 시스템 로그
journalctl -u nginx -f
```

### 성능 모니터링

```bash
# PM2 모니터링
pm2 monit

# 시스템 리소스 확인
htop
# 또는
top
```

### 백업

```bash
# MongoDB 백업 (MongoDB Atlas 사용 시 자동 백업)
# 로컬 MongoDB 백업
mongodump --uri="mongodb://localhost:27017/livescore" --out=/backup/livescore-$(date +%Y%m%d)

# 코드 백업
tar -czf ~/backup/livescore-server-$(date +%Y%m%d).tar.gz ~/livescore-server
```

---

## 요약

### 배포 순서

1. ✅ 서버 준비 (Node.js, PM2 설치)
2. ✅ 코드 배포 (Git clone 또는 업로드)
3. ✅ 의존성 설치 (`npm ci`)
4. ✅ 빌드 (`npm run build`)
5. ✅ 환경변수 설정 (`.env` 파일)
6. ✅ PM2 시작 (`pm2 start ecosystem.config.js --env production`)
7. ✅ PM2 자동 시작 설정 (`pm2 save`, `pm2 startup`)
8. ✅ Nginx 설정 및 SSL 인증서 발급
9. ✅ Nginx 재시작 (`sudo systemctl reload nginx`)
10. ✅ 헬스체크 확인 (`curl https://api.scorelivenow.com/api/health`)

### 주요 명령어

```bash
# PM2
pm2 start ecosystem.config.js --env production
pm2 restart livescore-api
pm2 logs livescore-api
pm2 status

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# 빌드
npm run build
```

### 중요 파일 위치

- 프로젝트: `~/livescore-server/server/`
- 환경변수: `~/livescore-server/server/.env`
- PM2 설정: `~/livescore-server/server/ecosystem.config.js`
- Nginx 설정: `/etc/nginx/sites-available/scorelivenow-api`
- 로그: `~/livescore-server/server/logs/`

---

## 추가 리소스

- [PM2 공식 문서](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt 문서](https://letsencrypt.org/docs/)
- [Socket.io 배포 가이드](https://socket.io/docs/v4/production-checklist/)

# 백엔드 배포 설정 완료 요약

## 생성된 파일

### 1. PM2 설정
- **파일**: `server/ecosystem.config.js`
- **용도**: PM2로 프로세스 관리
- **실행**: `pm2 start ecosystem.config.js --env production`

### 2. Nginx 설정 예시
- **파일**: `server/nginx.conf.example`
- **용도**: Nginx reverse proxy 설정 참고
- **위치**: `/etc/nginx/sites-available/scorelivenow-api`

### 3. 환경변수 예시
- **파일**: `server/.env.production.example`
- **용도**: 프로덕션 환경변수 템플릿
- **주의**: 실제 `.env` 파일은 Git에 커밋하지 않음

### 4. 배포 가이드
- **파일**: `DEPLOY_BACKEND.md`
- **내용**: Step-by-step 배포 절차

### 5. CORS 가이드
- **파일**: `server/CORS_GUIDE.md`
- **내용**: CORS 설정 및 문제 해결

---

## 서버 실행 커맨드

### 개발 환경
```bash
npm run dev  # tsx watch src/index.ts
```

### 프로덕션 빌드
```bash
npm run build  # tsc (TypeScript 컴파일)
npm run start  # node dist/index.js
```

### PM2로 실행
```bash
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 환경변수 설정

`.env` 파일에 다음 변수 설정:

```bash
PORT=5000
JWT_SECRET=<강력한 랜덤 문자열, 최소 32자>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
FRONTEND_URL=https://scorelivenow.com
DATABASE_URL=mongodb+srv://...
NODE_ENV=production
```

---

## Nginx 설정 요약

### 주요 설정
- **API 프록시**: `/api/` → `localhost:5000`
- **Socket.io 프록시**: `/socket.io/` → `localhost:5000` (WebSocket 업그레이드)
- **SSL**: Let's Encrypt 인증서 사용
- **도메인**: `api.scorelivenow.com`

### WebSocket 설정
```nginx
location /socket.io/ {
    proxy_pass http://livescore_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... 기타 헤더
}
```

---

## CORS 설정

### 허용 도메인
- `https://scorelivenow.com`
- `https://www.scorelivenow.com`

### 설정 위치
- Express: `server/src/index.ts` (CORS 미들웨어)
- Socket.io: `server/src/index.ts` (Socket.io CORS 옵션)

### 환경변수
```bash
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
```

---

## 배포 체크리스트

### 사전 준비
- [ ] Node.js 18+ 설치
- [ ] PM2 설치 (`npm install -g pm2`)
- [ ] Nginx 설치
- [ ] MongoDB 연결 설정
- [ ] 도메인 DNS 설정 (api.scorelivenow.com)

### 배포 단계
- [ ] 코드 배포 (Git clone 또는 업로드)
- [ ] `npm ci` (의존성 설치)
- [ ] `npm run build` (TypeScript 빌드)
- [ ] `.env` 파일 생성 및 설정
- [ ] `pm2 start ecosystem.config.js --env production`
- [ ] `pm2 save` 및 `pm2 startup`
- [ ] Nginx 설정 파일 생성
- [ ] SSL 인증서 발급 (Let's Encrypt)
- [ ] Nginx 재시작
- [ ] 헬스체크 확인 (`curl https://api.scorelivenow.com/api/health`)

### 보안 확인
- [ ] `.env` 파일이 Git에 커밋되지 않았는지 확인
- [ ] `.env` 파일 권한 600 설정
- [ ] `JWT_SECRET`이 강력한 랜덤 문자열인지 확인
- [ ] MongoDB 연결 문자열에 비밀번호 포함 확인
- [ ] SSL 인증서 유효성 확인
- [ ] 방화벽 설정 확인

---

## 주요 명령어

### PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 restart livescore-api
pm2 stop livescore-api
pm2 logs livescore-api
pm2 status
pm2 monit
```

### Nginx
```bash
sudo nginx -t  # 설정 테스트
sudo systemctl reload nginx  # 재시작
sudo tail -f /var/log/nginx/scorelivenow-api-error.log  # 에러 로그
```

### 빌드 및 실행
```bash
npm ci
npm run build
npm run start
```

---

## 문제 해결

### PM2 앱이 시작되지 않음
- 로그 확인: `pm2 logs livescore-api`
- 환경변수 확인: `.env` 파일 존재 및 내용 확인
- 포트 충돌 확인: `sudo lsof -i :5000`

### Socket.io 연결 실패
- Nginx WebSocket 설정 확인
- CORS 설정 확인
- 브라우저 콘솔에서 연결 오류 확인

### CORS 오류
- `CORS_ORIGIN` 환경변수 확인
- 프론트엔드 도메인이 정확한지 확인
- Nginx 프록시 헤더 확인

---

## 참고 문서

- `DEPLOY_BACKEND.md`: 상세 배포 가이드
- `server/CORS_GUIDE.md`: CORS 설정 가이드
- `server/nginx.conf.example`: Nginx 설정 예시
- `server/ecosystem.config.js`: PM2 설정

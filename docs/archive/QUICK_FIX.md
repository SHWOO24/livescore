# 빠른 해결 방법

## 파일 업로드 후 업데이트가 안 될 때

### 백엔드 서버

```bash
# 1. 서버 디렉토리로 이동
cd ~/livescore-server/server

# 2. TypeScript 빌드 (소스 파일 수정 시 필수)
npm run build

# 3. PM2 재시작
pm2 restart livescore-api

# 4. 로그 확인
pm2 logs livescore-api --lines 20
```

### 프론트엔드

```bash
# 개발 환경
cd client
npm run dev  # 재시작

# 프로덕션 배포
cd client
npm run build
npm run deploy:prepare
# deploy/static/ 파일을 서버에 업로드
```

### 확인 방법

```bash
# 백엔드 헬스체크
curl http://localhost:5000/api/health

# 프론트엔드 (개발)
# 브라우저에서 http://localhost:3000 접속
# Ctrl+Shift+R (강력 새로고침)
```

---

## 가장 흔한 원인

1. **서버가 재시작되지 않음** → `pm2 restart livescore-api`
2. **빌드가 안 됨** → `npm run build`
3. **브라우저 캐시** → `Ctrl+Shift+R`

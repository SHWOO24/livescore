# 압축 해제 후 빠른 가이드

## 🚀 다음 단계 (간단 버전)

### 백엔드 서버 (VPS)

```bash
# 1. 파일 복사
cp -r server/* ~/livescore-server/server/

# 2. 서버 디렉토리로 이동
cd ~/livescore-server/server

# 3. 의존성 설치
npm ci

# 4. 빌드
npm run build

# 5. 환경변수 설정
cp .env.production.example .env
nano .env  # 실제 값으로 수정

# 6. PM2 실행
pm2 start ecosystem.config.js --env production

# 7. 확인
pm2 status
curl http://localhost:5000/api/health
```

### 프론트엔드 (Namecheap)

1. File Manager에서 `public_html/` 정리
2. `frontend/` 디렉토리 내용을 `public_html/`에 업로드
3. 브라우저에서 `Ctrl+Shift+R`

---

## ⚠️ 중요

- **백엔드**: `npm ci` + `npm run build` 필수!
- **프론트엔드**: `.htaccess` 파일 확인!

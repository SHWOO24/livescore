# 빠른 업데이트 가이드

## 압축 해제 후 반드시 해야 할 작업

### 백엔드 서버

```bash
# 1. 서버 디렉토리로 이동
cd server

# 2. 의존성 설치 (필수!)
npm ci

# 3. TypeScript 빌드 (필수!)
npm run build

# 4. PM2 재시작 (필수!)
pm2 restart livescore-api

# 또는 처음 시작하는 경우
pm2 delete livescore-api
pm2 start ecosystem.config.js --env production

# 5. 상태 확인
pm2 status
pm2 logs livescore-api --lines 20
```

### 프론트엔드 (Namecheap)

1. **File Manager에서 `public_html/` 정리**
   - 기존 파일 삭제 (또는 백업)

2. **`frontend/` 디렉토리 내용 업로드**
   - `index.html`
   - `.htaccess`
   - `assets/` 폴더
   - `robots.txt`, `sitemap.xml`

3. **브라우저에서 `Ctrl+Shift+R` (강력 새로고침)**

---

## 문제 해결

### "경기 정보가 없습니다"가 보이는 경우

**원인**: 백엔드 서버가 실행되지 않음

**해결**:
```bash
# 서버 상태 확인
pm2 status

# 서버가 없으면 시작
cd server
npm ci
npm run build
pm2 start ecosystem.config.js --env production

# 헬스체크
curl http://localhost:5000/api/health
```

### 변경사항이 안 보이는 경우

1. **백엔드**: `npm run build` + `pm2 restart` 했는가?
2. **프론트엔드**: 새 파일을 업로드했는가?
3. **브라우저**: `Ctrl+Shift+R` 했는가?

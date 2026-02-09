# 서버 업데이트 체크리스트

## ⚠️ 압축 해제 후 반드시 해야 할 작업

### 백엔드 서버 (VPS)

#### 1단계: 파일 확인
```bash
# 압축 해제한 위치에서
cd server

# 파일이 제대로 복사되었는지 확인
ls -la src/
ls -la package.json
```

#### 2단계: 의존성 설치 (필수!)
```bash
cd server
npm ci
# 또는
npm install
```

#### 3단계: TypeScript 빌드 (필수!)
```bash
npm run build
```

빌드 결과물 확인:
```bash
ls -la dist/
# dist/index.js 파일이 있어야 함
```

#### 4단계: 환경변수 확인
```bash
# .env 파일이 있는지 확인
ls -la .env

# 없으면 생성
cp .env.production.example .env
nano .env  # 실제 값으로 수정
```

#### 5단계: PM2 재시작 (필수!)
```bash
# 기존 프로세스 중지
pm2 delete livescore-api

# 새로 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status
pm2 logs livescore-api --lines 50
```

#### 6단계: 서버 상태 확인
```bash
# 헬스체크
curl http://localhost:5000/api/health

# 응답이 있어야 함:
# {"status":"ok","message":"Server is running"}
```

---

### 프론트엔드 (Namecheap Shared Hosting)

#### 1단계: 파일 확인
```bash
# 압축 해제한 frontend 디렉토리 확인
ls -la frontend/
# 다음 파일들이 있어야 함:
# - index.html
# - .htaccess
# - assets/
```

#### 2단계: public_html 정리
File Manager에서:
- 기존 파일 백업 (선택사항)
- **모든 기존 파일 삭제** (index.html, assets/ 등)

#### 3단계: 새 파일 업로드
`frontend/` 디렉토리의 **모든 내용**을 `public_html/`에 업로드:
- `index.html` → `public_html/index.html`
- `.htaccess` → `public_html/.htaccess`
- `assets/` → `public_html/assets/`
- `robots.txt` → `public_html/robots.txt`
- `sitemap.xml` → `public_html/sitemap.xml`

#### 4단계: 브라우저 캐시 클리어
- `Ctrl+Shift+R` (강력 새로고침)
- 또는 시크릿 모드에서 테스트

---

## 문제 진단

### "경기 정보가 없습니다" 메시지가 보이는 경우

**원인**: 백엔드 서버가 실행되지 않았거나 연결되지 않음

**해결**:
1. 백엔드 서버가 실행 중인지 확인:
   ```bash
   pm2 status
   curl http://localhost:5000/api/health
   ```

2. 프론트엔드 환경변수 확인:
   - `client/.env.production` 파일에 `VITE_API_BASE_URL`이 올바르게 설정되어 있는지
   - 빌드가 이 환경변수를 포함했는지 확인

3. 브라우저 콘솔 확인 (F12):
   - Network 탭에서 API 호출이 실패하는지 확인
   - Console 탭에서 오류 메시지 확인

### 변경사항이 반영되지 않는 경우

#### 백엔드
- [ ] `npm run build` 실행했는가?
- [ ] `pm2 restart livescore-api` 실행했는가?
- [ ] `pm2 logs`에서 오류가 없는가?

#### 프론트엔드
- [ ] `public_html/`에 새 파일을 업로드했는가?
- [ ] 브라우저 캐시를 클리어했는가?
- [ ] `.htaccess` 파일이 있는가?

---

## 빠른 해결 명령어

### 백엔드 전체 재배포
```bash
cd ~/livescore-server/server

# 1. 의존성 설치
npm ci

# 2. 빌드
npm run build

# 3. PM2 재시작
pm2 delete livescore-api
pm2 start ecosystem.config.js --env production

# 4. 확인
pm2 logs livescore-api --lines 20
curl http://localhost:5000/api/health
```

### 프론트엔드 재배포
1. File Manager에서 `public_html/` 내용 삭제
2. `frontend/` 디렉토리 내용 업로드
3. 브라우저에서 `Ctrl+Shift+R`

---

## 확인 사항

### 백엔드 서버
- [ ] `dist/index.js` 파일이 존재하는가?
- [ ] PM2가 실행 중인가? (`pm2 status`)
- [ ] 헬스체크가 응답하는가? (`curl http://localhost:5000/api/health`)
- [ ] 로그에 오류가 없는가? (`pm2 logs`)

### 프론트엔드
- [ ] `public_html/index.html`이 있는가?
- [ ] `public_html/.htaccess`가 있는가?
- [ ] `public_html/assets/` 폴더가 있는가?
- [ ] 브라우저에서 사이트가 로드되는가?

---

## 자주 하는 실수

1. ❌ **빌드 안 함**: TypeScript 파일 수정 시 `npm run build` 필수
2. ❌ **PM2 재시작 안 함**: 파일 업데이트 후 `pm2 restart` 필수
3. ❌ **환경변수 안 바꿈**: `.env` 파일 수정 후 재시작 필수
4. ❌ **브라우저 캐시**: `Ctrl+Shift+R`로 강력 새로고침
5. ❌ **파일 경로 오류**: `frontend/` 내용을 `public_html/`에 직접 업로드

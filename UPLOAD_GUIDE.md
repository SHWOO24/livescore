# 서버 업로드 가이드

## 📋 업데이트된 파일 목록

### 백엔드 (server)
- `server/src/providers/thesportsdb.ts` - ESPN fallback 추가
- `server/src/services/polling.ts` - Primary/Secondary 스포츠 분리
- `server/src/services/cache.ts` - 캐시 서비스
- `server/src/services/lock.ts` - 동시 호출 방지
- `server/src/providers/espn.ts` - ESPN fallback provider
- `server/src/routes/scores.ts` - FrontendEvent 형식 변환
- `server/src/routes/livescore.ts` - 새로운 라이브스코어 엔드포인트
- `server/src/index.ts` - MongoDB 연결 실패해도 서버 실행

### 프론트엔드 (client)
- `client/src/pages/Home.tsx` - livescore:update 이벤트 수신, 연결 모드 표시

---

## 🚀 백엔드 서버 업로드 (Railway/Render/Fly.io)

### 방법 1: Git Push (자동 배포) - 권장

백엔드는 Git 저장소에 푸시하면 자동으로 배포됩니다.

#### 1단계: 변경사항 커밋

```bash
# 프로젝트 루트에서
git add .
git commit -m "Update: ESPN fallback, Primary/Secondary polling, livescore endpoint"
git push origin main
```

#### 2단계: 배포 플랫폼에서 확인

**Railway**:
1. Railway 대시보드 접속
2. 프로젝트 → Deployments 탭 확인
3. 자동으로 재배포 시작됨
4. 로그에서 빌드 및 배포 상태 확인

**Render**:
1. Render 대시보드 접속
2. 서비스 → Events 탭 확인
3. 자동으로 재배포 시작됨
4. 로그에서 빌드 및 배포 상태 확인

**Fly.io**:
```bash
flyctl deploy
```

#### 3단계: 배포 확인

```bash
# 헬스체크
curl https://your-backend-url.com/api/health

# 새로운 엔드포인트 테스트
curl "https://your-backend-url.com/api/livescore?sport=Soccer"
```

---

### 방법 2: 수동 배포 (필요한 경우)

일부 플랫폼에서는 수동 재배포가 필요할 수 있습니다:

**Railway**:
1. 대시보드 → 프로젝트 → 서비스
2. "Deploy" → "Deploy latest commit" 클릭

**Render**:
1. 대시보드 → 서비스
2. "Manual Deploy" → "Deploy latest commit" 클릭

---

## 📤 프론트엔드 업로드 (Namecheap Shared Hosting)

### 1단계: 환경변수 확인

`client/.env.production` 파일 확인:

```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

**중요**: 백엔드 서버 URL이 올바르게 설정되어 있는지 확인하세요.

### 2단계: 빌드 및 배포 패키지 생성

```bash
cd client
npm run deploy:prepare
```

이 명령어는:
- TypeScript 타입 체크
- 프로덕션 빌드 (`client/dist/` 생성)
- 배포 패키지 생성 (`deploy/static/` 생성)

### 3단계: 업로드할 파일 확인

**업로드 위치**: `/home/username/scorelivenow.com/public_html/` (또는 cPanel에서 지정한 document root)

**업로드할 파일**: `deploy/static/` 디렉토리의 **모든 내용**

```
deploy/static/
├── index.html          ✅ 업로드
├── .htaccess           ✅ 업로드
├── robots.txt          ✅ 업로드
├── sitemap.xml         ✅ 업로드
└── assets/             ✅ 업로드 (폴더 전체)
    ├── index-*.js      (새로운 JavaScript 파일)
    └── index-*.css     (새로운 CSS 파일)
```

### 4단계: FTP/SFTP로 업로드

#### 방법 1: FileZilla 사용 (추천)

1. FileZilla 실행
2. FTP 연결 정보 입력:
   - 호스트: `ftp.scorelivenow.com` (또는 제공된 FTP 주소)
   - 사용자명: Namecheap 계정 사용자명
   - 비밀번호: FTP 비밀번호
   - 포트: 21 (또는 제공된 포트)
3. 연결 클릭
4. `public_html` 디렉토리로 이동
5. **기존 파일 백업** (선택사항, 권장)
6. `deploy/static/` 내부의 **모든 파일과 폴더**를 드래그 앤 드롭
   - ⚠️ 중요: `deploy/static` 폴더 자체가 아닌, 그 안의 내용만 업로드
7. 기존 파일 덮어쓰기 확인

#### 방법 2: cPanel File Manager 사용

1. cPanel 접속
2. "File Manager" 클릭
3. `public_html` 디렉토리로 이동
4. "Upload" 클릭
5. `deploy/static/` 내용을 압축하여 업로드
6. 업로드된 압축 파일 선택 → "Extract" 클릭
7. 기존 파일 덮어쓰기 확인

### 5단계: 업로드 확인

1. **브라우저 캐시 클리어**: `Ctrl + Shift + R` (Windows) 또는 `Cmd + Shift + R` (Mac)
2. **메인 페이지 확인**: `https://scorelivenow.com/` 접속
3. **개발자 도구 확인**:
   - F12 키 누르기
   - Console 탭에서 에러 확인
   - Network 탭에서 API 호출 확인
4. **연결 모드 확인**:
   - Socket 연결 시: "🔴 실시간 (Socket)" 표시
   - REST 폴링 시: "🟡 폴링 (REST)" 표시

---

## ✅ 업로드 체크리스트

### 백엔드

- [ ] Git에 변경사항 커밋 및 푸시
- [ ] 배포 플랫폼에서 자동 배포 확인
- [ ] 배포 로그에서 에러 없음 확인
- [ ] 헬스체크 통과: `curl https://your-backend-url.com/api/health`
- [ ] 새로운 엔드포인트 테스트: `curl "https://your-backend-url.com/api/livescore?sport=Soccer"`

### 프론트엔드

- [ ] `client/.env.production` 파일 확인 (백엔드 URL 설정)
- [ ] 빌드 성공: `npm run deploy:prepare`
- [ ] `deploy/static/` 디렉토리 내용 확인
- [ ] FTP/SFTP로 업로드 완료
- [ ] 브라우저에서 사이트 정상 작동 확인
- [ ] 연결 모드 표시 확인
- [ ] 실시간 업데이트 작동 확인

---

## 🔧 문제 해결

### 백엔드 배포 실패

1. **로그 확인**: 배포 플랫폼의 로그에서 에러 메시지 확인
2. **환경변수 확인**: 모든 필수 환경변수가 설정되었는지 확인
3. **빌드 테스트**: 로컬에서 `npm run build` 테스트
4. **의존성 확인**: `package.json`의 모든 의존성이 설치 가능한지 확인

### 프론트엔드 업로드 후 작동 안 함

1. **브라우저 캐시 클리어**: `Ctrl + Shift + R`
2. **파일 확인**: `public_html`에 모든 파일이 업로드되었는지 확인
3. **.htaccess 확인**: `.htaccess` 파일이 루트에 있는지 확인
4. **개발자 도구**: F12 → Console 탭에서 에러 확인
5. **API 연결 확인**: Network 탭에서 API 호출이 성공하는지 확인

### Socket.io 연결 실패

1. **백엔드 URL 확인**: `VITE_SOCKET_URL` 환경변수 확인
2. **CORS 설정 확인**: 백엔드 `CORS_ORIGIN` 환경변수 확인
3. **WebSocket 지원**: 브라우저 콘솔에서 WebSocket 연결 시도 확인

---

## 📝 빠른 참조

### 백엔드 업로드 (한 줄 명령어)

```bash
git add . && git commit -m "Update backend" && git push origin main
```

### 프론트엔드 업로드 (한 줄 명령어)

```bash
cd client && npm run deploy:prepare
# 그 다음 FTP/SFTP로 deploy/static/ 내용 업로드
```

---

## 🎯 업데이트 순서

1. **백엔드 먼저 배포** (Git push)
2. **백엔드 배포 완료 확인** (헬스체크)
3. **프론트엔드 빌드** (`npm run deploy:prepare`)
4. **프론트엔드 업로드** (FTP/SFTP)
5. **전체 테스트** (브라우저에서 확인)

---

## ⚠️ 중요 사항

1. **백엔드는 Git push로 자동 배포**됩니다. 파일을 직접 업로드할 필요 없습니다.
2. **프론트엔드는 정적 파일만 업로드**합니다. `src/`, `node_modules/` 등은 업로드하지 마세요.
3. **환경변수는 빌드 시 포함**됩니다. `.env.production` 파일을 수정한 후 반드시 재빌드하세요.
4. **브라우저 캐시**를 클리어하지 않으면 이전 버전이 표시될 수 있습니다.

---

## 📞 추가 도움

문제가 발생하면:
1. 배포 플랫폼 로그 확인
2. 브라우저 개발자 도구 확인
3. 서버 로그 확인
4. 환경변수 설정 확인

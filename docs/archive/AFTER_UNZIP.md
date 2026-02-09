# 압축 해제 후 다음 단계

## 📂 압축 해제 결과

압축 해제 후 다음과 같은 구조가 생성됩니다:

```
livescore-server-upload/
├── server/              # 백엔드 서버 파일
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/            # 프론트엔드 배포 파일
│   ├── index.html
│   ├── .htaccess
│   └── assets/
└── README.md
```

---

## 🎯 다음 단계

### 백엔드 서버 배포 (VPS/Linux)

#### 1단계: 서버 디렉토리로 파일 복사

```bash
# 압축 해제한 위치에서
cd livescore-server-upload

# server 디렉토리 내용을 서버 프로젝트 위치로 복사
cp -r server/* ~/livescore-server/server/

# 또는 처음 배포하는 경우
mkdir -p ~/livescore-server/server
cp -r server/* ~/livescore-server/server/
```

#### 2단계: 서버 디렉토리로 이동

```bash
cd ~/livescore-server/server
```

#### 3단계: 의존성 설치 (필수!)

```bash
npm ci
```

이 명령어는 `package-lock.json`을 기반으로 정확한 버전의 패키지를 설치합니다.

#### 4단계: TypeScript 빌드 (필수!)

```bash
npm run build
```

이 명령어는 `src/` 디렉토리의 TypeScript 파일을 `dist/` 디렉토리로 컴파일합니다.

#### 5단계: 환경변수 파일 생성

```bash
# .env 파일이 없으면 생성
cp .env.production.example .env

# .env 파일 편집
nano .env
```

필수 환경변수:
```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/livescore
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=https://scorelivenow.com
```

#### 6단계: PM2로 서버 실행

```bash
# 기존 프로세스가 있으면 중지
pm2 delete livescore-api

# 새로 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status
pm2 logs livescore-api --lines 20
```

#### 7단계: 서버 상태 확인

```bash
# 헬스체크
curl http://localhost:5000/api/health
```

응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### 프론트엔드 배포 (Namecheap Shared Hosting)

#### 1단계: File Manager에서 public_html 정리

- 기존 파일 삭제 (또는 백업)
- `index.html`, `assets/` 등 기존 파일 제거

#### 2단계: frontend 디렉토리 내용 업로드

`livescore-server-upload/frontend/` 디렉토리의 **모든 내용**을 `public_html/`에 업로드:

- `frontend/index.html` → `public_html/index.html`
- `frontend/.htaccess` → `public_html/.htaccess`
- `frontend/assets/` → `public_html/assets/`
- `frontend/robots.txt` → `public_html/robots.txt`
- `frontend/sitemap.xml` → `public_html/sitemap.xml`

#### 3단계: 브라우저에서 확인

- 브라우저에서 사이트 접속
- `Ctrl+Shift+R` (강력 새로고침)

---

## ✅ 체크리스트

### 백엔드 서버
- [ ] `server/` 디렉토리 내용을 서버에 복사
- [ ] `npm ci` 실행
- [ ] `npm run build` 실행
- [ ] `.env` 파일 생성 및 설정
- [ ] `pm2 start` 실행
- [ ] 헬스체크 확인

### 프론트엔드
- [ ] `public_html/` 정리
- [ ] `frontend/` 내용 업로드
- [ ] `.htaccess` 파일 확인
- [ ] 브라우저에서 사이트 접속 확인

---

## 🚨 문제 해결

### "npm ci" 실패

```bash
# package-lock.json이 없으면
npm install
```

### "npm run build" 실패

```bash
# TypeScript 오류 확인
npm run build

# 오류 메시지 확인 후 수정
```

### PM2 실행 실패

```bash
# 로그 확인
pm2 logs livescore-api

# 오류 메시지 확인
```

### 프론트엔드에서 API 호출 실패

1. 백엔드 서버가 실행 중인지 확인
2. CORS 설정 확인
3. 브라우저 콘솔(F12)에서 오류 확인

---

## 📝 빠른 명령어 모음

### 백엔드 전체 배포

```bash
cd ~/livescore-server/server
npm ci
npm run build
pm2 delete livescore-api
pm2 start ecosystem.config.js --env production
pm2 logs livescore-api --lines 20
```

### 백엔드 재시작 (코드 수정 후)

```bash
cd ~/livescore-server/server
npm run build
pm2 restart livescore-api
```

---

## 요약

**압축 해제 후**:

1. **백엔드**: `server/` → 서버에 복사 → `npm ci` → `npm run build` → `pm2 start`
2. **프론트엔드**: `frontend/` → `public_html/`에 업로드

자세한 내용은 각 단계별 가이드를 참고하세요!

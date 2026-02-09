# 배포 가이드

## 프로젝트 구조

이 프로젝트는 **프론트엔드와 백엔드가 완전히 분리된 구조**입니다:

- **프론트엔드**: Namecheap Shared Hosting에 정적 파일로 배포 (Vite dist)
- **백엔드**: 별도 서버(Render/Railway/Fly.io/VPS)에서 실행 (Express + Socket.io + JWT)

---

## A. 프론트엔드 배포 (Namecheap Shared Hosting)

### 1. 환경변수 설정

`client/.env.production` 파일 생성:

```env
VITE_API_BASE_URL=https://your-backend-server-url.com
VITE_SOCKET_URL=https://your-backend-server-url.com
```

**중요**: 백엔드 서버가 배포된 후 실제 URL로 변경하세요.

### 2. 빌드 및 배포 패키지 준비

```bash
cd client
npm run deploy:prepare
```

이 명령어는 다음을 수행합니다:
- TypeScript 타입 체크
- 프로덕션 빌드 (`client/dist/` 생성)
- 배포 패키지 생성 (`deploy/static/` 생성)

### 3. 업로드 대상 파일

**업로드 경로**: `/home/username/scorelivenow.com/public_html/` (또는 cPanel에서 지정한 document root)

**업로드할 파일**: `deploy/static/` 디렉토리의 **모든 내용**

```
deploy/static/
├── index.html          ✅ 업로드
├── .htaccess           ✅ 업로드
├── robots.txt          ✅ 업로드
├── sitemap.xml         ✅ 업로드
└── assets/             ✅ 업로드 (폴더 전체)
    ├── index-*.js
    └── index-*.css
```

### 4. 업로드 방법

#### 방법 1: FTP/SFTP 클라이언트 사용

1. FileZilla 또는 다른 FTP 클라이언트로 접속
2. `public_html` 디렉토리로 이동
3. 기존 파일 백업 (선택사항)
4. `deploy/static/` 내부의 **모든 파일과 폴더**를 업로드
   - ⚠️ 중요: `deploy/static` 폴더 자체가 아닌, 그 안의 내용만 업로드

#### 방법 2: cPanel File Manager 사용

1. cPanel → File Manager 접속
2. `public_html` 디렉토리로 이동
3. `deploy/static/` 내용을 압축하여 업로드
4. cPanel에서 압축 해제

### 5. 확인 사항

배포 후 다음을 확인하세요:

1. **메인 페이지**: `https://scorelivenow.com/` 정상 로드
2. **SPA 라우팅**: `/login`, `/register` 직접 접속 시 404가 아닌 정상 페이지 표시
3. **정적 리소스**: CSS, JS 파일 정상 로드 (브라우저 개발자 도구 Network 탭)
4. **API 연결**: 브라우저 콘솔에서 API 호출 확인 (백엔드 서버가 설정되어 있어야 함)

---

## B. 백엔드 서버 배포

### 1. 배포 플랫폼 선택

다음 중 하나를 선택하여 배포:

- **Railway**: https://railway.app (추천, 무료 티어 제공)
- **Render**: https://render.com (무료 티어 제공)
- **Fly.io**: https://fly.io (무료 티어 제공)
- **VPS**: DigitalOcean, AWS EC2, Linode 등

자세한 배포 방법:
- Railway: [BACKEND_DEPLOY_RAILWAY.md](./BACKEND_DEPLOY_RAILWAY.md)
- Render: [BACKEND_DEPLOY_RENDER.md](./BACKEND_DEPLOY_RENDER.md)
- Fly.io: [BACKEND_DEPLOY_FLY.md](./BACKEND_DEPLOY_FLY.md)

### 2. 환경변수 설정

배포 플랫폼의 환경변수 설정에서 다음을 추가:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `PORT` | 서버 포트 (플랫폼에서 자동 할당 가능) | `5000` |
| `JWT_SECRET` | JWT 토큰 암호화 키 (강력한 랜덤 문자열) | `your-super-secret-key-here` |
| `JWT_EXPIRES_IN` | JWT 토큰 만료 시간 | `7d` |
| `CORS_ORIGIN` | 프론트엔드 도메인 (쉼표로 구분) | `https://scorelivenow.com,https://www.scorelivenow.com` |
| `DATABASE_URL` 또는 `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb+srv://...` |
| `THESPORTSDB_API_KEY` | TheSportsDB API 키 | `123` |
| `CACHE_TTL_SECONDS` | 캐시 TTL (초) | `30` |
| `POLL_INTERVAL_SECONDS` | 폴링 간격 (초) | `30` |
| `DEFAULT_SPORTS` | 기본 스포츠 목록 (쉼표로 구분) | `Soccer,Basketball,American Football,Baseball,Ice Hockey,Cricket,Tennis,Fighting,Motorsport,Volleyball` |
| `EMAIL_HOST` | 이메일 SMTP 호스트 (선택사항) | `smtp.gmail.com` |
| `EMAIL_PORT` | 이메일 SMTP 포트 (선택사항) | `587` |
| `EMAIL_USER` | 이메일 계정 (선택사항) | `your-email@gmail.com` |
| `EMAIL_PASS` | 이메일 앱 비밀번호 (선택사항) | `your-app-password` |
| `NODE_ENV` | Node 환경 | `production` |

### 3. 헬스체크 엔드포인트

배포 후 다음 URL로 헬스체크:

```
GET https://your-backend-server-url.com/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## C. 업데이트 체크리스트

### 프론트엔드 업데이트 시

| 단계 | 작업 | 위치 | 업로드 대상 |
|------|------|------|------------|
| 1 | 코드 수정 | `client/src/` | - |
| 2 | 환경변수 확인/수정 | `client/.env.production` | - |
| 3 | 빌드 및 패키지 생성 | `npm run deploy:prepare` (client 디렉토리) | - |
| 4 | 배포 파일 확인 | `deploy/static/` | ✅ |
| 5 | FTP/SFTP로 업로드 | `public_html/` (기존 파일 덮어쓰기) | ✅ |
| 6 | 브라우저 캐시 클리어 테스트 | `Ctrl+Shift+R` | - |

**업로드 대상 파일** (`deploy/static/` 내용만):
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ `assets/` 폴더 (전체)
- ✅ `robots.txt`, `sitemap.xml`

**업로드 금지**:
- ❌ `node_modules/`
- ❌ `src/`
- ❌ `package.json`
- ❌ `server/`
- ❌ 기타 개발 파일

### 백엔드 업데이트 시

| 단계 | 작업 | 위치 | 업로드 대상 |
|------|------|------|------------|
| 1 | 코드 수정 | `server/src/` | - |
| 2 | 환경변수 확인 | 배포 플랫폼 환경변수 설정 | - |
| 3 | Git 커밋 및 푸시 | - | - |
| 4 | 배포 플랫폼에서 자동 배포 확인 | Railway/Render 대시보드 | - |
| 5 | 헬스체크 확인 | `GET /api/health` | - |
| 6 | 로그 확인 | 배포 플랫폼 로그 | - |

**배포 플랫폼에 업로드되는 것** (GitHub 푸시 시 자동):
- ✅ `server/src/` (소스 코드)
- ✅ `server/package.json`
- ✅ `server/tsconfig.json`
- ✅ 기타 설정 파일

**업로드 금지** (`.gitignore`에 의해 자동 제외):
- ❌ `node_modules/` (배포 플랫폼에서 `npm ci`로 설치)
- ❌ `dist/` (배포 플랫폼에서 `npm run build`로 생성)
- ❌ `.env` (배포 플랫폼 환경변수로 설정)

---

## D. 문제 해결

### 프론트엔드

#### 새로고침 시 404 오류
- `.htaccess` 파일이 `public_html` 루트에 있는지 확인
- Apache mod_rewrite 모듈 활성화 확인

#### API 호출 실패
- `VITE_API_BASE_URL` 환경변수가 올바르게 설정되었는지 확인
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인

### 백엔드

#### MongoDB 연결 실패
- 연결 문자열 확인
- MongoDB Atlas 네트워크 접근 설정 확인
- 방화벽 설정 확인

#### Socket.io 연결 실패
- `CORS_ORIGIN` 환경변수 확인
- Reverse proxy 설정 확인
- WebSocket 지원 확인

#### TheSportsDB API 오류
- API 키 확인 (`THESPORTSDB_API_KEY=123`)
- API 호출 제한 확인 (무료 티어 제한)
- 로그에서 오류 메시지 확인

---

## E. 보안 체크리스트

- [ ] `.env` 파일이 Git에 커밋되지 않았는지 확인
- [ ] `JWT_SECRET`이 강력한 랜덤 문자열인지 확인
- [ ] MongoDB 연결 문자열에 비밀번호가 포함되어 있는지 확인
- [ ] `node_modules`가 업로드되지 않았는지 확인
- [ ] `.htaccess`에서 디렉토리 리스팅이 비활성화되었는지 확인
- [ ] HTTPS가 활성화되었는지 확인

---

## F. 성능 최적화

### 프론트엔드
- ✅ 빌드 결과물에 해시 포함 (캐싱 최적화)
- ✅ Gzip 압축 (.htaccess에 설정됨)
- ✅ 브라우저 캐싱 설정 (.htaccess에 설정됨)

### 백엔드
- ✅ in-memory 캐싱 (30초 TTL)
- ✅ 폴링 최적화 (30초 간격)
- ✅ Rate limiting 적용
- ✅ MongoDB 인덱스 최적화 (필요시)

---

## 요약

### Namecheap에 업로드할 파일

**경로**: `deploy/static/` 디렉토리의 모든 내용  
**대상**: `public_html/` 디렉토리

**업로드 대상**:
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ `assets/` 폴더 (전체)
- ✅ `robots.txt`, `sitemap.xml`

### 백엔드 배포 환경변수

**필수 환경변수**:
- `NODE_ENV=production`
- `PORT` (배포 플랫폼에서 자동 할당 가능)
- `JWT_SECRET` (강력한 랜덤 문자열)
- `CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com`
- `DATABASE_URL` 또는 `MONGODB_URI` (MongoDB 연결 문자열)
- `THESPORTSDB_API_KEY=123`
- `CACHE_TTL_SECONDS=30`
- `POLL_INTERVAL_SECONDS=30`
- `DEFAULT_SPORTS=Soccer,Basketball,American Football,Baseball,Ice Hockey,Cricket,Tennis,Fighting,Motorsport,Volleyball`

**선택 환경변수**:
- `JWT_EXPIRES_IN=7d`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (이메일 인증용)

### 업데이트 시

**프론트엔드**:
1. 코드 수정 (`client/src/`)
2. 환경변수 확인 (`client/.env.production`)
3. 빌드 및 패키지 생성 (`npm run deploy:prepare`)
4. `deploy/static/` 내용을 `public_html/`에 업로드

**백엔드**:
1. 코드 수정 (`server/src/`)
2. Git 커밋 및 푸시
3. 배포 플랫폼에서 자동 배포
4. 헬스체크 확인 (`GET /api/health`)

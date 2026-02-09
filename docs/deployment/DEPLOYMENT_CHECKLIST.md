# 배포 체크리스트

## 📋 업데이트할 때 무엇을 어디에 올리는지

### 프론트엔드 업데이트 (Namecheap Shared Hosting)

#### 업로드 대상

| 파일/폴더 | 위치 | 설명 |
|-----------|------|------|
| `index.html` | `public_html/index.html` | 메인 HTML 파일 |
| `.htaccess` | `public_html/.htaccess` | SPA 라우팅 설정 |
| `assets/` | `public_html/assets/` | CSS, JS 파일 (폴더 전체) |
| `robots.txt` | `public_html/robots.txt` | SEO 설정 (선택사항) |
| `sitemap.xml` | `public_html/sitemap.xml` | SEO 설정 (선택사항) |

**업로드 경로**: `deploy/static/` 디렉토리의 모든 내용을 `public_html/`에 업로드

#### 업로드 금지

| 항목 | 이유 |
|------|------|
| `node_modules/` | 용량 큼, 불필요 |
| `src/` | 소스 코드, 빌드 불필요 |
| `package.json` | 개발 설정 파일 |
| `server/` | 백엔드 코드 |
| `.env` | 환경변수 (보안) |
| 기타 개발 파일 | 불필요 |

#### 업데이트 절차

1. ✅ 코드 수정 (`client/src/`)
2. ✅ 환경변수 확인/수정 (`client/.env.production`)
3. ✅ 빌드 및 패키지 생성 (`npm run deploy:prepare`)
4. ✅ `deploy/static/` 내용 확인
5. ✅ FTP/SFTP로 `public_html/`에 업로드
6. ✅ 브라우저에서 `Ctrl+Shift+R` (강력 새로고침)

---

### 백엔드 업데이트 (Render/Railway/Fly.io/VPS)

#### 업로드 대상 (GitHub 푸시 시 자동)

| 파일/폴더 | 설명 |
|-----------|------|
| `server/src/` | 소스 코드 |
| `server/package.json` | 의존성 정보 |
| `server/package-lock.json` | 의존성 버전 고정 |
| `server/tsconfig.json` | TypeScript 설정 |
| `server/ecosystem.config.js` | PM2 설정 (VPS용) |
| 기타 설정 파일 | `.gitignore`에 제외되지 않은 파일 |

**배포 방법**: GitHub에 푸시하면 배포 플랫폼에서 자동 배포

#### 업로드 금지 (`.gitignore`에 의해 자동 제외)

| 항목 | 이유 |
|------|------|
| `node_modules/` | 배포 플랫폼에서 `npm ci`로 설치 |
| `dist/` | 배포 플랫폼에서 `npm run build`로 생성 |
| `.env` | 배포 플랫폼 환경변수로 설정 |
| `logs/` | 런타임 생성 파일 |

#### 업데이트 절차

1. ✅ 코드 수정 (`server/src/`)
2. ✅ 환경변수 확인 (배포 플랫폼 환경변수 설정)
3. ✅ Git 커밋 및 푸시
4. ✅ 배포 플랫폼에서 자동 배포 확인
5. ✅ 헬스체크 확인 (`GET /api/health`)
6. ✅ 로그 확인 (배포 플랫폼 로그)

---

## 🔄 환경변수 변경 시

### 프론트엔드 환경변수

**파일**: `client/.env.production`

**변경 후**:
1. ✅ 재빌드 (`npm run build`)
2. ✅ 배포 패키지 생성 (`npm run deploy:prepare`)
3. ✅ `deploy/static/` 내용을 `public_html/`에 재업로드

### 백엔드 환경변수

**위치**: 배포 플랫폼 환경변수 설정

**변경 후**:
- ✅ 배포 플랫폼에서 자동 재시작 (대부분 자동)
- ✅ 수동 재시작이 필요한 경우: 배포 플랫폼에서 "Redeploy" 클릭

---

## 📝 빠른 참조

### 프론트엔드 업로드 명령어

```bash
cd client
npm run deploy:prepare
# deploy/static/ 내용을 public_html에 업로드
```

### 백엔드 배포 명령어

```bash
cd server
git add .
git commit -m "Update backend"
git push origin main
# 배포 플랫폼에서 자동 배포
```

### 헬스체크

```bash
# 백엔드
curl https://<BACKEND_HOST>/api/health

# 프론트엔드
# 브라우저에서 https://scorelivenow.com 접속 확인
```

---

## ✅ 최종 체크리스트

### 프론트엔드 배포 전

- [ ] `client/.env.production`에 올바른 백엔드 URL 설정
- [ ] `npm run build` 성공
- [ ] `deploy/static/` 디렉토리에 필요한 파일만 있음
- [ ] `node_modules/`, `src/` 등이 포함되지 않음

### 백엔드 배포 전

- [ ] 환경변수가 올바르게 설정됨
- [ ] `server/src/` 코드가 최신 상태
- [ ] `.gitignore`가 올바르게 설정됨
- [ ] MongoDB 연결 문자열 확인

### 배포 후

- [ ] 프론트엔드: 브라우저에서 사이트 정상 로드
- [ ] 백엔드: `/api/health` 응답 확인
- [ ] API 연결: 프론트엔드에서 백엔드 API 호출 성공
- [ ] Socket.io: 실시간 기능 정상 작동

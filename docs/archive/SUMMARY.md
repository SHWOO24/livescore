# 작업 완료 요약

## 변경된 파일 목록

### 프론트엔드 (client/)

1. **환경변수 설정**
   - `client/.env.production.example` (신규)
   - `client/src/vite-env.d.ts` (수정: VITE_API_BASE_URL, VITE_SOCKET_URL)

2. **API/Socket URL 환경변수화**
   - `client/src/utils/api.ts` (VITE_API_URL → VITE_API_BASE_URL)
   - `client/src/contexts/SocketContext.tsx` (VITE_SOCKET_URL 사용)

3. **SEO/성능 최적화**
   - `client/index.html` (메타 태그 추가)
   - `client/public/robots.txt` (신규)
   - `client/public/sitemap.xml` (신규)
   - `client/vite.config.ts` (빌드 최적화 설정)

4. **배포 스크립트**
   - `client/package.json` (deploy:prepare 스크립트 추가)
   - `client/scripts/prepare-deploy.js` (신규)
   - `client/dist/.htaccess` (SPA 라우팅 + 보안 설정)

### 백엔드 (server/)

1. **환경변수 정리**
   - `server/.env.example` (신규, 모든 환경변수 문서화)

2. **Socket.io Reverse Proxy 지원**
   - `server/src/index.ts` (transports, allowEIO3 설정)
   - `server/src/index.ts` (CORS_ORIGIN 지원)

3. **헬스체크**
   - `server/src/index.ts` (이미 `/api/health` 엔드포인트 존재)

### 문서

1. `DEPLOYMENT.md` (신규, 상세 배포 가이드)
2. `README.md` (Shared Hosting 제약사항 추가)
3. `.gitignore` (deploy/, .env.production 추가)

---

## Namecheap에 업로드할 파일 목록

### 업로드 경로
```
/home/username/scorelivenow.com/public_html/
```
또는 cPanel에서 지정한 document root

### 업로드할 파일 (deploy/static/ 디렉토리 내용)

```
public_html/
├── index.html                    ✅ 필수
├── .htaccess                     ✅ 필수 (SPA 라우팅)
├── robots.txt                    ✅ SEO
├── sitemap.xml                   ✅ SEO
└── assets/                       ✅ 필수
    ├── index-[hash].js          (JavaScript 번들)
    └── index-[hash].css          (CSS 번들)
```

### 생성 방법

```bash
cd client
npm run deploy:prepare
```

이 명령어는:
1. TypeScript 타입 체크
2. 프로덕션 빌드 수행
3. `deploy/static/` 디렉토리에 배포 패키지 생성

### 업로드 시 주의사항

- ⚠️ `deploy/static` 폴더 자체가 아닌, 그 안의 **모든 내용**만 업로드
- ⚠️ 기존 파일은 덮어쓰기 (백업 권장)
- ⚠️ `node_modules/`, `src/`, `package.json` 등은 절대 업로드하지 않음

---

## 백엔드 배포에 필요한 환경변수 목록

### 필수 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `PORT` | 서버 포트 (일부 플랫폼은 자동 할당) | `5000` |
| `JWT_SECRET` | JWT 토큰 암호화 키 (강력한 랜덤 문자열 필수) | `your-super-secret-key-here` |
| `JWT_EXPIRES_IN` | JWT 토큰 만료 시간 | `7d` |
| `CORS_ORIGIN` | 프론트엔드 도메인 (쉼표로 여러 도메인 가능) | `https://scorelivenow.com` |
| `FRONTEND_URL` | 프론트엔드 URL (Socket.io용) | `https://scorelivenow.com` |
| `DATABASE_URL` 또는 `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb+srv://user:pass@cluster.mongodb.net/livescore` |

### 선택적 환경변수 (이메일 기능 사용 시)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `EMAIL_HOST` | SMTP 호스트 | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP 포트 | `587` |
| `EMAIL_USER` | 이메일 계정 | `your-email@gmail.com` |
| `EMAIL_PASS` | 이메일 앱 비밀번호 | `your-app-password` |

### 시스템 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NODE_ENV` | Node 환경 | `production` |

### 환경변수 설정 예시 (Railway)

```bash
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://scorelivenow.com
FRONTEND_URL=https://scorelivenow.com
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/livescore
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

---

## 배포 플랫폼별 참고사항

### Railway
- GitHub 연결 후 자동 배포
- 환경변수는 대시보드에서 설정
- MongoDB Atlas 연결 권장

### Render
- GitHub 연결 후 자동 배포
- 환경변수는 Environment Variables에서 설정
- 무료 티어는 15분 비활성 시 슬립 모드

### Fly.io
- `fly.toml` 설정 필요
- CLI로 배포: `fly deploy`
- 환경변수: `fly secrets set KEY=value`

### VPS (DigitalOcean, AWS EC2 등)
- SSH 접속 후 수동 배포
- PM2 또는 systemd로 프로세스 관리
- Nginx reverse proxy 설정 필요

---

## 다음 단계

1. **프론트엔드 배포**
   ```bash
   cd client
   # .env.production 파일 생성 및 환경변수 설정
   npm run deploy:prepare
   # deploy/static/ 내용을 Namecheap public_html에 업로드
   ```

2. **백엔드 배포**
   - Railway/Render 등에 프로젝트 연결
   - 환경변수 설정
   - MongoDB Atlas 연결
   - 배포 확인: `GET https://api.yourdomain.com/api/health`

3. **연결 확인**
   - 프론트엔드에서 백엔드 API 호출 테스트
   - Socket.io 연결 테스트
   - 로그인/회원가입 테스트

---

## 문제 해결

### 프론트엔드
- 새로고침 404: `.htaccess` 확인
- API 호출 실패: `VITE_API_BASE_URL` 환경변수 확인

### 백엔드
- MongoDB 연결 실패: 연결 문자열 확인
- Socket.io 연결 실패: `CORS_ORIGIN` 확인
- 헬스체크 실패: 서버 로그 확인

자세한 내용은 `DEPLOYMENT.md`를 참고하세요.

# 백엔드 빠른 배포 가이드

## 🎯 배포 플랫폼 선택

다음 중 하나를 선택하세요:

1. **Render** (추천) - 무료 티어, 쉬운 설정
   - [Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md)

2. **Railway** - 무료 크레딧, 빠른 배포
   - [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)

3. **Fly.io** - 글로벌 CDN, 빠른 속도
   - [Fly.io 배포 가이드](./BACKEND_DEPLOY_FLY.md)

4. **VPS** - 완전한 제어, 유료
   - [VPS 배포 가이드](./DEPLOY_BACKEND.md)

---

## 📋 공통 사전 준비사항

### 1. MongoDB Atlas 계정 생성 (무료)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 접속
2. 무료 계정 생성
3. 클러스터 생성 (Free Tier 선택)
4. Database Access에서 사용자 생성
5. Network Access에서 IP 허용 (0.0.0.0/0 - 모든 IP)
6. 연결 문자열 복사: `mongodb+srv://username:password@cluster.mongodb.net/livescore`

### 2. GitHub 저장소 준비

코드가 GitHub에 푸시되어 있어야 합니다:

```bash
git add .
git commit -m "Prepare for backend deployment"
git push origin main
```

### 3. JWT_SECRET 생성

강력한 랜덤 문자열 생성:

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Mac/Linux
openssl rand -base64 32
```

---

## 🚀 빠른 시작 (Render 추천)

### 1단계: Render 계정 생성
- https://render.com 접속
- GitHub로 로그인

### 2단계: 새 Web Service 생성
1. "New +" → "Web Service" 클릭
2. GitHub 저장소 연결 및 선택

### 3단계: 서비스 설정

**기본 설정:**
- Name: `livescore-api`
- Region: 가장 가까운 지역
- Branch: `main`
- **Root Directory**: `server` ⚠️ 중요!

**빌드 명령어:**
```bash
npm ci && npm run build
```

**시작 명령어:**
```bash
npm start
```

### 4단계: 환경변수 설정

Render 대시보드 → Environment에서 다음 변수 추가:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (생성한 랜덤 문자열) |
| `CORS_ORIGIN` | `https://scorelivenow.com,https://www.scorelivenow.com` |
| `DATABASE_URL` | (MongoDB Atlas 연결 문자열) |
| `THESPORTSDB_API_KEY` | `123` |
| `CACHE_TTL_SECONDS` | `30` |
| `POLL_INTERVAL_SECONDS` | `30` |
| `DEFAULT_SPORTS` | `Soccer,Basketball,American Football,Baseball,Ice Hockey,Cricket,Tennis,Fighting,Motorsport,Volleyball` |

**선택 환경변수:**
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (이메일 인증 사용 시)
- `FRONTEND_URL` (이메일 링크에 사용)

### 5단계: 배포 확인

1. "Create Web Service" 클릭
2. 배포 완료 대기 (약 5-10분)
3. 헬스체크:
   ```bash
   curl https://livescore-api.onrender.com/api/health
   ```

예상 응답:
```json
{"status":"ok","message":"Server is running"}
```

### 6단계: 프론트엔드 환경변수 업데이트

백엔드 URL을 프론트엔드에 설정:

1. `client/.env.production` 파일 생성/수정:
   ```env
   VITE_API_BASE_URL=https://livescore-api.onrender.com
   VITE_SOCKET_URL=https://livescore-api.onrender.com
   ```

2. 프론트엔드 재빌드:
   ```bash
   cd client
   npm run build
   ```

3. `client/dist` 내용을 Namecheap `public_html`에 재업로드

---

## ✅ 배포 확인 체크리스트

- [ ] 백엔드 헬스체크 성공 (`/api/health`)
- [ ] MongoDB 연결 성공 (로그 확인)
- [ ] 프론트엔드에서 API 호출 성공
- [ ] Socket.io 연결 성공 (브라우저 콘솔 확인)
- [ ] 스코어 데이터 로드 성공

---

## 🔧 문제 해결

### 배포 실패
- 로그 확인: Render 대시보드 → Logs
- 환경변수 확인: 모든 필수 변수가 설정되었는지 확인
- Root Directory 확인: `server`로 설정되어 있는지 확인

### MongoDB 연결 실패
- 연결 문자열 확인: `DATABASE_URL` 환경변수
- Network Access 확인: MongoDB Atlas에서 IP 허용 확인
- 사용자 권한 확인: Database Access에서 권한 확인

### CORS 오류
- `CORS_ORIGIN` 환경변수 확인
- 프론트엔드 도메인이 정확히 설정되었는지 확인

---

## 📝 다음 단계

백엔드 배포 완료 후:

1. ✅ 백엔드 URL 확인
2. ✅ 프론트엔드 환경변수 설정
3. ✅ 프론트엔드 재빌드 및 재배포
4. ✅ 전체 시스템 테스트

자세한 내용은 각 플랫폼별 배포 가이드를 참조하세요.

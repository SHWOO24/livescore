# Railway로 백엔드 서버 배포 가이드

## 📋 사전 요구사항

- Railway 계정 (https://railway.app)
- GitHub 저장소 (또는 GitLab/Bitbucket)
- MongoDB Atlas 계정 (또는 MongoDB 호스팅)

---

## 🚀 배포 절차

### 1단계: GitHub에 코드 푸시

```bash
# 로컬에서
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2단계: Railway에서 새 프로젝트 생성

1. Railway 대시보드 접속
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. GitHub 저장소 연결 및 선택

### 3단계: 서비스 설정

#### 기본 설정

- **Root Directory**: `server` ⚠️ **중요!** (서버 코드가 있는 디렉토리)
- **Build Command**: (자동 감지 또는 수동 설정)
  ```bash
  npm ci && npm run build
  ```
- **Start Command**: (자동 감지 또는 수동 설정)
  ```bash
  npm start
  ```

**디렉토리 구조 설명**:
```
GitHub 저장소:
livescore/
├── client/          ← 프론트엔드 (업로드 안 함)
└── server/          ← 백엔드 (Root Directory로 설정)
    ├── src/        ← 소스 코드
    ├── package.json
    └── tsconfig.json
```

Railway는 `server/` 디렉토리를 루트로 인식합니다.

#### 환경변수 설정

Railway 대시보드 → 프로젝트 → 서비스 → Variables 탭에서 다음 환경변수 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NODE_ENV` | `production` | Node 환경 |
| `PORT` | (자동 할당) | 서버 포트 (Railway가 자동 할당) |
| `JWT_SECRET` | `your-strong-random-string` | JWT 시크릿 키 (강력한 랜덤 문자열) |
| `JWT_EXPIRES_IN` | `7d` | JWT 만료 시간 |
| `CORS_ORIGIN` | `https://scorelivenow.com,https://www.scorelivenow.com` | CORS 허용 도메인 |
| `DATABASE_URL` | `mongodb+srv://...` | MongoDB 연결 문자열 |
| `THESPORTSDB_API_KEY` | `123` | TheSportsDB API 키 |
| `CACHE_TTL_SECONDS` | `30` | 캐시 TTL (초) |
| `PRIMARY_POLL_INTERVAL_SECONDS` | `30` | Primary Sport 폴링 주기 (초) |
| `SECONDARY_POLL_INTERVAL_SECONDS` | `90` | Secondary Sports 폴링 주기 (초) |
| `DEFAULT_SPORTS` | `Soccer,Basketball,American Football,Baseball,Ice Hockey,Cricket,Tennis,Fighting,Motorsport,Volleyball` | 기본 스포츠 목록 |

**선택 환경변수**:
- `EMAIL_HOST`: 이메일 SMTP 호스트
- `EMAIL_PORT`: 이메일 SMTP 포트
- `EMAIL_USER`: 이메일 계정
- `EMAIL_PASS`: 이메일 앱 비밀번호

### 4단계: MongoDB Atlas 설정

1. MongoDB Atlas 계정 생성 (https://www.mongodb.com/cloud/atlas)
2. 클러스터 생성
3. Database Access에서 사용자 생성
4. Network Access에서 IP 주소 허용 (Railway IP 또는 0.0.0.0/0)
5. 연결 문자열 복사: `mongodb+srv://username:password@cluster.mongodb.net/livescore`
6. Railway 환경변수 `DATABASE_URL`에 설정

### 5단계: 배포 확인

1. Railway 대시보드에서 배포 상태 확인
2. 로그 확인 (Deployments → Logs)
3. 헬스체크:
   ```bash
   curl https://your-service.railway.app/api/health
   ```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 6단계: 도메인 설정 (선택사항)

1. Railway 대시보드 → 프로젝트 → Settings
2. "Generate Domain" 클릭하여 Railway 도메인 생성
3. 또는 Custom Domain 설정 (도메인 소유권 확인 필요)

---

## 🔧 문제 해결

### 배포 실패

- **로그 확인**: Railway 대시보드 → Deployments → Logs
- **빌드 오류**: `npm ci` 및 `npm run build` 로컬에서 테스트
- **환경변수 확인**: 모든 필수 환경변수가 설정되었는지 확인

### MongoDB 연결 실패

- **연결 문자열 확인**: `DATABASE_URL` 환경변수 확인
- **네트워크 접근**: MongoDB Atlas Network Access에서 Railway IP 허용
- **사용자 권한**: Database Access에서 사용자 권한 확인

### Socket.io 연결 실패

- **CORS 설정**: `CORS_ORIGIN` 환경변수 확인
- **WebSocket 지원**: Railway는 WebSocket을 자동 지원

---

## 📝 업데이트 절차

코드 업데이트 시:

1. 로컬에서 코드 수정
2. Git 커밋 및 푸시:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Railway가 자동으로 재배포
4. 배포 상태 확인 (대시보드)
5. 헬스체크 확인

---

## 💰 비용

Railway 무료 티어:
- $5 크레딧/월
- 500시간 실행 시간
- 충분한 트래픽 허용

프로덕션 사용 시 유료 플랜 고려:
- Hobby: $5/월
- Pro: $20/월

---

## ✅ 체크리스트

- [ ] GitHub 저장소 연결
- [ ] Root Directory: `server` 설정
- [ ] 모든 필수 환경변수 설정
- [ ] MongoDB Atlas 연결 설정
- [ ] 배포 성공 확인
- [ ] 헬스체크 통과
- [ ] 프론트엔드에서 API 호출 테스트

---

## 🔗 관련 문서

- [DEPLOYMENT.md](./DEPLOYMENT.md): 전체 배포 가이드
- [BACKEND_DEPLOY_RENDER.md](./BACKEND_DEPLOY_RENDER.md): Render 배포 가이드
- Railway 공식 문서: https://docs.railway.app

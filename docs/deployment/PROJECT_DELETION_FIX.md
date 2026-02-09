# 프로젝트 삭제 문제 해결 가이드

## 🚨 현재 상황

대시보드에서 다음이 확인됩니다:
- ⚠️ **"Build failed 42 seconds ago"** - 빌드 실패
- ⚠️ **"Your project is being deleted"** - 프로젝트가 삭제 중

이것이 백엔드 호출이 안 되는 주요 원인입니다.

---

## ✅ 즉시 조치 사항

### 1. 프로젝트 삭제 중단 (가능한 경우)

1. 대시보드 접속
2. 삭제 알림 클릭
3. 삭제 취소 시도 (가능한 경우)

**주의**: 이미 삭제가 완료되었다면 이 단계는 건너뛰세요.

---

## 🔧 해결 방법

### 방법 1: 프로젝트 재생성 (권장)

#### Render 사용 시:

1. **Render 대시보드 접속**: https://render.com
2. **"New +"** → **"Web Service"** 클릭
3. **GitHub 저장소 연결**:
   - GitHub 저장소 선택
   - 저장소 연결 확인
4. **서비스 설정**:
   - **Name**: `livescore-api` (또는 원하는 이름)
   - **Region**: 가장 가까운 지역 선택
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server` ⚠️ **중요!**
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
5. **환경변수 설정** (Variables 탭):
   ```
   NODE_ENV=production
   JWT_SECRET=your-strong-random-string-32-chars-minimum
   CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
   DATABASE_URL=mongodb+srv://...
   THESPORTSDB_API_KEY=123
   PRIMARY_POLL_INTERVAL_SECONDS=30
   SECONDARY_POLL_INTERVAL_SECONDS=90
   CACHE_TTL_SECONDS=30
   DEFAULT_SPORTS=Soccer,Basketball,Baseball,American Football,Ice Hockey
   ```
6. **"Create Web Service"** 클릭
7. 배포 완료 대기

#### Railway 사용 시:

1. **Railway 대시보드 접속**: https://railway.app
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. **GitHub 저장소 연결** 및 선택
5. **서비스 설정**:
   - **Root Directory**: `server` ⚠️ **중요!**
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
6. **환경변수 설정** (Variables 탭):
   - 위와 동일한 환경변수 설정
7. 배포 완료 대기

---

## 📋 배포 성공 확인

### 1. 배포 상태 확인

대시보드에서:
- ✅ "Deployed successfully" 메시지 확인
- ✅ 서비스 상태가 "Live" 또는 "Running" 확인

### 2. 헬스체크

배포된 서비스의 URL 확인 후:

```bash
curl https://your-service-url.com/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 3. 프론트엔드 환경변수 업데이트

백엔드 서버 URL을 확인한 후:

```bash
cd client
npm run create:env
```

또는 수동으로 `.env.production` 파일 생성:

```env
VITE_API_BASE_URL=https://your-new-backend-url.com
VITE_SOCKET_URL=https://your-new-backend-url.com
```

### 4. 프론트엔드 재빌드 및 재배포

```bash
cd client
npm run build
```

`client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드

---

## 🔍 빌드 실패 원인 확인

### 일반적인 빌드 실패 원인:

1. **Root Directory 설정 오류**
   - 해결: Root Directory를 `server`로 설정

2. **TypeScript 컴파일 오류**
   - 해결: 로컬에서 `cd server && npm ci && npm run build` 테스트

3. **환경변수 누락**
   - 해결: 모든 필수 환경변수 설정

4. **의존성 설치 실패**
   - 해결: `package-lock.json` 확인, Build Command에 `npm ci` 사용

---

## 📝 배포 체크리스트

### 서비스 설정
- [ ] Root Directory: `server` 설정됨
- [ ] Build Command: `npm ci && npm run build` 설정됨
- [ ] Start Command: `npm start` 설정됨

### 환경변수
- [ ] `NODE_ENV=production` 설정됨
- [ ] `JWT_SECRET` 설정됨 (강력한 랜덤 문자열)
- [ ] `CORS_ORIGIN` 설정됨
- [ ] `DATABASE_URL` 설정됨
- [ ] `THESPORTSDB_API_KEY` 설정됨
- [ ] `PRIMARY_POLL_INTERVAL_SECONDS` 설정됨
- [ ] `SECONDARY_POLL_INTERVAL_SECONDS` 설정됨
- [ ] `CACHE_TTL_SECONDS` 설정됨
- [ ] `DEFAULT_SPORTS` 설정됨

### 배포
- [ ] 로컬에서 `npm run build` 성공
- [ ] Git에 최신 코드 푸시됨
- [ ] 서비스 생성 및 배포 완료
- [ ] 배포 성공 확인
- [ ] 헬스체크 통과
- [ ] 프론트엔드 환경변수 업데이트
- [ ] 프론트엔드 재빌드 및 재배포

---

## 💡 빠른 해결 방법

### Render 사용 시:

1. Render 대시보드 → "New +" → "Web Service"
2. GitHub 저장소 연결
3. **Root Directory: `server`** 설정 ⚠️ 중요!
4. 환경변수 설정
5. 배포

### Railway 사용 시:

1. Railway 대시보드 → "New Project"
2. "Deploy from GitHub repo" 선택
3. **Root Directory: `server`** 설정 ⚠️ 중요!
4. 환경변수 설정
5. 배포

---

## 🔗 관련 문서

- [Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [Railway 빠른 해결](./RAILWAY_QUICK_FIX.md)
- [프론트엔드 환경변수 설정](./ENV_SETUP_GUIDE.md)

---

## ⚠️ 중요 사항

1. **프로젝트가 삭제되었다면**: 새로 생성해야 합니다
2. **Root Directory 설정**: 반드시 `server`로 설정해야 합니다
3. **환경변수**: 모든 필수 환경변수를 설정해야 합니다
4. **프론트엔드 업데이트**: 백엔드 URL이 변경되면 프론트엔드도 업데이트해야 합니다

# Railway 빌드 실패 해결 가이드 (Dockerfile 기반)

## 🎯 Railway 안정 배포 설정

이 레포는 **Dockerfile 기반 배포**를 사용하여 Railway에서 안정적으로 빌드/배포됩니다.

---

## ✅ Railway 올바른 설정

### 1. 서비스 설정 확인

Railway 대시보드 → 서비스 → Settings:

#### 필수 설정:
- **Root Directory**: (비워두거나 루트 디렉토리) - Dockerfile이 루트에 있으므로
- **Builder**: `DOCKERFILE` (자동 감지 또는 railway.json 설정)
- **Start Command**: `npm start` (자동 감지)

#### 확인 방법:
1. Railway 대시보드 → 서비스 선택
2. Settings 탭
3. Builder가 `DOCKERFILE`로 설정되어 있는지 확인
4. Dockerfile이 루트에 있는지 확인

---

## 🔧 Dockerfile 기반 빌드

### 빌드 프로세스:

1. **의존성 설치**:
   - 루트: `npm install` (npm ci 사용 안 함)
   - 서버: `npm install`
   - 클라이언트: `npm install` (TypeScript 포함)

2. **빌드**:
   - 서버: `npm run build` (TypeScript 컴파일)
   - 클라이언트: `npm run build` (TypeScript 컴파일 + Vite 빌드)

3. **실행**:
   - `npm start` → `cd server && npm start`

---

## 📋 Railway 필수 설정 체크리스트

### 서비스 설정
- [ ] Dockerfile이 루트 디렉토리에 있음
- [ ] Builder: `DOCKERFILE` 설정됨 (또는 자동 감지)
- [ ] Start Command: `npm start` 확인됨

### 환경변수 (Variables 탭)
- [ ] `NODE_ENV=production`
- [ ] `PORT` (Railway가 자동 할당, 설정 불필요)
- [ ] `JWT_SECRET` (강력한 랜덤 문자열)
- [ ] `CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com`
- [ ] `DATABASE_URL` 또는 `MONGODB_URI` (MongoDB 연결 문자열)
- [ ] `THESPORTSDB_API_KEY=123`
- [ ] `CACHE_TTL_SECONDS=30`
- [ ] `PRIMARY_POLL_INTERVAL_SECONDS=30`
- [ ] `SECONDARY_POLL_INTERVAL_SECONDS=90`
- [ ] `DEFAULT_SPORTS=Soccer,Basketball,Baseball,American Football,Ice Hockey`

---

## 🛠️ 단계별 해결 방법

### Step 1: 로컬 빌드 테스트

```bash
# Dockerfile로 로컬 빌드 테스트
docker build -t livescore-test .
docker run -p 5000:5000 livescore-test
```

또는 직접 빌드 테스트:
```bash
# 루트에서
npm install
cd server && npm install && npm run build
cd ../client && npm install && npm run build
cd ../server && npm start
```

### Step 2: Railway 설정 확인

1. Railway 대시보드 → 서비스 → Settings
2. Builder 확인: `DOCKERFILE`
3. Dockerfile 경로 확인: 루트 디렉토리
4. Start Command 확인: `npm start`

### Step 3: 환경변수 설정

1. Railway 대시보드 → 서비스 → Variables
2. 위의 필수 환경변수 모두 추가
3. 저장

### Step 4: 재배포

1. Railway 대시보드 → 서비스
2. "Deploy" → "Deploy latest commit" 클릭
3. 또는 Git에 푸시하면 자동 재배포

### Step 5: 로그 확인

1. Railway 대시보드 → 서비스 → Logs
2. 빌드 로그에서 확인:
   - `npm install` 실행됨 (npm ci 없음)
   - 서버 빌드 성공
   - 클라이언트 빌드 성공
   - 서버 시작 성공

---

## 🔍 로그에서 확인할 사항

### 성공적인 빌드 로그:
```
✓ Installing dependencies (npm install)
✓ Building server (npm run build)
✓ Building client (npm run build)
✓ Starting service (npm start)
```

### 일반적인 에러 메시지:

1. **"Cannot find Dockerfile"**
   - Dockerfile이 루트 디렉토리에 있는지 확인
   - railway.json에서 dockerfilePath 확인

2. **"TypeScript compilation error"**
   - TypeScript 오류
   - 로컬에서 빌드 테스트

3. **"npm ci" 명령어 발견**
   - Dockerfile에서 npm ci를 사용하지 않도록 확인
   - npm install만 사용

---

## 💡 빠른 해결 방법

### 방법 1: Railway 설정 재확인

1. 서비스 삭제 (선택사항)
2. 새 서비스 생성
3. GitHub 저장소 연결
4. **Builder: DOCKERFILE** 확인 (자동 감지)
5. 환경변수 설정
6. 배포

### 방법 2: railway.json 파일 확인

`server/railway.json` 파일이 올바르게 설정되어 있는지 확인:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## ✅ 성공 확인

배포 성공 후:
1. Railway 대시보드 → 서비스 → Settings
2. "Domains" 섹션에서 생성된 URL 확인
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

---

## 📞 추가 도움

여전히 문제가 있으면:
1. Railway 로그의 전체 에러 메시지 확인
2. 로컬에서 Dockerfile 빌드 테스트
3. 에러 메시지를 공유해주시면 더 구체적으로 도와드릴 수 있습니다

---

## 🔑 핵심 변경사항

### 이전 (npm ci 기반):
- ❌ `npm ci` 사용 → EBUSY 오류 발생
- ❌ Root Directory: `server` 설정 필요
- ❌ Build Command 수동 설정 필요

### 현재 (Dockerfile 기반):
- ✅ `npm install` 사용 → EBUSY 오류 없음
- ✅ 루트 디렉토리 사용 (Dockerfile 자동 감지)
- ✅ Dockerfile이 모든 빌드 단계 관리

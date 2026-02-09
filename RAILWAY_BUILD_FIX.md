# Railway 빌드 실패 해결 가이드

## 🔍 빌드 실패 원인 확인

Railway 대시보드에서:
1. "livescore" 서비스 클릭
2. "Logs" 탭 클릭
3. 빌드 로그에서 에러 메시지 확인

---

## ✅ Railway 올바른 설정

### 1. 서비스 설정 확인

Railway 대시보드 → 서비스 → Settings:

#### 필수 설정:
- **Root Directory**: `server` ⚠️ 중요!
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

#### 확인 방법:
1. Railway 대시보드 → 서비스 선택
2. Settings 탭
3. "Root Directory"가 `server`로 설정되어 있는지 확인
4. "Build Command"와 "Start Command" 확인

---

## 🔧 일반적인 빌드 실패 원인 및 해결

### 1. Root Directory 설정 오류

**문제**: Root Directory가 비어있거나 `./`로 설정됨

**해결**:
- Root Directory를 `server`로 설정

### 2. Build Command 오류

**문제**: `npm install` 대신 `npm ci` 사용 필요

**해결**:
- Build Command: `npm ci && npm run build`
- `npm ci`는 `package-lock.json`을 기반으로 정확한 버전 설치

### 3. TypeScript 빌드 오류

**문제**: TypeScript 컴파일 오류

**해결**:
1. 로컬에서 테스트:
   ```bash
   cd server
   npm ci
   npm run build
   ```
2. 오류가 있으면 수정 후 다시 푸시

### 4. 의존성 문제

**문제**: `devDependencies`가 프로덕션에서 설치되지 않음

**해결**:
- TypeScript는 `devDependencies`에 있지만 빌드에 필요
- Railway는 자동으로 `npm ci --production=false` 실행 (기본값)
- 또는 Build Command에 `NPM_CONFIG_PRODUCTION=false npm ci` 추가

### 5. 환경변수 누락

**문제**: 필수 환경변수가 설정되지 않음

**해결**:
- Railway → Variables 탭에서 환경변수 설정
- 필수 환경변수 목록은 아래 참고

---

## 📋 Railway 필수 설정 체크리스트

### 서비스 설정
- [ ] Root Directory: `server`
- [ ] Build Command: `npm ci && npm run build`
- [ ] Start Command: `npm start`

### 환경변수 (Variables 탭)
- [ ] `NODE_ENV=production`
- [ ] `PORT` (Railway가 자동 할당, 설정 불필요)
- [ ] `JWT_SECRET` (강력한 랜덤 문자열)
- [ ] `CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com`
- [ ] `DATABASE_URL` 또는 `MONGODB_URI` (MongoDB 연결 문자열)
- [ ] `THESPORTSDB_API_KEY=123`
- [ ] `CACHE_TTL_SECONDS=30`
- [ ] `POLL_INTERVAL_SECONDS=30`
- [ ] `PRIMARY_POLL_INTERVAL_SECONDS=30`
- [ ] `SECONDARY_POLL_INTERVAL_SECONDS=90`
- [ ] `DEFAULT_SPORTS=Soccer,Basketball,Baseball,American Football,Ice Hockey`

---

## 🛠️ 단계별 해결 방법

### Step 1: 로컬 빌드 테스트

```bash
cd server
npm ci
npm run build
```

오류가 있으면 수정 후 다시 푸시:
```bash
F:\PortableGit\bin\git.exe add .
F:\PortableGit\bin\git.exe commit -m "Fix build errors"
F:\PortableGit\bin\git.exe push origin main
```

### Step 2: Railway 설정 확인

1. Railway 대시보드 → 서비스 → Settings
2. Root Directory 확인: `server`
3. Build Command 확인: `npm ci && npm run build`
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
2. 빌드 로그에서 에러 확인
3. 에러 메시지에 따라 수정

---

## 🔍 로그에서 확인할 사항

### 빌드 단계 로그 확인:
```
✓ Installing dependencies
✓ Building project
✓ Starting service
```

### 일반적인 에러 메시지:

1. **"Cannot find module"**
   - 의존성 설치 실패
   - `package-lock.json` 확인

2. **"TypeScript compilation error"**
   - TypeScript 오류
   - 로컬에서 `npm run build` 테스트

3. **"Root Directory not found"**
   - Root Directory가 `server`로 설정되지 않음

4. **"Command not found"**
   - Build Command 또는 Start Command 오류

---

## 💡 빠른 해결 방법

### 방법 1: Railway 설정 재확인

1. 서비스 삭제 (선택사항)
2. 새 서비스 생성
3. GitHub 저장소 연결
4. **Root Directory: `server`** 설정 ⚠️ 중요!
5. 환경변수 설정
6. 배포

### 방법 2: railway.json 파일 생성 (선택사항)

`server/railway.json` 파일 생성:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
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
2. 로컬에서 `cd server && npm ci && npm run build` 테스트
3. 에러 메시지를 공유해주시면 더 구체적으로 도와드릴 수 있습니다

# Railway 배포 오류 해결 가이드

## 🚨 현재 상황

Railway 대시보드에서 확인된 상태:
- ⚠️ **"There was an error deploying from source"** - 배포 오류 발생
- 배포 시도: `SHWOO24/livescore`
- 서비스: `livescore` (Edited, 3 Changes)

---

## ✅ 즉시 확인 사항

### 1. 배포 로그 확인 (가장 중요!)

Railway 대시보드에서:

1. **"Logs"** 탭 클릭
2. 배포 로그 확인
3. 에러 메시지 확인

**확인할 에러 유형**:

#### "Cannot find package.json"
- **원인**: Root Directory 설정 오류
- **해결**: Root Directory를 `server`로 설정

#### "TypeScript compilation error"
- **원인**: TypeScript 빌드 오류
- **해결**: 로컬에서 빌드 테스트 후 오류 수정

#### "Required environment variable not set"
- **원인**: 환경변수 누락
- **해결**: 모든 필수 환경변수 설정

#### "npm ERR!" 또는 "Cannot find module"
- **원인**: 의존성 설치 실패
- **해결**: `package-lock.json` 확인, Build Command 확인

---

## 🔧 단계별 해결 방법

### Step 1: 로그 확인

1. Railway 대시보드 → 프로젝트 선택
2. **"Logs"** 탭 클릭
3. 최신 배포 로그 확인
4. 에러 메시지 복사

**로그 확인 방법**:
- Deployments 탭 → 최신 배포 클릭 → "View Logs" 클릭
- 또는 Logs 탭에서 실시간 로그 확인

---

### Step 2: Root Directory 확인

가장 흔한 원인입니다!

1. Railway 대시보드 → 프로젝트 → 서비스 선택
2. **"Settings"** 탭 클릭
3. **"Source"** 섹션 확인
4. **Root Directory** 필드 확인:
   - 비어있거나 `./`로 되어 있으면 → `server`로 변경
   - 이미 `server`로 설정되어 있으면 → 다른 원인 확인

---

### Step 3: Build Command 확인

Settings → Build 섹션:

1. **Custom Build Command** 확인:
   ```bash
   npm ci && npm run build
   ```

2. 설정되어 있지 않으면:
   - "Custom Build Command" 클릭
   - `npm ci && npm run build` 입력
   - 저장

---

### Step 4: 로컬 빌드 테스트

로컬에서 빌드가 성공하는지 확인:

```bash
cd server
npm ci
npm run build
```

**오류가 발생하면**:
- TypeScript 오류 수정
- 의존성 문제 해결
- 코드 수정 후 Git에 푸시:
  ```bash
  git add .
  git commit -m "Fix build errors"
  git push origin main
  ```

**성공하면**:
- Railway 설정 문제일 가능성이 높음
- 위의 Step 2, 3 확인

---

### Step 5: 환경변수 확인

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭:

#### 필수 환경변수 확인:

```
NODE_ENV=production
JWT_SECRET=your-strong-random-string
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
DATABASE_URL=mongodb+srv://...
THESPORTSDB_API_KEY=123
PRIMARY_POLL_INTERVAL_SECONDS=30
SECONDARY_POLL_INTERVAL_SECONDS=90
CACHE_TTL_SECONDS=30
DEFAULT_SPORTS=Soccer,Basketball,Baseball,American Football,Ice Hockey
```

**모든 필수 환경변수가 설정되어 있는지 확인**

---

### Step 6: 재배포

설정을 수정한 후:

1. Railway 대시보드 → 프로젝트
2. **"Deploy"** 버튼 클릭
3. 또는 Git에 푸시하면 자동 재배포

---

## 🐛 일반적인 배포 오류 및 해결

### 오류 1: "Cannot find package.json"

**원인**: Root Directory가 설정되지 않음

**해결**:
1. Settings → Source → Root Directory = `server` 설정
2. 저장
3. 재배포

---

### 오류 2: "TypeScript compilation error"

**원인**: TypeScript 빌드 오류

**해결**:
1. 로컬에서 테스트:
   ```bash
   cd server
   npm ci
   npm run build
   ```
2. 오류 수정
3. Git에 푸시
4. 자동 재배포 대기

---

### 오류 3: "Required environment variable not set"

**원인**: 필수 환경변수 누락

**해결**:
1. Variables 탭에서 모든 필수 환경변수 확인
2. 누락된 환경변수 추가
3. 재배포

---

### 오류 4: "npm ERR!" 또는 "Cannot find module"

**원인**: 의존성 설치 실패

**해결**:
1. `package-lock.json` 파일 확인
2. Build Command에 `npm ci` 사용 확인
3. 로컬에서 `npm ci` 테스트

---

### 오류 5: "Build command failed"

**원인**: Build Command 오류

**해결**:
1. Build Command 확인: `npm ci && npm run build`
2. 로컬에서 동일한 명령어 테스트
3. 오류 수정

---

## 📋 배포 오류 해결 체크리스트

```
[ ] 배포 로그 확인 (에러 메시지 확인)
[ ] Root Directory: `server` 설정됨
[ ] Build Command: `npm ci && npm run build` 설정됨
[ ] Start Command: `npm start` 확인됨
[ ] 로컬에서 `npm run build` 성공 확인
[ ] 모든 필수 환경변수 설정됨
[ ] Git에 최신 코드 푸시됨
[ ] 재배포 시도
[ ] 배포 성공 확인
```

---

## 💡 빠른 해결 방법

### 가장 흔한 원인: Root Directory 설정 오류

**해결**:
1. Settings → Source → Root Directory = `server` 설정
2. 저장
3. 재배포

이것만으로도 대부분의 배포 오류가 해결됩니다!

---

## 🔍 로그 확인 방법

### Railway 대시보드에서:

1. **방법 1**: Logs 탭
   - 프로젝트 → Logs 탭 클릭
   - 실시간 로그 확인

2. **방법 2**: Deployments 탭
   - 프로젝트 → 서비스 → Deployments 탭
   - 최신 배포 클릭
   - "View Logs" 클릭

---

## ✅ 배포 성공 확인

배포가 성공하면:

1. 대시보드에서 "Deployed successfully" 확인
2. 서비스 상태가 "Live" 또는 "Running" 확인
3. 헬스체크:
   ```bash
   curl https://your-service.railway.app/api/health
   ```

**예상 응답**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🔗 관련 문서

- [Railway 설정 구성](./RAILWAY_SETTINGS_CONFIGURATION.md)
- [빌드 실패 해결](./BUILD_FAILED_FIX.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)

---

## 📞 추가 도움

여전히 문제가 있으면:

1. 배포 로그의 전체 에러 메시지 복사
2. 로컬 빌드 테스트 결과 확인
3. 에러 메시지를 공유해주시면 더 구체적으로 도와드릴 수 있습니다

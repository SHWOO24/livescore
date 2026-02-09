# 빌드 실패 문제 해결 가이드

## 🚨 현재 상황

대시보드에서 확인된 상태:
- ⚠️ **"Build failed now"** - 빌드 실패
- 서비스: `livescore`
- 환경: `production`

---

## ✅ 즉시 확인 사항

### 1. 빌드 로그 확인 (가장 중요!)

대시보드에서:

1. **"Logs"** 탭 클릭
2. 빌드 로그 확인
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

### Step 1: 로컬 빌드 테스트

로컬에서 빌드가 성공하는지 확인:

```bash
cd server
npm ci
npm run build
```

**오류가 발생하면**:
- TypeScript 오류 수정
- 의존성 문제 해결
- 코드 수정 후 Git에 푸시

**성공하면**:
- 다음 단계로 진행

---

### Step 2: 서비스 설정 확인

대시보드 → 서비스 → **Settings** 탭:

#### 필수 설정 확인:

1. **Root Directory**: `server` ⚠️ **반드시 확인!**
   - 비어있거나 `./`로 되어 있으면 `server`로 변경

2. **Build Command**: 
   ```bash
   npm ci && npm run build
   ```

3. **Start Command**:
   ```bash
   npm start
   ```

#### 설정 방법:

1. Settings 탭 클릭
2. "Root Directory" 필드에 `server` 입력
3. "Build Command" 필드에 `npm ci && npm run build` 입력
4. "Start Command" 필드에 `npm start` 입력
5. 저장

---

### Step 3: 환경변수 확인

대시보드 → 서비스 → **Variables** (또는 **Environment**) 탭:

#### 필수 환경변수:

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

**주의**: `PORT`는 플랫폼이 자동 할당하므로 설정하지 않아도 됩니다.

---

### Step 4: 재배포

설정을 변경한 후:

1. 대시보드 → 서비스
2. **"Deploy"** 또는 **"Redeploy"** 버튼 클릭
3. 또는 Git에 푸시하면 자동 재배포

---

## 🐛 일반적인 빌드 실패 원인 및 해결

### 문제 1: Root Directory 설정 오류

**증상**:
```
Cannot find package.json
Root Directory not found
```

**해결**:
- Settings → Root Directory = `server` 설정

---

### 문제 2: TypeScript 빌드 오류

**증상**:
```
TypeScript compilation error
Cannot find module './...'
```

**해결**:
1. 로컬에서 테스트:
   ```bash
   cd server
   npm ci
   npm run build
   ```
2. 오류 수정
3. Git에 푸시:
   ```bash
   git add .
   git commit -m "Fix TypeScript build errors"
   git push origin main
   ```

---

### 문제 3: 의존성 설치 실패

**증상**:
```
npm ERR!
Cannot find module '...'
```

**해결**:
1. `package-lock.json` 파일 확인
2. Build Command에 `npm ci` 사용 (권장)
3. 로컬에서 `npm ci` 테스트

---

### 문제 4: 환경변수 누락

**증상**:
```
Required environment variable not set: DATABASE_URL
```

**해결**:
- Variables 탭에서 모든 필수 환경변수 설정

---

### 문제 5: Build Command 오류

**증상**:
```
Command not found
Build command failed
```

**해결**:
- Build Command 확인: `npm ci && npm run build`
- Start Command 확인: `npm start`

---

## 📋 빌드 실패 해결 체크리스트

```
[ ] 로컬에서 `npm run build` 성공 확인
[ ] Root Directory: `server` 설정됨
[ ] Build Command: `npm ci && npm run build` 설정됨
[ ] Start Command: `npm start` 설정됨
[ ] 모든 필수 환경변수 설정됨
[ ] Git에 최신 코드 푸시됨
[ ] 재배포 시도
[ ] 빌드 로그 확인
[ ] 빌드 성공 확인
```

---

## 🔍 빌드 로그 확인 방법

### Render 사용 시:

1. Render 대시보드 → 서비스 선택
2. **"Logs"** 탭 클릭
3. 빌드 단계별 로그 확인:
   ```
   ✓ Installing dependencies
   ✓ Building project
   ✓ Starting service
   ```

### Railway 사용 시:

1. Railway 대시보드 → 프로젝트 → 서비스 선택
2. **"Deployments"** 탭 클릭
3. 최신 배포 클릭
4. **"View Logs"** 클릭
5. 빌드 로그 확인

---

## 💡 빠른 해결 방법

### 방법 1: 설정만 수정 (권장)

1. Settings → Root Directory = `server` 확인
2. Build Command = `npm ci && npm run build` 확인
3. Start Command = `npm start` 확인
4. Variables → 모든 필수 환경변수 확인
5. 재배포

### 방법 2: 로컬 빌드 테스트 후 수정

1. 로컬에서 `cd server && npm ci && npm run build` 실행
2. 오류 수정
3. Git에 푸시
4. 자동 재배포 대기

---

## ✅ 빌드 성공 확인

빌드가 성공하면:

1. 대시보드에서 "Deployed successfully" 확인
2. 서비스 상태가 "Live" 또는 "Running" 확인
3. 헬스체크:
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

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md)
- [Railway 빠른 해결](./RAILWAY_QUICK_FIX.md)
- [프로젝트 삭제 문제 해결](./PROJECT_DELETION_FIX.md)

---

## 📞 추가 도움

여전히 문제가 있으면:

1. 빌드 로그의 전체 에러 메시지 복사
2. 로컬 빌드 테스트 결과 확인
3. 에러 메시지를 공유해주시면 더 구체적으로 도와드릴 수 있습니다

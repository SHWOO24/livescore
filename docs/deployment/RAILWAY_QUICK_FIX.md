# Railway 배포 실패 빠른 해결 가이드

## 🚨 현재 상황

GitHub 저장소에서 Railway 배포가 실패하고 있습니다:
- ❌ `inspiring-laughter / production` - 실패
- ❌ `tender-radiance / production` - 실패

---

## ✅ 즉시 확인할 3가지

### 1. Railway 로그 확인 (가장 중요!)

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 선택
3. 실패한 서비스 클릭
4. **"Logs"** 탭 클릭
5. 빌드 로그에서 에러 메시지 확인

**확인할 에러**:
- "Cannot find package.json" → Root Directory 설정 오류
- "TypeScript compilation error" → 빌드 오류
- "Required environment variable" → 환경변수 누락

---

### 2. Root Directory 설정 확인 ⚠️ 필수!

Railway 대시보드 → 서비스 → **Settings** 탭:

**확인 사항**:
- **Root Directory**: `server` (반드시 `server`로 설정!)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

**설정 방법**:
1. Settings 탭 클릭
2. "Root Directory" 필드에 `server` 입력
3. 저장

---

### 3. 환경변수 확인

Railway 대시보드 → 서비스 → **Variables** 탭:

**필수 환경변수**:
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

---

## 🔧 해결 방법

### 방법 1: 설정 수정 후 재배포 (권장)

1. **Root Directory 확인**: Settings → Root Directory = `server`
2. **Build Command 확인**: `npm ci && npm run build`
3. **Start Command 확인**: `npm start`
4. **환경변수 확인**: Variables 탭에서 모든 필수 변수 설정
5. **재배포**: Deploy → Deploy latest commit

### 방법 2: 서비스 재생성

1. Railway 대시보드 → 프로젝트
2. 실패한 서비스 삭제 (선택사항)
3. **"New"** → **"GitHub Repo"** 클릭
4. 저장소 선택
5. **Root Directory: `server`** 설정 ⚠️ 중요!
6. 환경변수 설정
7. 배포

---

## 📋 체크리스트

```
[ ] Railway 로그 확인 (에러 메시지 확인)
[ ] Root Directory: `server` 설정됨
[ ] Build Command: `npm ci && npm run build` 설정됨
[ ] Start Command: `npm start` 설정됨
[ ] 모든 필수 환경변수 설정됨
[ ] 재배포 시도
[ ] 배포 성공 확인
```

---

## 🔍 로그에서 확인할 사항

### 성공한 배포 로그:
```
✓ Installing dependencies
✓ Building project
✓ Starting service
```

### 실패한 배포 로그:
- "Cannot find package.json" → Root Directory 오류
- "TypeScript compilation error" → 빌드 오류
- "Required environment variable" → 환경변수 누락

---

## 💡 빠른 해결

**가장 흔한 원인**: Root Directory가 설정되지 않음

**해결**: Settings → Root Directory = `server` 설정 후 재배포

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [Railway 배포 문제 해결](./RAILWAY_DEPLOYMENT_TROUBLESHOOT.md)
- [Railway 빌드 수정](./RAILWAY_BUILD_FIX.md)

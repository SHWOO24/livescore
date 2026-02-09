# Railway 배포 오류: "tsc: not found" 해결 가이드

## 🚨 현재 상황

배포 로그에서 확인된 오류:
- ❌ **"sh: 1: tsc: not found"**
- ❌ **"ERROR: failed to build: failed to solve: process "npm run build" did not complete successfully: exit code: 127"**
- 빌드 ID: `9a1a1723`
- 상태: **Failed**

---

## 🔍 문제 원인 분석

### 로그 분석:

1. **빌드가 루트 디렉토리(`/`)에서 실행됨**:
   ```
   npm run build
   → cd client && npm run build
   → tsc && vite build
   → tsc: not found ❌
   ```

2. **문제점**:
   - Railway가 루트 디렉토리에서 빌드를 시도하고 있습니다
   - 루트 `package.json`의 `build` 스크립트가 `client` 디렉토리로 이동합니다
   - 하지만 **백엔드는 `server` 디렉토리에 있습니다**
   - Root Directory가 설정되지 않아서 Railway가 루트에서 빌드를 시도합니다

---

## ✅ 해결 방법

### 방법 1: Root Directory 설정 (권장)

Railway 대시보드에서:

1. **프로젝트 선택** → **서비스 선택**
2. **Settings** 탭 클릭
3. **Source** 섹션 찾기
4. **Root Directory** 필드에 `server` 입력
5. **저장**

**이것이 가장 중요한 설정입니다!**

---

### 방법 2: Build Command 직접 설정

Root Directory 설정이 안 되면:

1. **Settings** → **Build** 섹션
2. **Custom Build Command** 클릭
3. 다음 명령어 입력:
   ```bash
   cd server && npm ci && npm run build
   ```
4. **저장**

---

## 🔧 추가 확인 사항

### 1. Start Command 확인

Settings → Command 섹션:

- **Command**: `npm start` 확인
- 또는: `cd server && npm start`

**주의**: Root Directory를 `server`로 설정하면 `npm start`만으로 충분합니다.

---

### 2. 환경변수 확인

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭:

#### 필수 환경변수:

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

---

## 📋 설정 체크리스트

```
[ ] Root Directory: `server` 설정됨 ⚠️ 가장 중요!
[ ] Build Command: `npm ci && npm run build` (자동 인식)
[ ] Start Command: `npm start` 확인됨
[ ] 모든 필수 환경변수 설정됨
[ ] 재배포 시도
[ ] 배포 성공 확인
```

---

## 🚀 재배포

설정을 변경한 후:

1. Railway 대시보드 → 프로젝트
2. **"Deploy"** 버튼 클릭
3. 또는 Git에 푸시하면 자동 재배포

---

## 🔍 예상되는 성공 로그

Root Directory를 `server`로 설정하면:

```
✓ Installing dependencies
✓ Building project
  → npm ci
  → npm run build
  → tsc (TypeScript 컴파일)
✓ Starting service
  → npm start
  → node dist/index.js
```

**성공 메시지**: "Deployed successfully"

---

## 💡 빠른 해결 방법

**가장 중요한 단계**:

1. **Settings** → **Source** → **Root Directory** = `server` 설정
2. **저장**
3. **재배포**

이것만으로도 `tsc: not found` 오류가 해결됩니다!

---

## 🐛 여전히 문제가 있으면

### 로컬 빌드 테스트

로컬에서 `server` 디렉토리에서 빌드가 성공하는지 확인:

```bash
cd server
npm ci
npm run build
```

**성공하면**: Railway 설정 문제
**실패하면**: 코드 문제 (TypeScript 오류 등)

---

## 🔗 관련 문서

- [Railway 배포 오류 해결](./RAILWAY_DEPLOYMENT_ERROR_FIX.md)
- [Railway 설정 구성](./RAILWAY_SETTINGS_CONFIGURATION.md)
- [빌드 실패 해결](./BUILD_FAILED_FIX.md)

---

## 📞 다음 단계

1. Root Directory: `server` 설정
2. 저장
3. 재배포
4. 배포 성공 확인
5. 헬스체크 확인

Root Directory를 설정하면 배포가 성공할 것입니다!

# Railway 설정 구성 가이드

## 🎯 현재 확인된 설정

Railway 대시보드에서 다음 설정 화면들이 확인되었습니다:

### 1. Source 섹션
- Source Repo: `SHWOO24/livescore` ✅
- Branch: `main` ✅
- **"Add Root Directory"** 링크가 표시됨 ⚠️ **중요!**

### 2. Build 섹션
- Region: US West (California, USA)
- Replicas: 1
- CPU: 2 vCPU, Memory: 1 GB
- Builder: Railpack
- Metal Build Environment: OFF

### 3. Command 섹션
- Command: `npm start` ✅
- Teardown: 활성화됨
- Serverless: 비활성화됨
- Restart Policy: On Failure

---

## ⚠️ 즉시 조치 필요: Root Directory 설정

### 문제

Source 섹션에 **"Add Root Directory"** 링크가 표시되어 있습니다. 이것은 Root Directory가 설정되지 않았다는 의미입니다.

**Root Directory가 설정되지 않으면 빌드가 실패합니다!**

---

## ✅ 해결 방법

### Step 1: Root Directory 설정

1. **Source 섹션**에서 **"Add Root Directory"** 링크 클릭
2. 입력 필드에 `server` 입력
3. 저장

**또는**:

1. Settings 화면에서 "Root Directory" 필드 찾기
2. `server` 입력
3. 저장

---

### Step 2: Build Command 확인

Build 섹션에서:

1. **"Custom Build Command"** 클릭
2. 다음 명령어 입력:
   ```bash
   npm ci && npm run build
   ```
3. 저장

**또는**:

- `railway.json` 파일이 있으면 자동으로 인식됩니다
- 파일이 없으면 위의 Custom Build Command를 설정하세요

---

### Step 3: 환경변수 설정

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭:

#### 필수 환경변수 추가:

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

### Step 4: 도메인 생성

Networking 섹션에서:

1. **"⚡ Generate Domain"** 버튼 클릭
2. 생성된 도메인 확인 (예: `https://your-service.railway.app`)
3. 이 URL을 프론트엔드 환경변수에 사용

---

## 📋 설정 체크리스트

### Source 섹션
- [ ] Source Repo: `SHWOO24/livescore` 확인됨
- [ ] Branch: `main` 확인됨
- [ ] **Root Directory: `server` 설정됨** ⚠️ 중요!

### Build 섹션
- [ ] Region 선택됨
- [ ] Replicas: 1 설정됨
- [ ] CPU/Memory 할당 확인됨
- [ ] **Custom Build Command: `npm ci && npm run build` 설정됨** ⚠️ 중요!

### Command 섹션
- [ ] Command: `npm start` 확인됨
- [ ] Teardown: 활성화됨
- [ ] Restart Policy: On Failure 설정됨

### Networking 섹션
- [ ] 도메인 생성됨
- [ ] Public Networking 활성화됨

### Variables 섹션
- [ ] 모든 필수 환경변수 설정됨

---

## 🔧 추가 설정 권장사항

### Metal Build Environment 활성화 (선택사항)

Build 섹션에서:

1. **"Use Metal Build Environment"** 토글 ON
2. 더 빠른 빌드 환경 사용

**주의**: 새로운 기능이므로 안정성을 확인한 후 사용하세요.

---

## 🚀 배포 확인

설정을 변경하면 자동으로 재배포가 시작됩니다.

1. **배포 상태 확인**:
   - 대시보드에서 "Deploying..." → "Deployed successfully" 확인

2. **로그 확인**:
   - "Logs" 탭에서 빌드 및 시작 로그 확인
   - 에러가 없으면 성공

3. **헬스체크**:
   ```bash
   curl https://your-service.railway.app/api/health
   ```

---

## 🐛 문제 해결

### 빌드 실패 시:

1. **Logs 탭 확인**:
   - 에러 메시지 확인
   - 가장 흔한 원인: Root Directory 설정 오류

2. **Root Directory 확인**:
   - Settings → Root Directory = `server` 확인

3. **Build Command 확인**:
   - Custom Build Command = `npm ci && npm run build` 확인

---

## 💡 빠른 해결 방법

**가장 중요한 설정**:

1. **Root Directory: `server`** 설정 ⚠️ 필수!
2. **Custom Build Command: `npm ci && npm run build`** 설정
3. **Command: `npm start`** 확인
4. **환경변수 설정**
5. **도메인 생성**

이 5가지만 설정하면 배포가 성공합니다!

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [Railway 새 프로젝트 생성](./RAILWAY_NEW_PROJECT_STEP_BY_STEP.md)
- [빌드 실패 해결](./BUILD_FAILED_FIX.md)

---

## 📞 다음 단계

1. Root Directory 설정 (`server`)
2. Custom Build Command 설정 (`npm ci && npm run build`)
3. 환경변수 설정
4. 도메인 생성
5. 배포 완료 대기
6. 헬스체크 확인
7. 프론트엔드 환경변수 업데이트

# Railway 배포 실패 문제 해결 가이드

## 🔍 현재 상황

GitHub 저장소에서 Railway 배포가 실패하고 있습니다:
- `inspiring-laughter / production` - 실패 ❌
- `tender-radiance / production` - 실패 ❌

---

## ✅ 즉시 확인 사항

### 1. Railway 대시보드에서 로그 확인

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 선택
3. 실패한 서비스 클릭
4. **"Logs"** 탭 클릭
5. 빌드 로그에서 에러 메시지 확인

**확인할 에러 유형**:
- TypeScript 컴파일 오류
- 모듈을 찾을 수 없음
- 환경변수 누락
- Root Directory 설정 오류

---

## 🔧 단계별 해결 방법

### Step 1: Railway 서비스 설정 확인

Railway 대시보드 → 서비스 → **Settings** 탭:

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

1. Railway 대시보드 → 프로젝트 → 서비스 선택
2. Settings 탭 클릭
3. "Root Directory" 필드에 `server` 입력
4. "Build Command" 필드에 `npm ci && npm run build` 입력
5. "Start Command" 필드에 `npm start` 입력
6. 저장

---

### Step 2: 로컬 빌드 테스트

로컬에서 빌드가 성공하는지 확인:

```bash
cd server
npm ci
npm run build
```

**오류가 발생하면**:
- TypeScript 오류 수정
- 의존성 문제 해결
- 코드 수정 후 다시 푸시

---

### Step 3: 환경변수 확인

Railway 대시보드 → 서비스 → **Variables** 탭:

#### 필수 환경변수:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NODE_ENV` | `production` | Node 환경 |
| `JWT_SECRET` | `your-strong-random-string` | JWT 시크릿 (최소 32자) |
| `CORS_ORIGIN` | `https://scorelivenow.com,https://www.scorelivenow.com` | CORS 허용 도메인 |
| `DATABASE_URL` | `mongodb+srv://...` | MongoDB 연결 문자열 |
| `THESPORTSDB_API_KEY` | `123` | TheSportsDB API 키 |
| `PRIMARY_POLL_INTERVAL_SECONDS` | `30` | Primary Sport 폴링 주기 |
| `SECONDARY_POLL_INTERVAL_SECONDS` | `90` | Secondary Sports 폴링 주기 |
| `CACHE_TTL_SECONDS` | `30` | 캐시 TTL |
| `DEFAULT_SPORTS` | `Soccer,Basketball,Baseball,American Football,Ice Hockey` | 기본 스포츠 목록 |

**주의**: `PORT`는 Railway가 자동 할당하므로 설정하지 않아도 됩니다.

---

### Step 4: 재배포

설정을 변경한 후:

1. Railway 대시보드 → 서비스
2. **"Deploy"** 버튼 클릭
3. **"Deploy latest commit"** 선택
4. 또는 Git에 푸시하면 자동 재배포

---

## 🐛 일반적인 문제 및 해결

### 문제 1: Root Directory 설정 오류

**증상**: 
- "Cannot find package.json"
- "Root Directory not found"

**해결**:
- Root Directory를 `server`로 설정

### 문제 2: TypeScript 빌드 오류

**증상**:
- "TypeScript compilation error"
- "Cannot find module"

**해결**:
1. 로컬에서 테스트:
   ```bash
   cd server
   npm ci
   npm run build
   ```
2. 오류 수정 후 다시 푸시

### 문제 3: 의존성 설치 실패

**증상**:
- "npm ERR!"
- "Cannot find module"

**해결**:
- `package-lock.json` 파일이 있는지 확인
- Build Command에 `npm ci` 사용 (권장)

### 문제 4: 환경변수 누락

**증상**:
- 서버 시작 후 즉시 종료
- "Required environment variable not set"

**해결**:
- Railway Variables 탭에서 모든 필수 환경변수 설정

---

## 📋 Railway 설정 체크리스트

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
- [ ] Railway에서 재배포 시도
- [ ] 배포 로그 확인
- [ ] 배포 성공 확인

---

## 🔍 배포 로그 확인 방법

1. Railway 대시보드 → 프로젝트 → 서비스
2. **"Deployments"** 탭 클릭
3. 최신 배포 클릭
4. **"View Logs"** 클릭
5. 빌드 단계별 로그 확인:

```
✓ Installing dependencies
✓ Building project
✓ Starting service
```

**실패 시**:
- 에러 메시지 확인
- 위의 문제 해결 방법 참고

---

## 💡 빠른 해결 방법

### 방법 1: 서비스 재생성 (권장)

1. Railway 대시보드 → 프로젝트
2. 실패한 서비스 삭제 (선택사항)
3. **"New"** → **"GitHub Repo"** 클릭
4. 저장소 선택
5. **Root Directory: `server`** 설정 ⚠️ 중요!
6. 환경변수 설정
7. 배포

### 방법 2: 설정만 수정

1. Railway 대시보드 → 서비스 → Settings
2. Root Directory 확인: `server`
3. Build Command 확인: `npm ci && npm run build`
4. Start Command 확인: `npm start`
5. Variables 탭에서 환경변수 확인
6. 재배포

---

## ✅ 배포 성공 확인

배포가 성공하면:

1. Railway 대시보드 → 서비스 → Settings
2. **"Domains"** 섹션에서 URL 확인
   - 예: `https://your-service.railway.app`

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

4. 프론트엔드 환경변수 설정:
   ```env
   VITE_API_BASE_URL=https://your-service.railway.app
   VITE_SOCKET_URL=https://your-service.railway.app
   ```

---

## 📞 추가 도움

여전히 문제가 있으면:

1. Railway 로그의 전체 에러 메시지 복사
2. 로컬 빌드 테스트 결과 확인
3. 에러 메시지를 공유해주시면 더 구체적으로 도와드릴 수 있습니다

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [Railway 빌드 수정](./RAILWAY_BUILD_FIX.md)
- [문제 해결 가이드](./TROUBLESHOOT.md)

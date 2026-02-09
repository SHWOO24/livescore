# Railway Root Directory 설정 완료 확인

## ✅ 현재 설정 확인

Railway 대시보드에서 확인된 설정:
- ✅ **Code Location: `/server`** - 올바르게 설정됨!
- ✅ **Branch: `main`** - 연결됨
- ✅ **Wait for CI: OFF** - 설정됨
- ✅ **Networking: Public domain will be generated** - 도메인 생성 예정
- ✅ **Scale: US West, 1 Replica** - 설정됨

---

## 🚀 다음 단계

### 1. 환경변수 설정 확인

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭:

#### 필수 환경변수 확인:

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

**모든 필수 환경변수가 설정되어 있는지 확인하세요.**

---

### 2. Build Command 확인

Settings → **Build** 섹션에서:

- **Custom Build Command**: `npm ci && npm run build` 확인
- 또는 `railway.json` 파일이 있으면 자동 인식됨

---

### 3. Start Command 확인

Settings → **Deploy** 섹션에서:

- **Start Command**: `npm start` 확인
- 또는 `railway.json` 파일이 있으면 자동 인식됨

---

### 4. 재배포

Root Directory가 설정되었으므로 이제 재배포를 시도하세요:

1. Railway 대시보드 → 프로젝트
2. **"Deploy"** 버튼 클릭
3. 또는 Git에 푸시하면 자동 재배포

---

## 📋 배포 성공 확인

### 예상되는 성공 로그:

```
✓ Installing dependencies
  → npm ci (server 디렉토리에서)
✓ Building project
  → npm run build
  → tsc (TypeScript 컴파일 성공)
✓ Starting service
  → npm start
  → node dist/index.js
```

**성공 메시지**: "Deployed successfully"

---

### 배포 확인 방법:

1. **배포 상태 확인**:
   - 대시보드에서 "Deploying..." → "Deployed successfully" 확인

2. **로그 확인**:
   - "Logs" 탭에서 빌드 및 시작 로그 확인
   - 에러가 없으면 성공

3. **서비스 URL 확인**:
   - Networking 섹션에서 생성된 도메인 확인
   - 또는 Settings → Domains 섹션

4. **헬스체크**:
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

## 🔧 문제 해결

### 여전히 빌드 실패 시:

1. **Logs 탭 확인**:
   - 에러 메시지 확인
   - `tsc: not found` 오류가 사라졌는지 확인

2. **로컬 빌드 테스트**:
   ```bash
   cd server
   npm ci
   npm run build
   ```
   - 성공하면 Railway 설정 문제
   - 실패하면 코드 문제

---

## 📋 최종 체크리스트

```
[ ] Root Directory: `/server` 설정됨 ✅
[ ] Branch: `main` 연결됨 ✅
[ ] 모든 필수 환경변수 설정됨
[ ] Build Command 확인됨
[ ] Start Command 확인됨
[ ] 재배포 시도
[ ] 배포 성공 확인
[ ] 서비스 URL 확인
[ ] 헬스체크 통과
[ ] 프론트엔드 환경변수 업데이트
```

---

## 🔄 프론트엔드 업데이트

백엔드 배포가 성공하면:

1. **서비스 URL 확인**:
   - Railway 대시보드 → Networking 섹션
   - 또는 Settings → Domains 섹션

2. **프론트엔드 환경변수 업데이트**:
   ```bash
   cd client
   npm run create:env
   ```
   새 백엔드 URL 입력 (예: `https://your-service.railway.app`)

3. **재빌드**:
   ```bash
   npm run build
   ```

4. **재배포**:
   - `client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드

---

## 💡 중요 사항

1. **Root Directory가 `/server`로 설정되었습니다** ✅
   - 이제 Railway가 올바른 디렉토리에서 빌드를 시도합니다

2. **환경변수 확인**:
   - 모든 필수 환경변수가 설정되어 있는지 확인하세요

3. **재배포**:
   - 설정 변경 후 재배포가 필요합니다

---

## 🔗 관련 문서

- [Railway tsc not found 해결](./RAILWAY_TSC_NOT_FOUND_FIX.md)
- [Railway 배포 오류 해결](./RAILWAY_DEPLOYMENT_ERROR_FIX.md)
- [Railway 설정 구성](./RAILWAY_SETTINGS_CONFIGURATION.md)

---

## 📞 다음 단계

1. 환경변수 확인 및 설정
2. 재배포 시도
3. 배포 성공 확인
4. 헬스체크 확인
5. 프론트엔드 환경변수 업데이트

Root Directory가 올바르게 설정되었으므로 이제 배포가 성공할 것입니다!

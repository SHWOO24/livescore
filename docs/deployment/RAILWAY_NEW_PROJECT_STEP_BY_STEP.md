# Railway 새 프로젝트 생성 단계별 가이드

## 🚀 현재 단계

Railway 대시보드에서 "What would you like to create?" 메뉴가 표시되었습니다.
**"GitHub Repository"** 옵션이 선택되어 있습니다.

---

## ✅ 다음 단계

### Step 1: GitHub 저장소 선택

1. **"GitHub Repository"** 옵션 클릭 (이미 선택되어 있음)
2. GitHub 저장소 목록이 표시됩니다
3. **`livescore`** 또는 해당 저장소 선택
4. **"Deploy"** 또는 **"Add"** 버튼 클릭

---

### Step 2: 서비스 설정

프로젝트가 생성되면 자동으로 서비스가 생성됩니다. 다음 설정을 확인하세요:

#### 필수 설정 확인:

1. **서비스 선택** → **Settings** 탭 클릭

2. **Root Directory 설정** ⚠️ **가장 중요!**
   - "Root Directory" 필드에 `server` 입력
   - 저장

3. **Build Command 확인**:
   ```bash
   npm ci && npm run build
   ```

4. **Start Command 확인**:
   ```bash
   npm start
   ```

---

### Step 3: 환경변수 설정

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭:

#### 필수 환경변수 추가:

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

**환경변수 추가 방법**:
1. Variables 탭 클릭
2. "+ New Variable" 클릭
3. 변수명과 값 입력
4. 저장
5. 모든 필수 환경변수 추가

---

### Step 4: 배포 확인

환경변수를 설정하면 자동으로 재배포가 시작됩니다.

1. **배포 상태 확인**:
   - 대시보드에서 배포 진행 상황 확인
   - "Deploying..." → "Deployed successfully" 확인

2. **로그 확인**:
   - "Logs" 탭 클릭
   - 빌드 및 시작 로그 확인
   - 에러가 없으면 성공

3. **서비스 URL 확인**:
   - Settings 탭 → "Domains" 섹션
   - 생성된 URL 확인 (예: `https://your-service.railway.app`)

---

### Step 5: 헬스체크

배포가 완료되면 헬스체크를 실행하세요:

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

### 빌드 실패 시:

1. **Logs 탭 확인**:
   - 에러 메시지 확인
   - 가장 흔한 원인: Root Directory 설정 오류

2. **Root Directory 확인**:
   - Settings → Root Directory = `server` 확인

3. **로컬 빌드 테스트**:
   ```bash
   cd server
   npm ci
   npm run build
   ```
   - 오류가 있으면 수정 후 Git에 푸시

---

## 📋 체크리스트

```
[ ] GitHub 저장소 선택 완료
[ ] 프로젝트 생성 완료
[ ] Root Directory: `server` 설정됨
[ ] Build Command 확인됨
[ ] Start Command 확인됨
[ ] 모든 필수 환경변수 설정됨
[ ] 배포 완료 대기
[ ] 배포 성공 확인
[ ] 서비스 URL 확인
[ ] 헬스체크 통과
[ ] 프론트엔드 환경변수 업데이트
```

---

## 🔄 프론트엔드 업데이트

백엔드 서버 URL이 생성되면:

### 1. 환경변수 파일 생성

```bash
cd client
npm run create:env
```

새 백엔드 URL 입력 (예: `https://your-service.railway.app`)

### 2. 재빌드

```bash
npm run build
```

### 3. 재배포

`client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드

---

## 💡 빠른 팁

1. **Root Directory는 반드시 `server`로 설정하세요**
   - 이것이 가장 흔한 실패 원인입니다

2. **환경변수는 기존 프로젝트에서 복사하세요**
   - 기존 프로젝트가 있다면 Variables 탭에서 복사

3. **배포는 자동으로 시작됩니다**
   - 환경변수를 설정하면 자동 재배포

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [빌드 실패 해결](./BUILD_FAILED_FIX.md)
- [프로젝트 삭제 문제 해결](./URGENT_PROJECT_DELETION.md)
- [프론트엔드 환경변수 설정](./ENV_SETUP_GUIDE.md)

---

## 📞 다음 단계

1. GitHub 저장소 선택
2. 서비스 설정 확인
3. 환경변수 설정
4. 배포 완료 대기
5. 헬스체크 확인
6. 프론트엔드 업데이트

각 단계에서 문제가 발생하면 위의 문제 해결 섹션을 참고하세요.

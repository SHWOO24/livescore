# Network 요청 URL 확인 방법

## 🔍 현재 상황

Network 탭에서 확인:
- ✅ `me`, `sports`, `Soccer` 요청이 200 OK로 성공
- ⚠️ 하지만 실제 요청 URL(도메인)이 보이지 않음
- ⚠️ UI에 "경기 정보가 없습니다" 메시지 표시

---

## ✅ 요청 URL 확인 방법

### 방법 1: Network 탭에서 요청 클릭

1. **개발자 도구 → Network 탭**
2. **요청 이름 클릭** (예: `me`, `sports`, `Soccer`)
3. **Headers 탭 확인**:
   - **Request URL** 섹션에서 전체 URL 확인
   - 예: `https://acceptable-determination-production-a4db.up.railway.app/api/me`
   - 또는: `http://localhost:5000/api/me` (잘못된 경우)

### 방법 2: Network 탭에서 URL 컬럼 추가

1. **Network 탭 → 컬럼 헤더 우클릭**
2. **"URL" 또는 "Request URL" 체크**
3. 전체 URL이 표시됨

### 방법 3: 콘솔에서 확인

브라우저 콘솔에서:
```javascript
// API Base URL 확인
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
```

---

## ✅ 확인해야 할 사항

### 올바른 경우:
```
Request URL: https://acceptable-determination-production-a4db.up.railway.app/api/me
Request URL: https://acceptable-determination-production-a4db.up.railway.app/api/sports
Request URL: https://acceptable-determination-production-a4db.up.railway.app/api/livescore?sport=Soccer
```

### 잘못된 경우:
```
Request URL: http://localhost:5000/api/me
Request URL: /api/me  (상대 경로)
Request URL: https://scorelivenow.com/api/me  (프론트엔드 도메인)
```

---

## 🔍 문제 진단

### 시나리오 1: 요청이 Railway로 가고 있지만 데이터가 없음

**증상**:
- 요청 URL: `https://acceptable-determination-production-a4db.up.railway.app/api/...`
- 상태: 200 OK
- 응답: 빈 배열 또는 빈 데이터

**원인**:
- 백엔드가 정상 작동하지만 실제 경기 데이터가 없음
- 백엔드 폴링이 아직 시작되지 않음

**해결**:
- 백엔드 로그 확인
- 폴링 서비스가 시작되었는지 확인

### 시나리오 2: 요청이 localhost로 가고 있음

**증상**:
- 요청 URL: `http://localhost:5000/api/...`
- 상태: 실패 또는 CORS 오류

**원인**:
- 빌드된 파일에 환경변수가 포함되지 않음
- 재빌드 및 재배포 필요

**해결**:
```bash
cd client
npm run build
# client/dist/ 내용을 재배포
```

### 시나리오 3: 요청이 상대 경로로 가고 있음

**증상**:
- 요청 URL: `/api/me`
- 상태: 404 또는 실패

**원인**:
- 환경변수가 빌드에 포함되지 않음
- `apiBaseURL`이 빈 문자열

**해결**:
- `.env.production` 파일 확인
- 재빌드 및 재배포

---

## 📋 확인 체크리스트

```
[ ] Network 탭에서 요청 클릭
[ ] Headers 탭에서 Request URL 확인
[ ] 요청 URL이 Railway 도메인인지 확인
[ ] localhost:5000이 아닌지 확인
[ ] 상대 경로가 아닌지 확인
[ ] 콘솔에서 API Base URL 확인
```

---

## 💡 빠른 확인 방법

**브라우저 콘솔에서**:
```javascript
// 현재 설정된 API Base URL 확인
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
```

**예상 출력** (올바른 경우):
```
VITE_API_BASE_URL: https://acceptable-determination-production-a4db.up.railway.app
VITE_SOCKET_URL: https://acceptable-determination-production-a4db.up.railway.app
```

**잘못된 경우**:
```
VITE_API_BASE_URL: undefined
VITE_SOCKET_URL: undefined
```

---

## 🔧 문제 해결

### 요청이 localhost로 가는 경우:

1. **빌드 확인**:
   ```bash
   cd client
   npm run build
   ```

2. **빌드된 파일 확인**:
   ```bash
   cd dist
   grep -r "acceptable-determination-production-a4db.up.railway.app" .
   ```

3. **재배포**:
   - `client/dist/` 내용을 `public_html/`에 재업로드

### 요청이 Railway로 가지만 데이터가 없는 경우:

1. **백엔드 헬스체크**:
   ```bash
   curl https://acceptable-determination-production-a4db.up.railway.app/api/health
   ```

2. **백엔드 로그 확인**:
   - Railway 대시보드 → Logs 탭
   - 폴링 서비스가 시작되었는지 확인

---

**Network 탭에서 요청을 클릭하여 Request URL을 확인해주세요!**

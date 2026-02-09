# 백엔드 호출 문제 해결 가이드

## 🎯 문제 상황

프론트엔드가 백엔드 API를 호출하지 못하는 경우

---

## 🔍 1단계: 문제 확인

### 브라우저 개발자 도구 확인

1. 브라우저에서 `F12` 키 누르기
2. **Console** 탭 확인:
   ```
   [API] GET /api/livescore
   [API] Base URL: (없음)  ← 문제!
   ```

3. **Network** 탭 확인:
   - `/api/livescore` 요청이 있는지 확인
   - 요청 URL이 무엇인지 확인
   - 상태 코드 확인 (404, CORS 오류 등)

---

## ✅ 2단계: 백엔드 서버 URL 확인

백엔드가 배포된 URL을 확인하세요:

### Render
- Render 대시보드 → 서비스 선택
- 상단에 표시된 URL: `https://livescore-api.onrender.com`

### Railway
- Railway 대시보드 → 프로젝트 → 서비스
- Settings → Domains 또는 배포 URL 확인

### VPS
- 설정한 도메인 또는 IP: `https://api.scorelivenow.com`

---

## 🔧 3단계: 프론트엔드 환경변수 설정

### 1. 환경변수 파일 생성

```bash
cd client
cp .env.production.example .env.production
```

### 2. 백엔드 URL 입력

`.env.production` 파일을 열고 수정:

```env
# 실제 백엔드 URL로 변경
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

**예시 (Render)**:
```env
VITE_API_BASE_URL=https://livescore-api.onrender.com
VITE_SOCKET_URL=https://livescore-api.onrender.com
```

**예시 (Railway)**:
```env
VITE_API_BASE_URL=https://your-app.railway.app
VITE_SOCKET_URL=https://your-app.railway.app
```

### 3. 재빌드

```bash
cd client
npm run build
```

### 4. 재배포

`client/dist/` 폴더의 **모든 내용**을 Namecheap `public_html/`에 재업로드

---

## 🧪 4단계: 테스트

### 백엔드 Health Check

브라우저에서 직접 접속:
```
https://your-backend-url.com/api/health
```

**예상 응답**:
```json
{"status":"ok","message":"Server is running"}
```

### 프론트엔드 확인

1. 브라우저에서 `https://scorelivenow.com` 접속
2. `F12` → Console 탭 확인:
   ```
   [API] GET https://your-backend-url.com/api/livescore
   [API] Base URL: https://your-backend-url.com
   ```

3. Network 탭에서 `/api/livescore` 요청 확인
4. 응답이 정상인지 확인

---

## ⚠️ 주의사항

### 환경변수는 빌드 시점에 포함됨

- `.env.production` 파일을 수정한 후 **반드시 재빌드** 필요
- 빌드 후에는 환경변수를 변경해도 반영되지 않음
- 재빌드 후 재배포 필요

### 백엔드 CORS 설정 확인

백엔드 환경변수에 프론트엔드 도메인이 포함되어 있는지 확인:

```env
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
```

---

## 🐛 문제 해결

### 문제 1: Base URL이 (없음)으로 표시됨

**원인**: 환경변수가 설정되지 않음

**해결**:
1. `client/.env.production` 파일 생성
2. `VITE_API_BASE_URL` 설정
3. 재빌드

### 문제 2: Base URL이 localhost로 표시됨

**원인**: 프로덕션 빌드가 개발 환경변수로 빌드됨

**해결**:
1. `client/.env.production` 파일 확인
2. 올바른 백엔드 URL 설정
3. 재빌드

### 문제 3: 404 오류

**원인**: 백엔드 서버가 실행되지 않음 또는 URL이 잘못됨

**해결**:
1. 백엔드 Health Check 확인
2. 백엔드 URL이 올바른지 확인
3. 환경변수 재설정 후 재빌드

### 문제 4: CORS 오류

**원인**: 백엔드 CORS 설정에 프론트엔드 도메인이 없음

**해결**:
1. 백엔드 환경변수 `CORS_ORIGIN` 확인
2. 프론트엔드 도메인 추가
3. 백엔드 재시작

---

## 📝 빠른 체크리스트

```
[ ] 백엔드 서버 URL 확인
[ ] client/.env.production 파일 생성
[ ] VITE_API_BASE_URL에 백엔드 URL 입력
[ ] npm run build 실행
[ ] client/dist/ 내용을 public_html/에 재업로드
[ ] 브라우저에서 사이트 접속
[ ] F12 → Console에서 API 호출 확인
[ ] Network 탭에서 요청 성공 확인
```

---

## 💡 백엔드 URL이 없는 경우

백엔드가 아직 배포되지 않았다면:

1. **Render 배포** (가장 쉬움):
   - [백엔드 Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md) 참조

2. **Railway 배포**:
   - [백엔드 Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md) 참조

백엔드 배포 완료 후 위의 3단계부터 진행하세요.

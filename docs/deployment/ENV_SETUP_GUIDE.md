# 프론트엔드 환경변수 설정 가이드

## 🎯 문제

프론트엔드가 백엔드 API를 호출하지 못하는 경우, 대부분 환경변수가 설정되지 않아서 발생합니다.

---

## ✅ 해결 방법

### 방법 1: 자동 스크립트 사용 (권장)

```bash
cd client
npm run create:env
```

스크립트가 백엔드 서버 URL을 물어보면 입력하세요.

**예시**:
```
백엔드 서버 URL: https://livescore-api.onrender.com
```

### 방법 2: 수동으로 파일 생성

```bash
cd client
cp .env.production.example .env.production
```

`.env.production` 파일을 열고 백엔드 URL로 수정:

```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## 🔍 백엔드 서버 URL 찾는 방법

### Render 사용 시

1. Render 대시보드 접속: https://render.com
2. 서비스 선택 (예: `livescore-api`)
3. 상단에 표시된 URL 복사
   - 예: `https://livescore-api.onrender.com`

### Railway 사용 시

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 → 서비스 선택
3. Settings → Domains에서 URL 확인
   - 또는 Deployments → 최신 배포의 URL 확인

### VPS 사용 시

설정한 도메인 또는 IP 주소:
- 예: `https://api.scorelivenow.com`

---

## 📝 환경변수 설정 후 재빌드

환경변수를 설정한 후 **반드시 재빌드**해야 합니다:

```bash
cd client
npm run build
```

**중요**: Vite는 빌드 시점에 환경변수를 번들에 포함시키므로, 빌드 후에는 환경변수를 변경해도 반영되지 않습니다.

---

## 🚀 재배포

빌드가 완료되면 `client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드하세요.

---

## ✅ 확인 방법

브라우저에서 `F12` → Console 탭 확인:

**성공 시**:
```
[API] GET https://your-backend-url.com/api/livescore
[API] Base URL: https://your-backend-url.com
```

**실패 시**:
```
❌ [API] VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.
```

이 경우 위의 단계를 다시 진행하세요.

---

## 📋 체크리스트

```
[ ] 백엔드 서버 URL 확인
[ ] client/.env.production 파일 생성
[ ] VITE_API_BASE_URL에 백엔드 URL 입력
[ ] npm run build 실행
[ ] client/dist/ 내용을 public_html/에 재업로드
[ ] 브라우저에서 사이트 접속
[ ] F12 → Console에서 API 호출 확인
```

---

## 🔗 관련 문서

- [백엔드 호출 문제 해결](./BACKEND_CALL_FIX.md)
- [단계별 해결 가이드](./STEP_BY_STEP_FIX.md)
- [백엔드 Render 배포](./BACKEND_DEPLOY_RENDER.md)

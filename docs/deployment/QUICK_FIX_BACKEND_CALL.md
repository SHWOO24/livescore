# 백엔드 호출 문제 빠른 해결 가이드

## 🔍 문제 진단

### 1. 브라우저 개발자 도구 확인

브라우저에서 `F12` → Console 탭에서 확인:

**확인할 메시지**:
```
[API] GET /api/livescore
[API] Base URL: (없음) 또는 http://localhost:5000
```

**문제가 있는 경우**:
- `Base URL: (없음)` → 환경변수가 설정되지 않음
- `Base URL: http://localhost:5000` → 프로덕션에서 localhost 사용 중
- `404 오류` → 백엔드 서버를 찾을 수 없음

### 2. Network 탭 확인

브라우저 개발자 도구 → Network 탭:
- `/api/livescore` 요청 확인
- 요청 URL 확인
- 응답 상태 코드 확인

---

## 🚀 해결 방법

### 방법 1: 환경변수 설정 후 재빌드 (권장)

#### 1단계: 백엔드 서버 URL 확인

백엔드가 배포된 URL을 확인하세요:
- Render: `https://your-app.onrender.com`
- Railway: `https://your-app.railway.app`
- VPS: `https://api.scorelivenow.com`

#### 2단계: 환경변수 파일 생성

```bash
cd client
cp .env.production.example .env.production
```

#### 3단계: 환경변수 설정

`.env.production` 파일을 열고 백엔드 URL로 수정:

```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

**예시**:
```env
VITE_API_BASE_URL=https://livescore-api.onrender.com
VITE_SOCKET_URL=https://livescore-api.onrender.com
```

#### 4단계: 재빌드

```bash
cd client
npm run build
```

#### 5단계: 재배포

`client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드

---

### 방법 2: 임시 해결 (빠른 테스트용)

프로덕션에서도 상대 경로로 API 호출하도록 수정:

**주의**: 이 방법은 백엔드가 같은 도메인에 있어야 합니다.

```bash
# client/src/utils/api.ts 수정
# 프로덕션에서도 상대 경로 사용하도록 변경
```

---

## 🔧 백엔드 서버 확인

### Health Check

브라우저에서 직접 접속:
```
https://your-backend-url.com/api/health
```

**예상 응답**:
```json
{"status":"ok","message":"Server is running"}
```

### 라이브스코어 API 테스트

```
https://your-backend-url.com/api/livescore?sport=Soccer
```

---

## 📋 체크리스트

### 프론트엔드

- [ ] `client/.env.production` 파일 존재 확인
- [ ] `VITE_API_BASE_URL`에 올바른 백엔드 URL 설정
- [ ] `npm run build` 실행 완료
- [ ] `client/dist/` 폴더에 최신 빌드 파일 확인
- [ ] Namecheap에 최신 파일 업로드 확인

### 백엔드

- [ ] 백엔드 서버 실행 중 확인
- [ ] `/api/health` 엔드포인트 정상 응답 확인
- [ ] `/api/livescore?sport=Soccer` 엔드포인트 정상 응답 확인
- [ ] CORS 설정에 프론트엔드 도메인 포함 확인

---

## 🐛 디버깅

### 브라우저 콘솔에서 확인

```javascript
// API Base URL 확인
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// 실제 요청 URL 확인
// Network 탭에서 확인
```

### 백엔드 로그 확인

Render/Railway 대시보드 → Logs 탭에서 확인:
- 서버가 실행 중인지
- API 요청이 들어오는지
- 에러가 발생하는지

---

## ⚡ 빠른 해결 명령어

```bash
# 1. 환경변수 파일 생성
cd client
cp .env.production.example .env.production

# 2. .env.production 파일 편집 (백엔드 URL 입력)
# VITE_API_BASE_URL=https://your-backend-url.com

# 3. 재빌드
npm run build

# 4. 배포
# client/dist/ 내용을 public_html/에 업로드
```

---

## 💡 백엔드 URL 찾는 방법

### Render

1. Render 대시보드 접속
2. 서비스 선택
3. 상단에 표시된 URL 복사
4. 예: `https://livescore-api.onrender.com`

### Railway

1. Railway 대시보드 접속
2. 프로젝트 → 서비스 선택
3. Settings → Domains에서 URL 확인
4. 또는 Deployments → 최신 배포의 URL 확인

---

## 🔗 관련 문서

- [백엔드 Render 배포](./BACKEND_DEPLOY_RENDER.md)
- [프론트엔드 Namecheap 배포](./FRONTEND_DEPLOY_NAMECHEAP.md)
- [문제 해결 가이드](./TROUBLESHOOT.md)

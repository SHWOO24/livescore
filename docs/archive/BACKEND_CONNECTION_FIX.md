# 백엔드 서버 연결 문제 해결 가이드

## 🔧 문제 해결 완료

### 업데이트된 내용

1. **API 호출 로직 개선**
   - 프로덕션 환경에서 현재 도메인 기반 자동 감지
   - 환경변수가 없어도 현재 도메인에서 API 호출 시도
   - 타임아웃 15초로 증가 (프로덕션 네트워크 지연 고려)

2. **재시도 로직 강화**
   - 최대 3회 재시도 (기존 2회에서 증가)
   - 지수 백오프 적용 (1초, 2초, 3초)
   - 404 오류는 재시도하지 않음 (백엔드 서버가 없는 경우)

3. **에러 처리 개선**
   - 반복 에러 메시지 방지 (30초 동안 한 번만 표시)
   - 더 명확한 에러 메시지
   - 네트워크 오류 감지 개선

---

## ⚠️ 중요: 백엔드 서버 배포 필요

현재 프론트엔드는 업데이트되었지만, **백엔드 서버가 별도로 배포되어 있어야 합니다.**

### 백엔드 서버 배포 방법

백엔드 서버를 다음 중 하나의 플랫폼에 배포하세요:

1. **Railway** (추천) - https://railway.app
   - 무료 티어 제공
   - 자동 배포
   - [BACKEND_DEPLOY_RAILWAY.md](./BACKEND_DEPLOY_RAILWAY.md) 참고

2. **Render** - https://render.com
   - 무료 티어 제공
   - [BACKEND_DEPLOY_RENDER.md](./BACKEND_DEPLOY_RENDER.md) 참고

3. **Fly.io** - https://fly.io
   - 무료 티어 제공
   - [BACKEND_DEPLOY_FLY.md](./BACKEND_DEPLOY_FLY.md) 참고

---

## 📋 백엔드 서버 배포 후 설정

### 1. 백엔드 서버 배포 완료 후

백엔드 서버가 배포되면 다음 URL로 헬스체크:
```
https://your-backend-server-url.com/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. 프론트엔드 환경변수 설정

백엔드 서버 URL을 확인한 후:

1. `client/.env.production` 파일 생성:
```env
VITE_API_BASE_URL=https://your-backend-server-url.com
VITE_SOCKET_URL=https://your-backend-server-url.com
```

2. 재빌드:
```bash
cd client
npm run deploy:prepare
```

3. 재업로드:
   - `deploy/static/` 내용을 `public_html/`에 업로드

---

## 🔍 현재 상태 확인

### 백엔드 서버가 없는 경우

현재 프론트엔드는 다음과 같이 동작합니다:

1. **자동 재시도**: 네트워크 오류 시 최대 3회 재시도
2. **에러 메시지**: 30초 동안 한 번만 표시 (반복 방지)
3. **폴링**: Socket.io 연결 실패 시 5초마다 자동 업데이트 시도

### 백엔드 서버가 배포된 경우

1. 환경변수 설정 (`VITE_API_BASE_URL`)
2. 재빌드 및 재업로드
3. 정상 작동 확인

---

## ✅ 해결된 문제

- ✅ API 호출 로직 개선 (프로덕션 환경 자동 감지)
- ✅ 재시도 로직 강화 (최대 3회)
- ✅ 타임아웃 증가 (15초)
- ✅ 에러 처리 개선 (반복 메시지 방지)
- ✅ 네트워크 오류 감지 개선

---

## 🚀 다음 단계

1. **백엔드 서버 배포** (Railway, Render, Fly.io 중 선택)
2. **환경변수 설정** (`client/.env.production`)
3. **재빌드 및 재업로드**
4. **정상 작동 확인**

백엔드 서버를 배포하지 않으면 API 호출이 실패합니다. 반드시 백엔드 서버를 배포하세요!

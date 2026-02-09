# 배포 요약

## ✅ 완료된 작업

### A. 백엔드 서버 점검/수정

- ✅ `/api/health` 엔드포인트 확인 (이미 구현됨)
- ✅ CORS 설정 개선:
  - 운영 환경: `https://scorelivenow.com`, `https://www.scorelivenow.com`
  - 개발 환경: `http://localhost:3000`
  - `credentials: true` 설정
- ✅ Socket.io 설정 개선:
  - CORS origin 동일 적용
  - path 기본값 `/socket.io` 유지
- ✅ 환경변수 정리:
  - `PORT`, `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL` 등
  - `.env.production.example` 생성

### B. 배포 문서 생성

- ✅ `BACKEND_DEPLOY_RENDER.md`: Render 배포 가이드
- ✅ `BACKEND_DEPLOY_RAILWAY.md`: Railway 배포 가이드
- ✅ `BACKEND_DEPLOY_FLY.md`: Fly.io 배포 가이드

### C. 프론트엔드 연결 수정

- ✅ API/Socket URL이 이미 환경변수 사용 중 (`import.meta.env.VITE_API_BASE_URL`)
- ✅ `.env.production.example` 생성
- ✅ 배포 스크립트 확인 (`deploy/static/` 생성)

### D. 최종 산출물

- ✅ `DEPLOYMENT.md` 업데이트
- ✅ `DEPLOYMENT_CHECKLIST.md` 생성 (업로드 체크리스트)

---

## 🚀 다음 단계

### 1. 백엔드 서버 배포

다음 중 하나를 선택하여 배포:

- **Render**: [BACKEND_DEPLOY_RENDER.md](./BACKEND_DEPLOY_RENDER.md)
- **Railway**: [BACKEND_DEPLOY_RAILWAY.md](./BACKEND_DEPLOY_RAILWAY.md)
- **Fly.io**: [BACKEND_DEPLOY_FLY.md](./BACKEND_DEPLOY_FLY.md)
- **VPS**: [DEPLOY_BACKEND.md](./DEPLOY_BACKEND.md)

### 2. 백엔드 Health Check

배포 후 다음 URL로 테스트:

```
https://<BACKEND_HOST>/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 3. 프론트엔드 환경변수 설정

백엔드 배포 후:

1. `client/.env.production` 파일 생성:
   ```env
   VITE_API_BASE_URL=https://<BACKEND_HOST>
   VITE_SOCKET_URL=https://<BACKEND_HOST>
   ```

2. 재빌드:
   ```bash
   cd client
   npm run build
   npm run deploy:prepare
   ```

3. 재업로드:
   - `deploy/static/` 내용을 `public_html/`에 업로드

---

## 📋 업로드 체크리스트

### 프론트엔드 (Namecheap)

**업로드 대상** (`deploy/static/` 내용만):
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ `assets/` 폴더
- ✅ `robots.txt`, `sitemap.xml` (있다면)

**업로드 금지**:
- ❌ `node_modules/`
- ❌ `src/`
- ❌ `package.json`
- ❌ `server/`

### 백엔드 (Render/Railway/Fly.io)

**GitHub 푸시 시 자동 배포**:
- ✅ `server/src/` (소스 코드)
- ✅ `server/package.json`
- ✅ 기타 설정 파일

**업로드 금지** (`.gitignore`에 의해 자동 제외):
- ❌ `node_modules/` (배포 플랫폼에서 설치)
- ❌ `dist/` (배포 플랫폼에서 빌드)
- ❌ `.env` (배포 플랫폼 환경변수로 설정)

---

## 🔗 관련 문서

- [DEPLOYMENT.md](./DEPLOYMENT.md): 전체 배포 가이드
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md): 업로드 체크리스트
- [BACKEND_DEPLOY_RENDER.md](./BACKEND_DEPLOY_RENDER.md): Render 배포
- [BACKEND_DEPLOY_RAILWAY.md](./BACKEND_DEPLOY_RAILWAY.md): Railway 배포
- [BACKEND_DEPLOY_FLY.md](./BACKEND_DEPLOY_FLY.md): Fly.io 배포

---

## ✅ 완료!

이제 백엔드를 선택한 플랫폼에 배포하고, 프론트엔드 환경변수를 설정한 후 재빌드하면 됩니다!

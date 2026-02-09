# 프로덕션 배포 설정 완료 요약

## ✅ 완료된 작업

### 1. 환경변수 파일 생성
- **`client/.env.production`** 파일 생성
- Railway 백엔드 URL 설정:
  ```
  VITE_API_BASE_URL=https://acceptable-determination-production-a4db.up.railway.app
  VITE_SOCKET_URL=https://acceptable-determination-production-a4db.up.railway.app
  ```

### 2. API 클라이언트 수정 (`client/src/utils/api.ts`)
- ✅ `localhost:5000` 하드코딩 제거
- ✅ 개발 환경 fallback 제거
- ✅ 환경변수(`VITE_API_BASE_URL`)만 사용하도록 변경
- ✅ 프로덕션에서 환경변수 없으면 에러 표시

### 3. Socket.io 연결 수정 (`client/src/contexts/SocketContext.tsx`)
- ✅ `localhost` 체크 로직 제거
- ✅ 환경변수(`VITE_SOCKET_URL` 또는 `VITE_API_BASE_URL`)만 사용
- ✅ 자동 재연결 활성화

### 4. AuthContext 수정 (`client/src/contexts/AuthContext.tsx`)
- ✅ `axios` 직접 사용 → `api` 인스턴스 사용으로 변경
- ✅ 모든 API 호출이 환경변수 기반으로 동작

### 5. Vite 설정 수정 (`client/vite.config.ts`)
- ✅ 개발 환경 proxy는 유지 (로컬 개발용)
- ✅ 프로덕션 빌드에서는 환경변수 사용

---

## 🔍 변경 사항 상세

### 제거된 하드코딩:
- ❌ `http://localhost:5000`
- ❌ `localhost:5000`
- ❌ 개발 환경 fallback URL

### 추가된 환경변수 기반 로직:
- ✅ `VITE_API_BASE_URL` 필수 사용
- ✅ `VITE_SOCKET_URL` 필수 사용 (없으면 `VITE_API_BASE_URL` 사용)

---

## 📋 빌드 및 배포

### 빌드:
```bash
cd client
npm run build
```

빌드 시 `.env.production` 파일의 환경변수가 번들에 포함됩니다.

### 배포:
`client/dist/` 폴더의 내용을 Namecheap `public_html/`에 업로드

---

## ✅ 검증 방법

### 브라우저에서 확인:
1. `https://scorelivenow.com` 접속
2. 개발자 도구 → Network 탭
3. Fetch/XHR 요청 확인:
   - 모든 요청이 `acceptable-determination-production-a4db.up.railway.app`로 향하는지 확인
   - `localhost:5000` 요청이 없는지 확인

### 콘솔 확인:
- `[API] GET https://acceptable-determination-production-a4db.up.railway.app/api/...`
- `✅ Socket 연결됨` (Socket.io 연결 성공 시)

---

## 🔑 핵심 변경사항

### 이전:
- ❌ `localhost:5000` 하드코딩
- ❌ 개발 환경 fallback
- ❌ axios 직접 사용

### 현재:
- ✅ 환경변수만 사용
- ✅ 프로덕션 백엔드 URL로 통일
- ✅ api 인스턴스 사용으로 일관성 유지

---

## 📝 주의사항

1. **환경변수는 빌드 시점에 포함됨**:
   - `.env.production` 파일 수정 후 반드시 재빌드 필요
   - 빌드 후에는 환경변수 변경이 반영되지 않음

2. **개발 환경**:
   - 로컬 개발 시 `.env.development` 파일 생성 가능 (선택사항)
   - 또는 Vite proxy 사용 (기본값)

3. **프로덕션 빌드**:
   - 반드시 `.env.production` 파일이 있어야 함
   - 빌드 전에 Railway URL 확인

---

## 🚀 다음 단계

1. **빌드 실행**:
   ```bash
   cd client
   npm run build
   ```

2. **빌드 확인**:
   - `client/dist/` 폴더 생성 확인
   - 빌드 에러 없음 확인

3. **배포**:
   - `client/dist/` 내용을 Namecheap에 업로드

4. **검증**:
   - 브라우저에서 Network 탭 확인
   - 모든 요청이 Railway 백엔드로 향하는지 확인

---

## ✅ 완료 체크리스트

- [x] `.env.production` 파일 생성
- [x] `localhost:5000` 하드코딩 제거
- [x] API 클라이언트 환경변수 기반으로 수정
- [x] Socket.io 연결 환경변수 기반으로 수정
- [x] AuthContext api 인스턴스 사용으로 변경
- [x] 개발 환경 fallback 제거
- [x] 빌드 확인 필요

**프론트엔드가 Railway 프로덕션 백엔드를 사용하도록 설정 완료!** 🎉

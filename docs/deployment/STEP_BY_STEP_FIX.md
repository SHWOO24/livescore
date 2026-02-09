# 백엔드 호출 문제 단계별 해결 가이드

## 현재 상황

- ✅ Git 외장하드에 실행파일 있음
- ✅ 서버까지 입력 다 마침
- ❌ 프론트엔드가 백엔드 호출 실패

---

## 🔍 1단계: 백엔드 서버 URL 확인

### Render 사용 시

1. Render 대시보드 접속: https://render.com
2. 서비스 선택 (예: `livescore-api`)
3. 상단에 표시된 URL 복사
   - 예: `https://livescore-api.onrender.com`

### Railway 사용 시

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 → 서비스 선택
3. Settings → Domains에서 URL 확인
   - 예: `https://your-app.railway.app`

### VPS 사용 시

설정한 도메인 또는 IP 주소:
- 예: `https://api.scorelivenow.com`

---

## 📝 2단계: 프론트엔드 환경변수 설정

### 2-1. 환경변수 파일 생성

**로컬에서 실행**:

```bash
cd client
cp .env.production.example .env.production
```

또는 수동으로:
1. `client/.env.production.example` 파일 복사
2. 이름을 `.env.production`으로 변경

### 2-2. 백엔드 URL 입력

`.env.production` 파일을 열고 수정:

```env
# 백엔드 API 서버 URL (실제 URL로 변경!)
VITE_API_BASE_URL=https://your-backend-url.com

# Socket.io 서버 URL (대부분 동일)
VITE_SOCKET_URL=https://your-backend-url.com
```

**실제 예시**:
```env
VITE_API_BASE_URL=https://livescore-api.onrender.com
VITE_SOCKET_URL=https://livescore-api.onrender.com
```

---

## 🔨 3단계: 프론트엔드 재빌드

```bash
cd client
npm run build
```

빌드가 성공하면 `client/dist/` 폴더에 새 파일이 생성됩니다.

---

## 📤 4단계: Namecheap에 재배포

### 방법 1: cPanel File Manager

1. Namecheap cPanel 접속
2. File Manager 클릭
3. `public_html/` 디렉토리로 이동
4. 기존 파일 삭제 (선택사항)
5. 로컬의 `client/dist/` 폴더 **내용**을 업로드
   - `dist` 폴더 자체가 아닌, 안의 내용만!

### 방법 2: FTP/SFTP

1. FTP 클라이언트 실행
2. Namecheap FTP 정보로 접속
3. `public_html/` 디렉토리로 이동
4. 로컬의 `client/dist/` 폴더 내용 업로드

---

## ✅ 5단계: 확인

### 백엔드 확인

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
2. `F12` 키 누르기
3. **Console** 탭 확인:
   ```
   [API] GET https://your-backend-url.com/api/livescore
   [API] Base URL: https://your-backend-url.com
   ```
   ✅ 이렇게 표시되면 성공!

4. **Network** 탭 확인:
   - `/api/livescore` 요청이 있는지 확인
   - 상태 코드가 200인지 확인
   - 응답 데이터가 있는지 확인

---

## 🐛 문제가 계속되면

### 브라우저 콘솔 확인

다음 메시지가 보이면:

```
❌ [API] VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.
```

**해결**:
1. `client/.env.production` 파일이 있는지 확인
2. 파일 내용에 `VITE_API_BASE_URL`이 있는지 확인
3. 재빌드 확인 (`npm run build`)
4. 재배포 확인

### Network 탭에서 404 오류

**원인**: 백엔드 서버가 실행되지 않음

**해결**:
1. 백엔드 Health Check 확인
2. 백엔드 서버가 실행 중인지 확인
3. 백엔드 URL이 올바른지 확인

### CORS 오류

**원인**: 백엔드 CORS 설정 문제

**해결**:
1. 백엔드 환경변수 `CORS_ORIGIN` 확인
2. 프론트엔드 도메인 포함 확인:
   ```env
   CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
   ```
3. 백엔드 재시작

---

## 📋 최종 체크리스트

```
[ ] 백엔드 서버 URL 확인 완료
[ ] client/.env.production 파일 생성 완료
[ ] VITE_API_BASE_URL에 올바른 백엔드 URL 입력 완료
[ ] npm run build 실행 완료
[ ] client/dist/ 폴더에 새 파일 생성 확인
[ ] Namecheap public_html/에 파일 업로드 완료
[ ] 브라우저에서 사이트 접속
[ ] F12 → Console에서 API 호출 확인
[ ] Network 탭에서 요청 성공 확인
[ ] 데이터가 화면에 표시되는지 확인
```

---

## 💡 빠른 명령어

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

## 🔗 관련 문서

- [백엔드 호출 빠른 해결](./QUICK_FIX_BACKEND_CALL.md)
- [백엔드 Render 배포](./BACKEND_DEPLOY_RENDER.md)
- [프론트엔드 Namecheap 배포](./FRONTEND_DEPLOY_NAMECHEAP.md)

# 빌드 검증 및 배포 확인 가이드

## 🚨 현재 상황

브라우저 Network 탭에서 확인:
- ❌ 대부분의 API 요청 실패 (`chat`, `matches`, `socket.io`)
- ✅ `me` 요청만 성공 (200 OK)

**원인**: 빌드된 파일에 환경변수가 포함되지 않았거나, 재배포가 필요합니다.

---

## ✅ 즉시 확인 사항

### 1. 빌드 실행 확인

```bash
cd client
npm run build
```

**빌드 성공 확인**:
- `client/dist/` 폴더 생성 확인
- 빌드 에러 없음 확인

### 2. 환경변수 포함 확인

빌드된 파일에서 환경변수 확인:

```bash
# 빌드된 JavaScript 파일에서 Railway URL 검색
cd client/dist
grep -r "acceptable-determination-production-a4db.up.railway.app" .
```

또는 브라우저에서:
1. 개발자 도구 → Sources 탭
2. 빌드된 JavaScript 파일 열기
3. `acceptable-determination-production-a4db.up.railway.app` 검색
4. 환경변수가 포함되어 있는지 확인

### 3. 재배포 확인

빌드 후:
- `client/dist/` 폴더의 **모든 내용**을 Namecheap `public_html/`에 재업로드
- 기존 파일 삭제 후 새 파일 업로드 권장

---

## 🔍 문제 진단

### 문제 1: 빌드가 실행되지 않음

**증상**: 
- `client/dist/` 폴더가 없음
- 또는 오래된 빌드 파일

**해결**:
```bash
cd client
npm run build
```

### 문제 2: 환경변수가 빌드에 포함되지 않음

**증상**:
- 빌드된 파일에서 Railway URL을 찾을 수 없음
- `localhost:5000`이 여전히 포함됨

**해결**:
1. `.env.production` 파일 확인:
   ```bash
   cat client/.env.production
   ```

2. 파일 내용 확인:
   ```
   VITE_API_BASE_URL=https://acceptable-determination-production-a4db.up.railway.app
   VITE_SOCKET_URL=https://acceptable-determination-production-a4db.up.railway.app
   ```

3. 재빌드:
   ```bash
   cd client
   npm run build
   ```

### 문제 3: 재배포가 안 됨

**증상**:
- 빌드는 성공했지만 브라우저에서 여전히 실패

**해결**:
1. Namecheap `public_html/` 폴더 확인
2. 기존 파일 삭제
3. `client/dist/` 내용 재업로드
4. 브라우저 캐시 삭제 (Ctrl+Shift+R)

---

## 📋 단계별 해결 방법

### Step 1: 환경변수 파일 확인

```bash
cd client
cat .env.production
```

**확인 사항**:
- Railway URL이 올바르게 설정되어 있는지
- `https://`로 시작하는지
- URL 끝에 `/`가 없는지

### Step 2: 빌드 실행

```bash
npm run build
```

**확인 사항**:
- 빌드 성공 메시지
- `client/dist/` 폴더 생성
- 빌드 에러 없음

### Step 3: 빌드된 파일 확인

```bash
cd dist
# JavaScript 파일에서 Railway URL 검색
grep -r "acceptable-determination-production-a4db.up.railway.app" .
```

**확인 사항**:
- Railway URL이 빌드된 파일에 포함되어 있는지
- `localhost:5000`이 없는지

### Step 4: 재배포

1. **기존 파일 삭제** (선택사항):
   - Namecheap `public_html/` 폴더의 기존 파일 삭제

2. **새 파일 업로드**:
   - `client/dist/` 폴더의 **모든 내용** 업로드
   - `dist` 폴더 자체가 아닌, 안의 내용만!

3. **브라우저 캐시 삭제**:
   - Ctrl+Shift+R (강력 새로고침)
   - 또는 개발자 도구 → Network 탭 → "Disable cache" 체크

### Step 5: 검증

1. **브라우저에서 사이트 접속**
2. **개발자 도구 → Network 탭**:
   - Fetch/XHR 필터 적용
   - 요청 URL 확인
   - 모든 요청이 `acceptable-determination-production-a4db.up.railway.app`로 향하는지 확인

3. **콘솔 확인**:
   ```
   [API] GET https://acceptable-determination-production-a4db.up.railway.app/api/...
   [API] Base URL: https://acceptable-determination-production-a4db.up.railway.app
   ```

---

## 🐛 일반적인 문제

### 문제 1: 빌드 에러

**해결**:
```bash
cd client
npm install  # 의존성 재설치
npm run build
```

### 문제 2: 환경변수 파일 위치 오류

**확인**:
- `.env.production` 파일이 `client/` 디렉토리에 있는지 확인
- 루트 디렉토리가 아닌 `client/` 디렉토리!

### 문제 3: 브라우저 캐시

**해결**:
- Ctrl+Shift+R (강력 새로고침)
- 또는 개발자 도구 → Application → Clear storage

---

## ✅ 최종 확인 체크리스트

```
[ ] client/.env.production 파일 존재 확인
[ ] Railway URL이 올바르게 설정되어 있음
[ ] npm run build 실행 완료
[ ] client/dist/ 폴더 생성 확인
[ ] 빌드된 파일에 Railway URL 포함 확인
[ ] client/dist/ 내용을 public_html/에 재업로드 완료
[ ] 브라우저 캐시 삭제
[ ] 브라우저에서 사이트 접속
[ ] Network 탭에서 Railway URL 확인
[ ] 모든 요청이 Railway 백엔드로 향하는지 확인
```

---

## 💡 빠른 해결 방법

```bash
# 1. 환경변수 확인
cd client
cat .env.production

# 2. 빌드 실행
npm run build

# 3. 빌드 확인
cd dist
ls -la

# 4. 재배포
# client/dist/ 내용을 public_html/에 업로드

# 5. 브라우저에서 확인
# Ctrl+Shift+R로 강력 새로고침
```

---

## 🔗 관련 문서

- [프로덕션 백엔드 마이그레이션](./PRODUCTION_BACKEND_MIGRATION.md)
- [프로덕션 배포 요약](./PRODUCTION_DEPLOYMENT_SUMMARY.md)

---

**빌드 후 재배포하면 Network 탭에서 모든 요청이 Railway 백엔드로 향하는 것을 확인할 수 있습니다!**

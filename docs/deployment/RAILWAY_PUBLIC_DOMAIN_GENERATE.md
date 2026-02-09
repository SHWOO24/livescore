# Railway Public Domain 생성 가이드

## 🎯 현재 상황

Railway Networking 설정 화면에서 확인:
- ✅ **Private Networking**: `livescore.railway.internal` (내부 도메인)
- ⚠️ **Public Networking**: 아직 생성되지 않음

---

## ✅ Public Domain 생성 방법

### Step 1: Generate Domain 버튼 클릭

Networking 섹션에서:

1. **"Public Networking"** 섹션 찾기
2. **"⚡ Generate Domain"** 버튼 클릭
3. Public Domain이 자동으로 생성됩니다

---

### Step 2: 생성된 도메인 확인

Public Domain 생성 후:

1. **"Public Networking"** 섹션에 도메인이 표시됩니다
2. 예상 형식:
   - `https://livescore-production.up.railway.app`
   - 또는 `https://your-service.railway.app`
3. 도메인 URL 복사

---

## 📋 생성된 도메인 확인 방법

### 방법 1: Networking 섹션에서 확인

1. Settings → Networking 섹션
2. "Public Networking" 섹션에서 도메인 확인
3. 도메인 URL 복사

### 방법 2: 프로젝트 대시보드에서 확인

1. 프로젝트 대시보드 → 서비스 선택
2. 상단에 표시된 도메인 확인
3. 또는 서비스 카드에 도메인 표시

---

## 🔧 프론트엔드 환경변수 설정

Public Domain을 생성한 후:

### 1. 백엔드 서버 URL 확인

생성된 Public Domain 예시:
```
https://livescore-production.up.railway.app
```

### 2. 프론트엔드 환경변수 파일 생성

```bash
cd client
npm run create:env
```

백엔드 URL 입력:
```
백엔드 서버 URL: https://livescore-production.up.railway.app
```

### 3. 또는 수동으로 `.env.production` 파일 생성

```bash
cd client
cp .env.production.example .env.production
```

`.env.production` 파일 편집:
```env
VITE_API_BASE_URL=https://livescore-production.up.railway.app
VITE_SOCKET_URL=https://livescore-production.up.railway.app
```

### 4. 재빌드 및 재배포

```bash
npm run build
```

`client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드

---

## 🧪 도메인 테스트

Public Domain을 생성한 후:

### 헬스체크:

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

### 브라우저에서 확인:

```
https://your-service.railway.app/api/health
```

브라우저에서 JSON 응답이 보이면 성공!

---

## ⚠️ 중요 사항

### Private Domain vs Public Domain

1. **`livescore.railway.internal`** (Private):
   - Railway 내부에서만 접근 가능
   - 외부 접근 불가능
   - 프론트엔드에서 사용 불가

2. **Public Domain** (생성 필요):
   - 외부에서 접근 가능
   - `https://your-service.railway.app` 형식
   - 프론트엔드 환경변수에 사용 가능

---

## 📋 체크리스트

```
[ ] Railway 대시보드 접속
[ ] 프로젝트 선택
[ ] 서비스 선택 (livescore)
[ ] Settings → Networking 섹션
[ ] "⚡ Generate Domain" 버튼 클릭
[ ] Public Domain 생성 확인
[ ] Public Domain URL 복사
[ ] 프론트엔드 환경변수에 Public Domain 설정
[ ] 프론트엔드 재빌드
[ ] 프론트엔드 재배포
[ ] 헬스체크 통과 확인
```

---

## 💡 빠른 팁

1. **Generate Domain 클릭만 하면 됩니다**:
   - 자동으로 Public Domain이 생성됩니다
   - 도메인 형식은 Railway가 자동으로 결정합니다

2. **도메인은 언제든지 변경 가능**:
   - Public Domain을 삭제하고 재생성 가능
   - 변경 시 프론트엔드 환경변수도 업데이트 필요

3. **Custom Domain도 사용 가능**:
   - 자신의 도메인을 연결하려면 "Custom Domain" 버튼 사용
   - 도메인 소유권 확인 필요

---

## 🐛 문제 해결

### Generate Domain 버튼이 작동하지 않으면:

1. **서비스 상태 확인**:
   - 서비스가 배포되어 실행 중인지 확인
   - 배포가 완료되어야 도메인 생성 가능

2. **권한 확인**:
   - 프로젝트 소유자 또는 관리자 권한 확인

3. **브라우저 새로고침**:
   - F5 또는 Ctrl+R로 페이지 새로고침

---

## 🔗 관련 문서

- [Railway 도메인 설정](./RAILWAY_DOMAIN_SETUP.md)
- [프론트엔드 환경변수 설정](./ENV_SETUP_GUIDE.md)
- [백엔드 호출 문제 해결](./BACKEND_CALL_FIX.md)

---

## 📞 다음 단계

1. **"⚡ Generate Domain" 버튼 클릭**
2. **생성된 Public Domain URL 복사**
3. **프론트엔드 환경변수 업데이트**
4. **프론트엔드 재빌드 및 재배포**
5. **헬스체크 및 API 호출 테스트**

Public Domain을 생성하면 프론트엔드에서 백엔드 API를 호출할 수 있습니다!

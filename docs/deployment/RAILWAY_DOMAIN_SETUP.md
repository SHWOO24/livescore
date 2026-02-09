# Railway 도메인 설정 가이드

## 🔍 현재 도메인 확인

현재 확인된 도메인:
- `livescore.railway.internal` - **내부 도메인** (외부 접근 불가)

---

## ⚠️ 중요 사항

### 내부 도메인 vs Public Domain

1. **`livescore.railway.internal`**:
   - Railway 내부에서만 접근 가능
   - 외부에서 접근 불가능
   - 프론트엔드에서 사용할 수 없음

2. **Public Domain**:
   - 외부에서 접근 가능
   - `https://your-service.railway.app` 형식
   - 프론트엔드 환경변수에 사용 가능

---

## ✅ Public Domain 생성 방법

### Step 1: Networking 섹션으로 이동

Railway 대시보드에서:

1. **프로젝트 선택** → **서비스 선택** (`livescore`)
2. **Settings** 탭 클릭
3. **Networking** 섹션 찾기
   - 또는 오른쪽 사이드바에서 "Networking" 클릭

---

### Step 2: Public Domain 생성

Networking 섹션에서:

1. **"Public Networking"** 섹션 찾기
2. **"⚡ Generate Domain"** 버튼 클릭
3. 생성된 도메인 확인:
   - 예: `https://livescore-production.up.railway.app`
   - 또는: `https://your-service.railway.app`

---

## 📋 도메인 확인 방법

### Settings 화면에서:

1. **Settings** → **Networking** 섹션
2. **"Public domain"** 필드 확인
3. 생성된 도메인 복사

### 또는:

1. **프로젝트 대시보드** → **서비스 선택**
2. 상단에 표시된 도메인 확인

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

## 🔍 도메인 확인 체크리스트

```
[ ] Railway 대시보드 접속
[ ] 프로젝트 선택
[ ] 서비스 선택 (livescore)
[ ] Settings → Networking 섹션 확인
[ ] Public Domain 생성됨 확인
[ ] Public Domain URL 복사
[ ] 프론트엔드 환경변수에 Public Domain 설정
[ ] 프론트엔드 재빌드
[ ] 프론트엔드 재배포
[ ] 헬스체크 통과 확인
```

---

## 💡 중요 팁

1. **내부 도메인은 사용하지 마세요**:
   - `livescore.railway.internal`은 외부 접근 불가
   - Public Domain을 생성해야 합니다

2. **Public Domain 형식**:
   - `https://your-service.railway.app`
   - 또는 `https://your-service.up.railway.app`

3. **도메인 변경**:
   - Public Domain은 언제든지 재생성 가능
   - 도메인이 변경되면 프론트엔드 환경변수도 업데이트 필요

---

## 🐛 문제 해결

### Public Domain이 생성되지 않으면:

1. **Networking 섹션 확인**:
   - Settings → Networking 섹션으로 이동
   - "⚡ Generate Domain" 버튼이 있는지 확인

2. **권한 확인**:
   - 프로젝트 소유자 또는 관리자 권한 확인

3. **서비스 상태 확인**:
   - 서비스가 배포되어 실행 중인지 확인

---

## 🔗 관련 문서

- [프론트엔드 환경변수 설정](./ENV_SETUP_GUIDE.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [백엔드 호출 문제 해결](./BACKEND_CALL_FIX.md)

---

## 📞 다음 단계

1. **Public Domain 생성**:
   - Settings → Networking → "⚡ Generate Domain" 클릭

2. **도메인 확인**:
   - 생성된 Public Domain URL 복사

3. **프론트엔드 환경변수 업데이트**:
   - `.env.production` 파일에 Public Domain 설정

4. **재빌드 및 재배포**:
   - 프론트엔드 재빌드 및 재배포

5. **테스트**:
   - 헬스체크 및 프론트엔드에서 API 호출 확인

Public Domain을 생성하면 프론트엔드에서 백엔드 API를 호출할 수 있습니다!

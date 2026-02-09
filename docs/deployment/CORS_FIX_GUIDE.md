# CORS 오류 해결 가이드

## 🚨 현재 상황

브라우저 콘솔에서 확인:
- ✅ API 호출이 `https://acceptable-determination-production-a4db.up.railway.app`로 정상 전송됨
- ✅ Socket.io 연결 성공 (`✔ Socket 연결됨`)
- ❌ **CORS 오류 발생**: `No 'Access-Control-Allow-Origin' header is present`
- ❌ 요청 Origin: `https://scorelivenow.com`

**문제**: 백엔드 CORS 설정에 프론트엔드 도메인이 포함되지 않음

---

## ✅ 해결 방법

### Railway 환경변수 설정

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭:

#### 필수 환경변수 확인:

```
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
```

**중요**: 
- 콤마로 구분된 여러 도메인 허용
- `https://` 프로토콜 포함
- `www` 버전도 포함 권장

---

## 🔍 현재 CORS 설정 확인

백엔드 코드 (`server/src/index.ts`)에서:

```typescript
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://scorelivenow.com', 'https://www.scorelivenow.com']
    : ['http://localhost:3000'];
```

**확인 사항**:
- `CORS_ORIGIN` 환경변수가 설정되어 있는지
- `https://scorelivenow.com`이 포함되어 있는지

---

## 📋 단계별 해결 방법

### Step 1: Railway 환경변수 확인

1. Railway 대시보드 → 프로젝트 → 서비스 선택
2. **Variables** 탭 클릭
3. `CORS_ORIGIN` 환경변수 확인:
   ```
   CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
   ```

### Step 2: 환경변수 수정 (없거나 잘못된 경우)

1. Variables 탭에서 `CORS_ORIGIN` 찾기
2. 없으면 "+ New Variable" 클릭
3. 변수명: `CORS_ORIGIN`
4. 값: `https://scorelivenow.com,https://www.scorelivenow.com`
5. 저장

### Step 3: 백엔드 재시작

환경변수를 변경한 후:
1. Railway가 자동으로 재배포 시작
2. 또는 수동으로 "Deploy" 버튼 클릭
3. 배포 완료 대기

### Step 4: 확인

브라우저에서:
1. 강력 새로고침 (Ctrl+Shift+R)
2. 개발자 도구 → Network 탭
3. API 요청 확인:
   - CORS 오류가 사라졌는지 확인
   - 응답이 정상적으로 받아지는지 확인

---

## 🔍 CORS 오류 확인 방법

### 브라우저 콘솔에서:

**CORS 오류 메시지**:
```
Access to XMLHttpRequest at 'https://acceptable-determination-production-a4db.up.railway.app/api/...' 
from origin 'https://scorelivenow.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**해결 후 예상 메시지**:
- CORS 오류 없음
- API 응답 정상 수신
- 데이터가 화면에 표시됨

---

## 📋 Railway 환경변수 체크리스트

```
[ ] CORS_ORIGIN 환경변수 설정됨
[ ] 값: https://scorelivenow.com,https://www.scorelivenow.com
[ ] 백엔드 재배포 완료
[ ] 브라우저에서 CORS 오류 사라짐 확인
[ ] API 응답 정상 수신 확인
```

---

## 💡 빠른 해결 방법

Railway 대시보드에서:

1. **서비스 선택** → **Variables** 탭
2. **CORS_ORIGIN** 환경변수 확인/추가:
   ```
   https://scorelivenow.com,https://www.scorelivenow.com
   ```
3. **저장**
4. **자동 재배포 대기** (또는 수동 재배포)
5. **브라우저에서 확인**

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [문제 해결 가이드](./TROUBLESHOOT.md)

---

**프론트엔드는 올바르게 설정되었습니다! 이제 백엔드 CORS 설정만 수정하면 됩니다.**

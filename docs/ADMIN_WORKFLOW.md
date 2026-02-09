# 어드민 승인 워크플로우 가이드

## 개요

이 문서는 scorelivenow.com의 사용자 승인 워크플로우와 어드민 시스템에 대한 가이드를 제공합니다.

---

## Railway 환경변수 설정

Railway 대시보드 → 프로젝트 → 서비스 → **Variables** 탭에서 다음 환경변수를 설정하세요:

### 필수 환경변수

```env
# 인증
JWT_SECRET=<강력한 랜덤 문자열, 최소 32자>
JWT_EXPIRES_IN=7d

# 데이터베이스
DATABASE_URL=mongodb+srv://...

# CORS
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com

# 어드민 초기 계정 (서버 시작 시 자동 생성)
ADMIN_EMAIL=admin@scorelivenow.com
ADMIN_PASSWORD=<강력한 비밀번호>

# API 키
THESPORTSDB_API_KEY=123

# 폴링 설정
PRIMARY_POLL_INTERVAL_SECONDS=30
SECONDARY_POLL_INTERVAL_SECONDS=90
CACHE_TTL_SECONDS=30

# 스포츠 목록
DEFAULT_SPORTS=Soccer,Basketball,American Football,Baseball,Ice Hockey,Cricket,Tennis,Fighting,Motorsport,Volleyball

# 환경
NODE_ENV=production
```

### 선택 환경변수

```env
# 텔레그램 문의 링크 (프론트엔드)
VITE_TELEGRAM_URL=https://t.me/scorelivenow

# 이메일 설정 (회원가입 인증용)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 초기 ADMIN 계정 생성

### 자동 생성

서버가 시작될 때 다음 조건을 만족하면 자동으로 ADMIN 계정이 생성됩니다:

1. `ADMIN_EMAIL` 환경변수가 설정되어 있음
2. `ADMIN_PASSWORD` 환경변수가 설정되어 있음
3. 해당 이메일의 ADMIN 계정이 아직 존재하지 않음

**생성되는 계정 정보:**
- Role: `ADMIN`
- Status: `APPROVED` (자동 승인)
- isVerified: `true` (이메일 인증 불필요)

### 수동 생성 (필요한 경우)

MongoDB에서 직접 생성:

```javascript
// MongoDB 콘솔에서
use livescore;
db.users.insertOne({
  email: "admin@scorelivenow.com",
  password: "<bcrypt 해시된 비밀번호>",
  name: "Admin",
  role: "ADMIN",
  status: "APPROVED",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## 승인 워크플로우

### 1. 사용자 회원가입

**프로세스:**
1. 사용자가 `/register` 페이지에서 회원가입
2. 이메일 인증 토큰 발송 (이메일 설정된 경우)
3. 사용자 계정 생성:
   - Role: `USER` (기본값)
   - Status: `PENDING` (승인 대기)
   - isVerified: `false` (이메일 인증 전)

**API 엔드포인트:**
```
POST /api/auth/register
Body: { email, password, name }
Response: { message, user: { id, email, name, status: "PENDING" } }
```

### 2. 이메일 인증 (선택사항)

**프로세스:**
1. 사용자가 이메일의 인증 링크 클릭
2. `isVerified`가 `true`로 변경됨
3. 여전히 `status: PENDING` 상태 유지

**API 엔드포인트:**
```
GET /api/auth/verify-email?token=<verification_token>
```

### 3. 어드민 승인/거절

**프로세스:**
1. 어드민이 `/admin/login`에서 로그인
2. `/admin/dashboard`에서 승인 대기 사용자 목록 확인
3. 승인 또는 거절 버튼 클릭

**API 엔드포인트:**

승인 대기 사용자 목록:
```
GET /api/admin/users?status=PENDING
Headers: { Authorization: Bearer <token> }
```

사용자 승인:
```
PATCH /api/admin/users/:id/approve
Headers: { Authorization: Bearer <token> }
Response: { message, user: { id, email, name, status: "APPROVED" } }
```

사용자 거절:
```
PATCH /api/admin/users/:id/reject
Headers: { Authorization: Bearer <token> }
Response: { message, user: { id, email, name, status: "REJECTED" } }
```

### 4. 사용자 로그인

**프로세스:**
1. 사용자가 `/login` 페이지에서 로그인 시도
2. 다음 조건을 모두 만족해야 로그인 성공:
   - 이메일/비밀번호가 올바름
   - `isVerified: true` (이메일 인증 완료)
   - `status: APPROVED` (어드민 승인 완료) 또는 `role: ADMIN`

**API 엔드포인트:**
```
POST /api/auth/login
Body: { email, password }
Response: { message, user: { id, email, name, role, status }, token }
```

**로그인 실패 케이스:**
- `401`: 이메일/비밀번호 불일치
- `401`: 이메일 인증 필요
- `403`: 계정 승인 필요 (`status: PENDING` 또는 `REJECTED`)

---

## 어드민 대시보드 사용법

### 접근 방법

1. 브라우저에서 `https://scorelivenow.com/admin/login` 접속
2. ADMIN 계정으로 로그인
3. 자동으로 `/admin/dashboard`로 이동

### 기능

**승인 대기 사용자 관리:**
- 승인 대기(PENDING) 사용자 목록 확인
- 승인/거절 버튼으로 상태 변경
- 승인됨(APPROVED), 거절됨(REJECTED) 필터링 가능

**사용자 정보:**
- 이메일, 이름, 상태, 가입일 확인

---

## 보안 고려사항

### 1. JWT_SECRET

- 최소 32자의 강력한 랜덤 문자열 사용
- 프로덕션 환경에서는 반드시 설정
- Git에 커밋하지 않음

### 2. ADMIN_PASSWORD

- 강력한 비밀번호 사용 (최소 12자, 대소문자/숫자/특수문자 포함)
- 정기적으로 변경 권장
- Git에 커밋하지 않음

### 3. CORS_ORIGIN

- 정확한 도메인만 허용
- 프로덕션: `https://scorelivenow.com,https://www.scorelivenow.com`
- 개발: `http://localhost:3000`

### 4. 비밀번호 해싱

- 모든 비밀번호는 `bcrypt`로 해시 저장
- 해시 라운드: 12

---

## 배포 후 체크리스트

### 1. 환경변수 확인

- [ ] Railway Variables에 모든 필수 환경변수 설정됨
- [ ] `ADMIN_EMAIL`, `ADMIN_PASSWORD` 설정됨
- [ ] `JWT_SECRET` 설정됨 (강력한 랜덤 문자열)
- [ ] `CORS_ORIGIN` 설정됨

### 2. 서버 시작 확인

- [ ] Railway 배포 로그에서 "✅ [Admin] 초기 ADMIN 계정이 생성되었습니다" 메시지 확인
- [ ] MongoDB 연결 성공 확인
- [ ] 서버가 정상적으로 시작됨

### 3. 어드민 로그인 테스트

- [ ] `https://scorelivenow.com/admin/login` 접속 가능
- [ ] ADMIN 계정으로 로그인 성공
- [ ] `/admin/dashboard` 접근 가능

### 4. 사용자 승인 워크플로우 테스트

- [ ] 일반 사용자 회원가입 → `status: PENDING` 확인
- [ ] 어드민 대시보드에서 승인 대기 사용자 확인
- [ ] 승인 버튼 클릭 → `status: APPROVED` 변경 확인
- [ ] 승인된 사용자로 로그인 성공 확인

### 5. API 엔드포인트 테스트

```bash
# Health check
curl https://acceptable-determination-production-a4db.up.railway.app/api/health

# 어드민 로그인
curl -X POST https://acceptable-determination-production-a4db.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scorelivenow.com","password":"your-password"}'

# 승인 대기 사용자 목록 (토큰 필요)
curl https://acceptable-determination-production-a4db.up.railway.app/api/admin/users?status=PENDING \
  -H "Authorization: Bearer <token>"
```

---

## 문제 해결

### ADMIN 계정이 생성되지 않음

**원인:**
- `ADMIN_EMAIL` 또는 `ADMIN_PASSWORD` 환경변수가 설정되지 않음
- MongoDB 연결 실패

**해결:**
1. Railway Variables에서 환경변수 확인
2. 서버 재시작
3. 배포 로그에서 오류 메시지 확인

### 어드민 로그인 실패

**원인:**
- 비밀번호 불일치
- 계정이 ADMIN role이 아님

**해결:**
1. MongoDB에서 계정 확인:
   ```javascript
   db.users.findOne({ email: "admin@scorelivenow.com" })
   ```
2. `role: "ADMIN"` 확인
3. 비밀번호 재설정 또는 환경변수 확인

### 승인 대기 사용자가 보이지 않음

**원인:**
- 어드민 권한 없음
- 필터 설정 오류

**해결:**
1. 사용자 계정의 `role` 확인
2. 대시보드에서 필터 확인 (PENDING 선택)
3. API 응답 확인

---

## 관련 문서

- [Railway 배포 가이드](./deployment/BACKEND_DEPLOY_RAILWAY.md)
- [CORS 설정 가이드](./deployment/CORS_FIX_GUIDE.md)
- [프론트엔드 배포 가이드](./deployment/FRONTEND_DEPLOY_NAMECHEAP.md)

---

**마지막 업데이트:** 2026-02-08

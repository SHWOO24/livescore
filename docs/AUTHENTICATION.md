# 인증 시스템 문서

## 개요

라이브스코어 애플리케이션의 인증 시스템은 **쿠키 기반 JWT 토큰** 방식을 사용합니다.

## 인증 방식

### 현재 구현: Cookie 기반 JWT

- **토큰 저장**: `httpOnly` 쿠키에 JWT 토큰 저장
- **전송 방식**: 
  - 쿠키 자동 전송 (브라우저가 자동 처리)
  - 또는 `Authorization: Bearer <token>` 헤더 (선택적)
- **보안**: 
  - `httpOnly`: JavaScript 접근 불가 (XSS 방지)
  - `secure`: 프로덕션에서 HTTPS 필수
  - `sameSite`: cross-site 요청 지원

## 환경변수

### 백엔드 (server/.env)

```env
# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com

# 기타
NODE_ENV=production
PORT=5000
```

### 프론트엔드 (client/.env.production)

```env
VITE_API_BASE_URL=https://acceptable-determination-production-a4db.up.railway.app
VITE_SOCKET_URL=https://acceptable-determination-production-a4db.up.railway.app
```

## CORS 설정

### 백엔드 CORS 설정

```typescript
app.use(cors({
  origin: (origin, cb) => {
    // 허용된 Origin 목록 확인
    if (!origin) return cb(null, true); // same-origin 허용
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false); // 거부
  },
  credentials: true, // 쿠키 전송 허용
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

### 프론트엔드 설정

```typescript
// axios 설정
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 쿠키 전송 필수
  timeout: 15000,
});
```

## 인증 플로우

### 1. 로그인

```
POST /api/auth/login
Body: { email, password }

Response:
- 200: { user, token }
- Set-Cookie: token=<jwt> (httpOnly, secure, sameSite)
```

### 2. 인증 확인

```
GET /api/auth/me
Headers: Cookie: token=<jwt>
또는
Headers: Authorization: Bearer <jwt>

Response:
- 200: { user }
- 401: { message: "인증이 필요합니다" }
```

### 3. 로그아웃

```
POST /api/auth/logout
Response: Clear-Cookie: token
```

## 비로그인 사용자 처리

### 프론트엔드 동작

1. **초기 로딩**: `/api/auth/me` 호출 시도
2. **401 응답**: 정상 처리 (비로그인 상태로 간주)
3. **페이지 렌더링**: 인증 실패와 무관하게 라이브스코어 표시
4. **개인화 기능**: 로그인 필요 기능만 비활성화

### 백엔드 동작

- `/api/auth/me`: `protect` 미들웨어로 보호됨
- 토큰 없음 → 401 반환 (정상)
- 토큰 유효하지 않음 → 401 반환
- 토큰 유효 → 사용자 정보 반환

## 쿠키 설정 상세

### 프로덕션 환경

```typescript
{
  httpOnly: true,        // JavaScript 접근 불가
  secure: true,          // HTTPS 필수
  sameSite: 'none',     // cross-site 요청 허용
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
  path: '/'              // 모든 경로에서 사용
}
```

### 개발 환경

```typescript
{
  httpOnly: true,
  secure: false,         // HTTP 허용
  sameSite: 'lax',       // same-site 우선
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
}
```

## 문제 해결

### 쿠키가 전송되지 않는 경우

1. **CORS 설정 확인**
   - `credentials: true` 설정 확인
   - `Access-Control-Allow-Credentials: true` 헤더 확인

2. **쿠키 설정 확인**
   - `sameSite: 'none'`인 경우 `secure: true` 필수
   - `path: '/'` 설정 확인

3. **브라우저 확인**
   - 개발자 도구 → Application → Cookies
   - 쿠키가 설정되었는지 확인

### 401 오류가 계속 발생하는 경우

1. **토큰 만료**: 재로그인 필요
2. **쿠키 전송 실패**: CORS/쿠키 설정 확인
3. **토큰 형식 오류**: 백엔드 로그 확인

## 보안 고려사항

1. **XSS 방지**: `httpOnly` 쿠키 사용
2. **CSRF 방지**: `sameSite` 설정 활용
3. **HTTPS 필수**: 프로덕션에서 `secure: true`
4. **토큰 만료**: 7일 후 자동 만료
5. **비밀번호**: bcrypt 해싱

## 로깅

### 백엔드 로깅

인증 실패 시 다음 정보를 로깅합니다:
- 요청 경로 (`path`)
- HTTP 메서드 (`method`)
- Origin (`origin`)
- 쿠키 존재 여부 (`hasCookie`)
- Authorization 헤더 존재 여부 (`hasAuthHeader`)
- User-Agent (처음 50자)

**민감 정보는 로깅하지 않습니다:**
- 토큰 값
- 비밀번호
- 전체 User-Agent

## Health Check

### 엔드포인트

```
GET /api/health
```

### 응답

```json
{
  "ok": true,
  "status": "ok",
  "message": "Server is running",
  "time": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "mongodb": "connected"
}
```

## 참고

- JWT 토큰은 사용자 ID만 포함 (최소 정보 원칙)
- 토큰 검증은 `protect` 미들웨어에서 수행
- 인증 실패는 정상적인 경우 (비로그인 사용자)이므로 조용히 처리

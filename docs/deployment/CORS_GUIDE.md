# CORS 설정 가이드

## 현재 CORS 설정

백엔드 서버는 다음 도메인에서의 요청을 허용합니다:

- `https://scorelivenow.com`
- `https://www.scorelivenow.com`

## 환경변수 설정

`.env` 파일에서 `CORS_ORIGIN` 환경변수로 설정:

```bash
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
```

여러 도메인은 쉼표로 구분합니다.

## 코드 구현

### Express CORS 설정

`server/src/index.ts`에서:

```typescript
const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: corsOrigin.includes(',') ? corsOrigin.split(',').map(o => o.trim()) : corsOrigin,
  credentials: true,  // 쿠키 전송 허용
}));
```

### Socket.io CORS 설정

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});
```

## 프론트엔드 설정

프론트엔드에서 API 호출 시:

```typescript
// axios 설정
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // 쿠키 전송
});

// Socket.io 설정
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
});
```

## 테스트

### CORS 헤더 확인

```bash
curl -H "Origin: https://scorelivenow.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.scorelivenow.com/api/health \
     -v
```

예상 응답 헤더:
```
Access-Control-Allow-Origin: https://scorelivenow.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 문제 해결

### CORS 오류 발생 시

1. **환경변수 확인**
   ```bash
   # 서버에서 확인
   echo $CORS_ORIGIN
   ```

2. **프론트엔드 도메인 확인**
   - 브라우저 주소창의 정확한 도메인 확인
   - `www` 포함 여부 확인

3. **Nginx 설정 확인**
   - 프록시 헤더가 올바르게 전달되는지 확인
   - `X-Forwarded-Proto`, `X-Forwarded-Host` 헤더 확인

4. **브라우저 콘솔 확인**
   - CORS 오류 메시지 확인
   - 요청 헤더 확인 (Network 탭)

## 보안 고려사항

- ⚠️ `CORS_ORIGIN`에 `*` (모든 도메인)을 사용하지 마세요
- ⚠️ 프로덕션에서는 정확한 도메인만 허용하세요
- ⚠️ `credentials: true` 사용 시 특정 도메인만 허용해야 합니다

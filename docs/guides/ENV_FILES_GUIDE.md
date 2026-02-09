# 환경변수 파일 생성 가이드

## 📝 백엔드 환경변수 파일

### `server/.env.production.example` 생성

다음 내용으로 `server/.env.production.example` 파일을 생성하세요:

```env
# 백엔드 서버 프로덕션 환경변수
# 이 파일을 .env로 복사하고 실제 값으로 수정하세요

# 서버 포트 (Render/Railway/Fly.io는 자동 할당되므로 설정 불필요할 수 있음)
PORT=5000

# JWT 비밀키 (반드시 강력한 랜덤 문자열로 변경하세요)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS 허용 Origin (쉼표로 구분)
# 운영 환경: 프론트엔드 도메인
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com

# MongoDB 연결 문자열
# MongoDB Atlas 사용 시: mongodb+srv://username:password@cluster.mongodb.net/livescore
# 로컬 MongoDB 사용 시: mongodb://localhost:27017/livescore
DATABASE_URL=mongodb://localhost:27017/livescore

# 이메일 설정 (회원가입 인증용)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 프론트엔드 URL (이메일 인증 링크 생성용)
FRONTEND_URL=https://scorelivenow.com

# Node 환경
NODE_ENV=production
```

---

## 📝 프론트엔드 환경변수 파일

### `client/.env.production.example` 생성

다음 내용으로 `client/.env.production.example` 파일을 생성하세요:

```env
# 프론트엔드 프로덕션 환경변수
# 이 파일을 .env.production으로 복사하고 실제 백엔드 URL로 수정하세요

# 백엔드 API 서버 URL
# 예: https://livescore-api.onrender.com
# 예: https://api.scorelivenow.com
VITE_API_BASE_URL=https://api.example.com

# Socket.io 서버 URL (보통 API URL과 동일)
# 예: https://livescore-api.onrender.com
# 예: https://api.scorelivenow.com
VITE_SOCKET_URL=https://api.example.com
```

---

## 🔧 사용 방법

### 백엔드

1. `.env.production.example`을 `.env`로 복사:
   ```bash
   cd server
   cp .env.production.example .env
   ```

2. `.env` 파일을 편집하여 실제 값으로 수정

3. 배포 플랫폼에서는 환경변수로 직접 설정 (파일 업로드 불필요)

### 프론트엔드

1. `.env.production.example`을 `.env.production`으로 복사:
   ```bash
   cd client
   cp .env.production.example .env.production
   ```

2. `.env.production` 파일을 편집하여 실제 백엔드 URL로 수정:
   ```env
   VITE_API_BASE_URL=https://<BACKEND_HOST>
   VITE_SOCKET_URL=https://<BACKEND_HOST>
   ```

3. 재빌드:
   ```bash
   npm run build
   npm run deploy:prepare
   ```

---

## ⚠️ 주의사항

- `.env` 파일은 **절대 Git에 커밋하지 마세요**
- `.env.production.example`은 예시 파일이므로 Git에 커밋 가능
- 실제 비밀번호나 키는 환경변수로만 관리

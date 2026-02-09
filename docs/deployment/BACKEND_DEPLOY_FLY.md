# Fly.io로 백엔드 서버 배포 가이드

## 📋 사전 요구사항

- Fly.io 계정 (https://fly.io)
- Fly CLI 설치 (`curl -L https://fly.io/install.sh | sh`)
- GitHub 저장소
- MongoDB Atlas 계정 (또는 MongoDB 호스팅)

---

## 🚀 배포 절차

### 1단계: Fly CLI 로그인

```bash
fly auth login
```

### 2단계: 프로젝트 초기화

```bash
# server 디렉토리로 이동
cd server

# Fly.io 앱 초기화
fly launch
```

초기화 과정에서:
- 앱 이름 입력 (예: `livescore-api`)
- 지역 선택 (가장 가까운 지역)
- PostgreSQL 설정: `No` (MongoDB 사용)
- Redis 설정: `No` (필요 시)

### 3단계: fly.toml 설정

`server/fly.toml` 파일이 생성됩니다. 다음과 같이 수정:

```toml
app = "livescore-api"
primary_region = "iad"  # 가장 가까운 지역

[build]
  command = "npm ci && npm run build"

[env]
  NODE_ENV = "production"
  PORT = "8080"  # Fly.io는 내부적으로 8080 사용

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.http_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "5s"
    method = "GET"
    path = "/api/health"
```

### 4단계: 환경변수 설정

```bash
# Fly.io에 환경변수 설정
fly secrets set JWT_SECRET=your-super-secret-key
fly secrets set CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
fly secrets set DATABASE_URL=mongodb+srv://...
fly secrets set EMAIL_HOST=smtp.gmail.com
fly secrets set EMAIL_PORT=587
fly secrets set EMAIL_USER=your-email@gmail.com
fly secrets set EMAIL_PASS=your-app-password
fly secrets set FRONTEND_URL=https://scorelivenow.com
```

또는 `fly.toml`에 직접 추가 (보안상 권장하지 않음):

```toml
[env]
  JWT_SECRET = "your-super-secret-key"
  CORS_ORIGIN = "https://scorelivenow.com,https://www.scorelivenow.com"
  DATABASE_URL = "mongodb+srv://..."
  # ... 기타 환경변수
```

### 5단계: 배포

```bash
fly deploy
```

---

## ✅ 배포 확인

### Health Check

배포 완료 후 다음 URL로 확인:

```
https://<YOUR_APP_NAME>.fly.dev/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 서비스 URL

Fly.io는 다음과 같은 URL을 제공합니다:
```
https://<YOUR_APP_NAME>.fly.dev
```

이 URL을 프론트엔드 환경변수에 설정하세요:
```env
VITE_API_BASE_URL=https://<YOUR_APP_NAME>.fly.dev
VITE_SOCKET_URL=https://<YOUR_APP_NAME>.fly.dev
```

---

## 🔧 업데이트 방법

### 자동 배포

GitHub Actions를 사용하여 자동 배포 설정 가능:

`.github/workflows/fly.yml`:
```yaml
name: Fly Deploy
on:
  push:
    branches: [main]
    paths:
      - 'server/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        working-directory: ./server
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### 수동 배포

```bash
cd server
fly deploy
```

---

## ⚙️ 고급 설정

### Custom Domain (선택사항)

```bash
# 도메인 추가
fly domains add api.scorelivenow.com

# DNS 설정 안내가 표시됩니다
```

### Health Check

`fly.toml`에 이미 설정되어 있습니다:
```toml
[[services.http_checks]]
  path = "/api/health"
```

### 스케일링

```bash
# 인스턴스 수 증가
fly scale count 2

# 리소스 조정
fly scale vm shared-cpu-1x
```

---

## 💰 가격

- **Free Tier**: 
  - 3개의 공유 CPU VM
  - 256MB RAM
  - 3GB 스토리지
  - 월 160GB 네트워크 전송

- **Paid Plans**: 
  - 더 많은 리소스
  - 전용 CPU
  - 더 많은 스토리지

---

## 🚨 주의사항

1. **포트 설정**:
   - Fly.io는 내부적으로 `8080` 포트 사용
   - `process.env.PORT`를 사용하도록 코드 확인

2. **환경변수 보안**:
   - 민감한 정보는 `fly secrets`로 관리
   - `.env` 파일을 Git에 커밋하지 마세요

3. **MongoDB Atlas**:
   - Fly.io와 같은 클라우드 환경에서는 MongoDB Atlas 사용 권장
   - 로컬 MongoDB는 연결 불가

---

## 📝 요약

### 필수 설정

- **Root Directory**: `server`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Health Check URL**: `https://<YOUR_APP_NAME>.fly.dev/api/health`

### 필수 환경변수

- `NODE_ENV=production`
- `PORT=8080` (Fly.io 내부 포트)
- `JWT_SECRET` (강력한 랜덤 문자열)
- `CORS_ORIGIN` (프론트엔드 도메인)
- `DATABASE_URL` (MongoDB 연결 문자열)

---

## 🔗 관련 문서

- [Fly.io 공식 문서](https://fly.io/docs)
- [MongoDB Atlas 설정](https://www.mongodb.com/cloud/atlas)

# Render로 백엔드 서버 배포 가이드

## 📋 사전 요구사항

- Render 계정 (https://render.com)
- GitHub 저장소 (또는 GitLab/Bitbucket)
- MongoDB Atlas 계정 (또는 MongoDB 호스팅)

---

## 🚀 배포 절차

### 1단계: GitHub에 코드 푸시

```bash
# 로컬에서
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2단계: Render에서 새 Web Service 생성

1. Render 대시보드 접속
2. "New +" → "Web Service" 클릭
3. GitHub 저장소 연결 및 선택

### 3단계: 서비스 설정

#### 기본 설정

- **Name**: `livescore-api` (또는 원하는 이름)
- **Region**: 가장 가까운 지역 선택
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `server` ⚠️ **중요!** (서버 코드가 있는 디렉토리)

**디렉토리 구조 설명**:
```
GitHub 저장소:
livescore/
├── client/          ← 프론트엔드 (업로드 안 함)
└── server/          ← 백엔드 (Root Directory로 설정)
    ├── src/        ← 소스 코드
    ├── package.json
    └── tsconfig.json
```

Render는 `server/` 디렉토리를 루트로 인식합니다.

#### 빌드 설정

- **Build Command**: 
  ```bash
  npm ci && npm run build
  ```

- **Start Command**: 
  ```bash
  npm start
  ```

#### 환경변수 설정

"Environment" 섹션에서 다음 변수 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `NODE_ENV` | `production` | 환경 설정 |
| `PORT` | (자동 할당) | Render가 자동으로 할당 |
| `JWT_SECRET` | `your-super-secret-key` | 강력한 랜덤 문자열 |
| `CORS_ORIGIN` | `https://scorelivenow.com,https://www.scorelivenow.com` | 프론트엔드 도메인 |
| `DATABASE_URL` | `mongodb+srv://...` | MongoDB Atlas 연결 문자열 |
| `THESPORTSDB_API_KEY` | `123` | TheSportsDB API 키 (기본값) |
| `CACHE_TTL_SECONDS` | `30` | 캐시 TTL (초) |
| `PRIMARY_POLL_INTERVAL_SECONDS` | `30` | Primary Sport (Soccer) 폴링 주기 (초) |
| `SECONDARY_POLL_INTERVAL_SECONDS` | `90` | Secondary Sports 폴링 주기 (초) |
| `DEFAULT_SPORTS` | `Soccer,Basketball,Baseball,American Football,Ice Hockey` | 기본 스포츠 목록 (순환 폴링) |
| `EMAIL_HOST` | `smtp.gmail.com` | 이메일 서버 (선택사항) |
| `EMAIL_PORT` | `587` | 이메일 포트 (선택사항) |
| `EMAIL_USER` | `your-email@gmail.com` | 이메일 계정 (선택사항) |
| `EMAIL_PASS` | `your-app-password` | 이메일 앱 비밀번호 (선택사항) |
| `FRONTEND_URL` | `https://scorelivenow.com` | 프론트엔드 URL (선택사항) |

### 4단계: 서비스 생성

"Create Web Service" 클릭

---

## ✅ 배포 확인

### Health Check

배포 완료 후 다음 URL로 확인:

```
https://<YOUR_SERVICE_NAME>.onrender.com/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 서비스 URL

Render는 다음과 같은 URL을 제공합니다:
```
https://<YOUR_SERVICE_NAME>.onrender.com
```

이 URL을 프론트엔드 환경변수에 설정하세요:
```env
VITE_API_BASE_URL=https://<YOUR_SERVICE_NAME>.onrender.com
VITE_SOCKET_URL=https://<YOUR_SERVICE_NAME>.onrender.com
```

---

## 🔧 업데이트 방법

### 자동 배포 (권장)

GitHub에 푸시하면 자동으로 재배포됩니다.

### 수동 재배포

1. Render 대시보드에서 서비스 선택
2. "Manual Deploy" → "Deploy latest commit" 클릭

---

## ⚙️ 고급 설정

### Custom Domain (선택사항)

1. 서비스 설정 → "Custom Domains"
2. 도메인 추가 (예: `api.scorelivenow.com`)
3. DNS 설정:
   - Type: `CNAME`
   - Name: `api` (또는 원하는 서브도메인)
   - Value: `<YOUR_SERVICE_NAME>.onrender.com`

### Auto-Deploy

기본적으로 활성화되어 있으며, `main` 브랜치에 푸시 시 자동 배포됩니다.

### Health Check

Render는 자동으로 `/api/health` 엔드포인트를 모니터링합니다.

---

## 💰 가격

- **Free Tier**: 
  - 750시간/월 무료
  - 15분 비활성 시 슬리프 모드 (첫 요청 시 깨어남)
  - WebSocket 지원

- **Paid Plans**: 
  - 항상 실행 (슬리프 없음)
  - 더 많은 리소스

---

## 🚨 주의사항

1. **Free Tier 슬리프 모드**: 
   - 15분 비활성 시 자동 슬리프
   - 첫 요청 시 깨어나는데 약간의 지연 발생
   - 프로덕션에는 Paid Plan 권장

2. **환경변수 보안**:
   - 민감한 정보는 환경변수로만 관리
   - `.env` 파일을 Git에 커밋하지 마세요

3. **MongoDB Atlas**:
   - Render와 같은 클라우드 환경에서는 MongoDB Atlas 사용 권장
   - 로컬 MongoDB는 연결 불가

---

## 📝 요약

### 필수 설정

- **Root Directory**: `server`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Health Check URL**: `https://<YOUR_SERVICE_NAME>.onrender.com/api/health`

### 필수 환경변수

- `NODE_ENV=production`
- `PORT` (Render가 자동 할당)
- `JWT_SECRET` (강력한 랜덤 문자열, 최소 32자)
- `CORS_ORIGIN` (프론트엔드 도메인, 쉼표로 구분)
- `DATABASE_URL` (MongoDB 연결 문자열)
- `THESPORTSDB_API_KEY` (기본값: `123`)
- `PRIMARY_POLL_INTERVAL_SECONDS` (기본값: `30`)
- `SECONDARY_POLL_INTERVAL_SECONDS` (기본값: `90`)
- `CACHE_TTL_SECONDS` (기본값: `30`)

### 선택 환경변수

- `DEFAULT_SPORTS` (기본값: `Soccer,Basketball,Baseball,American Football,Ice Hockey`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (이메일 인증 사용 시)
- `FRONTEND_URL` (이메일 링크에 사용)

---

## 🔗 관련 문서

- [Render 공식 문서](https://render.com/docs)
- [MongoDB Atlas 설정](https://www.mongodb.com/cloud/atlas)

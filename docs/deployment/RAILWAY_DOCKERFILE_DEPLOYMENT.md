# Railway Dockerfile 기반 배포 가이드

## 🎯 개요

이 레포는 **Dockerfile 기반 배포**를 사용하여 Railway에서 안정적으로 빌드/배포됩니다.

**핵심 원칙**:
- ❌ `npm ci` 사용 안 함 → EBUSY 오류 방지
- ✅ `npm install` 사용 → 안정적인 의존성 설치
- ✅ Dockerfile로 모든 빌드 단계 관리
- ✅ TypeScript가 항상 설치됨 (devDependencies 포함)

---

## 📁 레포 구조

```
livescore/
├── Dockerfile              ← 루트에 위치 (필수)
├── .dockerignore           ← Docker 빌드 제외 파일
├── package.json            ← 루트 package.json
├── package-lock.json      ← 루트 package-lock.json
├── server/
│   ├── src/                ← 서버 소스 코드
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── railway.json        ← Railway 설정
├── client/
│   ├── src/                ← 클라이언트 소스 코드
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
└── docs/
    └── deployment/         ← 배포 문서들
```

---

## 🐳 Dockerfile 설명

### 빌드 단계:

1. **베이스 이미지**: `node:20-alpine`
2. **의존성 설치**:
   - 루트: `npm install`
   - 서버: `npm install`
   - 클라이언트: `npm install` (TypeScript 포함)
3. **빌드**:
   - 서버: `npm run build` (TypeScript 컴파일)
   - 클라이언트: `npm run build` (TypeScript 컴파일 + Vite 빌드)
4. **실행**: `npm start` → `cd server && npm start`

### 핵심 특징:

- **npm ci 사용 안 함**: EBUSY 오류 방지
- **devDependencies 포함**: TypeScript가 항상 설치됨
- **순차적 빌드**: 서버 → 클라이언트 순서로 빌드

---

## 🚀 Railway 배포 설정

### 자동 감지

Railway는 루트 디렉토리의 Dockerfile을 자동으로 감지합니다:

1. GitHub 저장소 연결
2. Railway가 Dockerfile 감지
3. 자동으로 Dockerfile 기반 빌드 시작

### 수동 설정 (필요한 경우)

Railway 대시보드 → 서비스 → Settings:

- **Builder**: `DOCKERFILE`
- **Dockerfile Path**: `Dockerfile` (루트)
- **Start Command**: `npm start`

또는 `server/railway.json` 파일 사용:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📋 환경변수 설정

Railway 대시보드 → 서비스 → Variables 탭:

### 필수 환경변수:

```
NODE_ENV=production
JWT_SECRET=your-strong-random-string-32-chars-minimum
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
DATABASE_URL=mongodb+srv://...
THESPORTSDB_API_KEY=123
PRIMARY_POLL_INTERVAL_SECONDS=30
SECONDARY_POLL_INTERVAL_SECONDS=90
CACHE_TTL_SECONDS=30
DEFAULT_SPORTS=Soccer,Basketball,Baseball,American Football,Ice Hockey
```

**주의**: `PORT`는 Railway가 자동 할당하므로 설정하지 않아도 됩니다.

---

## ✅ 배포 확인

### 빌드 로그 확인:

성공적인 빌드 로그:
```
✓ Installing dependencies (npm install)
✓ Building server (npm run build)
✓ Building client (npm run build)
✓ Starting service (npm start)
```

**확인 사항**:
- ❌ `npm ci` 명령어가 로그에 없어야 함
- ✅ `npm install` 명령어만 사용됨
- ✅ 서버 빌드 성공
- ✅ 클라이언트 빌드 성공

### 헬스체크:

```bash
curl https://your-service.railway.app/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🔧 문제 해결

### 문제 1: Dockerfile을 찾을 수 없음

**해결**:
- Dockerfile이 루트 디렉토리에 있는지 확인
- `.dockerignore` 파일 확인

### 문제 2: npm ci가 실행됨

**해결**:
- Dockerfile에서 `npm ci`를 `npm install`로 변경
- railway.json에서 buildCommand 확인

### 문제 3: TypeScript를 찾을 수 없음

**해결**:
- Dockerfile에서 클라이언트 의존성 설치 확인
- `npm install`이 devDependencies를 포함하는지 확인

---

## 📝 변경 이력

### 이전 방식 (npm ci 기반):
- ❌ Root Directory: `server` 설정 필요
- ❌ Build Command: `npm ci && npm run build`
- ❌ EBUSY 오류 발생
- ❌ TypeScript 설치 문제

### 현재 방식 (Dockerfile 기반):
- ✅ 루트 디렉토리 사용 (Dockerfile 자동 감지)
- ✅ Dockerfile이 모든 빌드 단계 관리
- ✅ EBUSY 오류 없음
- ✅ TypeScript 항상 설치됨

---

## 🔗 관련 문서

- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [Railway 빌드 수정](../RAILWAY_BUILD_FIX.md)
- [백엔드 업로드 가이드](./BACKEND_UPLOAD_GUIDE.md)

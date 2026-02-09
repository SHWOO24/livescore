# 백엔드 디렉토리 구조 가이드

## 📁 프로젝트 구조

### 로컬 개발 환경

```
livescore/
├── client/              ← 프론트엔드 (백엔드 배포 시 불필요)
└── server/              ← 백엔드 (이 폴더를 배포)
    ├── src/            ← 소스 코드 (필수)
    │   ├── index.ts    ← 메인 진입점
    │   ├── providers/  ← 외부 API Provider
    │   │   ├── thesportsdb.ts
    │   │   └── espn.ts
    │   ├── routes/     ← API 라우터
    │   │   ├── auth.ts
    │   │   ├── scores.ts
    │   │   ├── livescore.ts
    │   │   └── ...
    │   ├── services/   ← 비즈니스 로직
    │   │   ├── cache.ts
    │   │   ├── lock.ts
    │   │   └── polling.ts
    │   ├── models/     ← 데이터 모델
    │   ├── middleware/  ← 미들웨어
    │   └── utils/      ← 유틸리티
    ├── package.json     ← 의존성 정보 (필수)
    ├── package-lock.json ← 의존성 버전 고정 (필수)
    ├── tsconfig.json    ← TypeScript 설정 (필수)
    ├── ecosystem.config.js ← PM2 설정 (VPS용)
    ├── .env.production.example ← 환경변수 예제
    ├── .gitignore       ← Git 제외 파일
    ├── node_modules/    ← 의존성 (업로드 안 함)
    ├── dist/            ← 빌드 결과물 (업로드 안 함)
    └── .env             ← 환경변수 (업로드 안 함)
```

---

## 🚀 배포 플랫폼별 디렉토리 구조

### Render/Railway/Fly.io (Git 기반)

**업로드**: GitHub에 `server/` 폴더 푸시

**플랫폼에서 인식하는 구조**:
```
server/                 ← Root Directory로 설정
├── src/               ← 소스 코드
│   ├── index.ts
│   └── ...
├── package.json        ← 빌드/실행 명령어 인식
├── tsconfig.json
└── (빌드 후)
    └── dist/          ← 플랫폼이 자동 생성
        └── index.js   ← 실행 파일
```

**설정**:
- Root Directory: `server`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start` (자동으로 `dist/index.js` 실행)

---

### VPS 서버 (수동 배포)

**업로드 위치**: `~/livescore-server/server/`

**서버 디렉토리 구조**:
```
/home/username/livescore-server/
└── server/             ← 업로드 위치
    ├── src/           ← 소스 코드 (업로드)
    │   ├── index.ts
    │   └── ...
    ├── package.json   ← 업로드
    ├── package-lock.json ← 업로드
    ├── tsconfig.json  ← 업로드
    ├── ecosystem.config.js ← 업로드
    ├── .env           ← 서버에서 생성 (업로드 안 함)
    ├── node_modules/  ← npm ci로 설치 (업로드 안 함)
    └── dist/          ← npm run build로 생성 (업로드 안 함)
        └── index.js   ← 실행 파일
```

**서버에서 실행**:
```bash
cd ~/livescore-server/server
npm ci              # 의존성 설치
npm run build       # TypeScript 빌드
pm2 start ecosystem.config.js --env production
```

---

## 📦 업로드 체크리스트

### ✅ 업로드해야 할 것

| 파일/폴더 | 설명 | 필수 여부 |
|----------|------|----------|
| `src/` | 소스 코드 폴더 전체 | ✅ 필수 |
| `package.json` | 의존성 정보 | ✅ 필수 |
| `package-lock.json` | 의존성 버전 고정 | ✅ 필수 |
| `tsconfig.json` | TypeScript 설정 | ✅ 필수 |
| `ecosystem.config.js` | PM2 설정 (VPS용) | VPS만 |
| `.env.production.example` | 환경변수 예제 | 선택 |

### ❌ 업로드하지 말아야 할 것

| 파일/폴더 | 이유 | 서버에서 처리 |
|----------|------|--------------|
| `node_modules/` | 용량 큼, 플랫폼별 다름 | `npm ci`로 설치 |
| `dist/` | 빌드 결과물 | `npm run build`로 생성 |
| `.env` | 보안 (민감 정보) | 환경변수로 설정 |
| `logs/` | 런타임 생성 파일 | PM2가 자동 생성 |

---

## 🔍 디렉토리 확인 방법

### 로컬에서 확인

```bash
cd server
ls -la

# 필수 파일 확인
ls -la src/index.ts package.json tsconfig.json

# 업로드할 파일 목록
find . -type f ! -path "./node_modules/*" ! -path "./dist/*" ! -name ".env"
```

### 서버에서 확인 (VPS)

```bash
cd ~/livescore-server/server

# 디렉토리 구조 확인
tree -L 2  # 또는 ls -R

# 필수 파일 확인
ls -la src/index.ts package.json tsconfig.json

# 빌드 확인
ls -la dist/index.js

# 실행 확인
pm2 status
```

### Render/Railway에서 확인

배포 로그에서 확인:
```
Building...
Installing dependencies...
Building application...
Starting application...
```

---

## 📝 배포 플랫폼별 요약

### Render

**업로드**: GitHub에 `server/` 폴더 푸시
**디렉토리 설정**: Root Directory = `server`
**빌드/실행**: 자동 처리

### Railway

**업로드**: GitHub에 `server/` 폴더 푸시
**디렉토리 설정**: Root Directory = `server`
**빌드/실행**: 자동 감지 또는 수동 설정

### Fly.io

**업로드**: GitHub에 `server/` 폴더 푸시
**디렉토리 설정**: `fly.toml`에서 설정
**빌드/실행**: Dockerfile 또는 자동 감지

### VPS

**업로드**: `~/livescore-server/server/` 디렉토리
**디렉토리 설정**: 수동으로 디렉토리 생성
**빌드/실행**: 수동으로 명령어 실행

---

## ⚠️ 주의사항

1. **Root Directory 설정**
   - Render/Railway: 반드시 `server`로 설정
   - 잘못 설정하면 빌드 실패

2. **파일 경로**
   - 모든 상대 경로는 `server/` 디렉토리를 기준으로 함
   - `src/index.ts`는 `server/src/index.ts`로 인식

3. **환경변수**
   - `.env` 파일은 업로드하지 않음
   - 플랫폼 환경변수로 설정

4. **의존성 설치**
   - `npm ci` 사용 권장 (package-lock.json 기반)
   - `npm install`은 버전 차이 발생 가능

---

## 🔗 관련 문서

- [백엔드 업로드 가이드](./BACKEND_UPLOAD_GUIDE.md)
- [Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [VPS 배포 가이드](./DEPLOY_BACKEND.md)

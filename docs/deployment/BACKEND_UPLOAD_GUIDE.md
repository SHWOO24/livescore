# 백엔드 업로드 및 디렉토리 설정 가이드

## 📦 업로드할 폴더/파일

### 방법 1: Render/Railway/Fly.io (Git 기반 배포) - 권장

**업로드할 폴더**: `server/` 폴더 전체

**업로드 방법**: GitHub에 푸시 (자동 배포)

```
livescore/
└── server/              ← 이 폴더를 GitHub에 푸시
    ├── src/            ← 소스 코드 (필수)
    ├── package.json    ← 의존성 정보 (필수)
    ├── package-lock.json ← 의존성 버전 고정 (필수)
    ├── tsconfig.json   ← TypeScript 설정 (필수)
    ├── ecosystem.config.js ← PM2 설정 (VPS용)
    ├── .env.production.example ← 환경변수 예제
    └── .gitignore      ← Git 제외 파일 목록
```

**업로드하지 말아야 할 것**:
- ❌ `node_modules/` - 서버에서 `npm install`로 설치
- ❌ `dist/` - 서버에서 `npm run build`로 생성
- ❌ `.env` - 서버에서 환경변수로 설정

---

### 방법 2: VPS 수동 업로드

**업로드할 폴더**: `server/` 폴더 내용

**업로드 방법**: FTP/SFTP로 업로드

```
업로드할 파일/폴더:
server/
├── src/                    ← 소스 코드 폴더 전체
│   ├── index.ts
│   ├── providers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── package.json            ← 필수
├── package-lock.json       ← 필수
├── tsconfig.json           ← 필수
├── ecosystem.config.js     ← PM2 설정 (필수)
└── .env.production.example ← 참고용
```

---

## 🖥️ 서버 디렉토리 설정

### Render/Railway/Fly.io 설정

#### Render 설정

1. **Render 대시보드 접속**
2. **새 Web Service 생성**
3. **중요 설정**:
   - **Root Directory**: (루트 디렉토리 사용, Dockerfile 기반)
   - **Builder**: Dockerfile (자동 감지)
   - **Start Command**: `npm start` (자동 감지)

**디렉토리 구조 (Render가 자동 처리)**:
```
Render 서버:
└── server/              ← Root Directory로 설정
    ├── src/            ← 소스 코드
    ├── package.json
    ├── tsconfig.json
    └── dist/            ← 빌드 후 생성됨
        └── index.js     ← 실행 파일
```

#### Railway 설정

1. **Railway 대시보드 접속**
2. **새 프로젝트 생성**
3. **중요 설정**:
   - **Root Directory**: (루트 디렉토리 사용, Dockerfile 기반)
   - **Builder**: Dockerfile (자동 감지 또는 railway.json 설정)
   - **Start Command**: `npm start` (자동 감지)

---

### VPS 서버 디렉토리 설정

#### 1단계: 서버 디렉토리 생성

```bash
# 홈 디렉토리에 프로젝트 폴더 생성
mkdir -p ~/livescore-server
cd ~/livescore-server
```

#### 2단계: 파일 업로드

**옵션 A: Git 사용 (권장)**

```bash
# Git 저장소 클론
git clone https://github.com/your-username/livescore.git .
cd server

# 또는 기존 저장소 업데이트
cd ~/livescore-server
git pull origin main
cd server
```

**옵션 B: FTP/SFTP 수동 업로드**

1. FTP/SFTP 클라이언트로 서버 접속
2. `~/livescore-server/server/` 디렉토리로 이동
3. 로컬의 `server/` 폴더 내용을 업로드:
   - `src/` 폴더 전체
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `ecosystem.config.js`

**최종 디렉토리 구조**:
```
~/livescore-server/
└── server/              ← 업로드 위치
    ├── src/            ← 소스 코드
    │   ├── index.ts
    │   ├── providers/
    │   ├── routes/
    │   ├── services/
    │   ├── models/
    │   ├── middleware/
    │   └── utils/
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── ecosystem.config.js
    ├── .env            ← 서버에서 생성 (업로드 안 함)
    ├── node_modules/   ← 서버에서 설치 (업로드 안 함)
    └── dist/           ← 서버에서 빌드 (업로드 안 함)
        └── index.js
```

#### 3단계: 의존성 설치 및 빌드

```bash
cd ~/livescore-server/server

# 의존성 설치 (npm ci 대신 npm install 사용)
npm install

# TypeScript 빌드
npm run build

# 빌드 확인
ls -la dist/
# dist/index.js 파일이 생성되어야 함
```

#### 4단계: 환경변수 설정

```bash
cd ~/livescore-server/server

# 환경변수 파일 생성
cp .env.production.example .env
nano .env  # 또는 vi .env
```

`.env` 파일 내용:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-generated-secret-key
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/livescore
THESPORTSDB_API_KEY=123
PRIMARY_POLL_INTERVAL_SECONDS=30
SECONDARY_POLL_INTERVAL_SECONDS=90
CACHE_TTL_SECONDS=30
```

#### 5단계: PM2로 실행

```bash
cd ~/livescore-server/server

# PM2로 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status

# 로그 확인
pm2 logs livescore-api

# 자동 시작 설정
pm2 save
pm2 startup
```

---

## 📋 체크리스트

### Render/Railway 배포 전

- [ ] GitHub에 `server/` 폴더가 포함되어 있는지 확인
- [ ] `server/package.json` 파일 확인
- [ ] `server/src/index.ts` 파일 확인
- [ ] `.gitignore`에 `node_modules/`, `dist/`, `.env`가 제외되어 있는지 확인

### Render 배포 시

- [ ] Dockerfile이 루트에 있는지 확인
- [ ] Builder: Dockerfile 설정 확인 (또는 자동 감지)
- [ ] Start Command: `npm start` 설정 확인
- [ ] 모든 필수 환경변수 설정 확인

### VPS 배포 시

- [ ] `~/livescore-server/server/` 디렉토리 생성 확인
- [ ] `src/` 폴더 업로드 확인
- [ ] `package.json` 업로드 확인
- [ ] `npm install` 실행 성공 확인
- [ ] `npm run build` 실행 성공 확인
- [ ] `dist/index.js` 파일 생성 확인
- [ ] `.env` 파일 생성 및 설정 확인
- [ ] PM2 실행 확인

---

## 🔍 디렉토리 구조 확인 명령어

### Render/Railway

배포 후 로그에서 확인:
```
Building...
Installing dependencies...
Building application...
Starting application...
```

### VPS

```bash
# 디렉토리 구조 확인
cd ~/livescore-server/server
tree -L 2  # 또는 ls -R

# 빌드 확인
ls -la dist/

# 실행 파일 확인
file dist/index.js

# PM2 상태 확인
pm2 status
pm2 logs livescore-api
```

---

## ⚠️ 주의사항

### 업로드하지 말아야 할 것

1. **`node_modules/`**
   - 용량이 크고 플랫폼별로 다를 수 있음
   - 서버에서 `npm ci`로 설치

2. **`dist/`**
   - 빌드 결과물
   - 서버에서 `npm run build`로 생성

3. **`.env`**
   - 보안상 민감한 정보 포함
   - 서버에서 직접 생성 (환경변수로 설정)

4. **`logs/`**
   - 런타임 생성 파일
   - PM2가 자동 생성

### 업로드해야 할 것

1. **`src/` 폴더 전체** - 소스 코드
2. **`package.json`** - 의존성 정보
3. **`package-lock.json`** - 의존성 버전 고정
4. **`tsconfig.json`** - TypeScript 설정
5. **`ecosystem.config.js`** - PM2 설정 (VPS용)

---

## 🚀 빠른 배포 명령어

### Render/Railway (Git 기반, Dockerfile 사용)

```bash
# 로컬에서 (루트 디렉토리에서)
git add .
git commit -m "Deploy backend"
git push origin main

# Render/Railway가 Dockerfile을 자동으로 감지하여 배포
```

### VPS (수동)

```bash
# 서버에서
cd ~/livescore-server/server
git pull origin main  # 또는 파일 업로드
npm install  # npm ci 대신 npm install 사용
npm run build
pm2 restart livescore-api
```

---

## 📝 요약

### Render/Railway (Dockerfile 기반)
- **업로드**: GitHub에 전체 레포 푸시 (Dockerfile 포함)
- **디렉토리 설정**: 루트 디렉토리 사용 (Dockerfile 자동 감지)
- **빌드/실행**: Dockerfile 기반으로 플랫폼이 자동 처리

### VPS
- **업로드**: `~/livescore-server/server/` 디렉토리
- **디렉토리 구조**: `server/src/`, `server/package.json` 등
- **빌드/실행**: 수동으로 `npm ci`, `npm run build`, `pm2 start`

---

## 🔗 관련 문서

- [Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [VPS 배포 가이드](./DEPLOY_BACKEND.md)

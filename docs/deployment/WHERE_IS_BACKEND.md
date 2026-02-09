# 백엔드 서버 위치

## 📍 현재 프로젝트 구조

```
livescore/
├── server/          ← 백엔드 서버 소스 코드 (로컬)
│   ├── src/        ← 서버 소스 코드
│   ├── package.json
│   └── ...
└── client/         ← 프론트엔드
```

---

## 🖥️ 백엔드 서버 배포 위치

### 로컬 개발 환경 (Windows)

**위치**: `F:\Cursor\livescore\server\`

**실행 방법**:
```bash
cd server
npm run dev
```

**접속 주소**: http://localhost:5000

---

### 운영 서버 (VPS/Linux)

**위치**: `~/livescore-server/server/` (또는 설정한 경로)

**서버 접속 방법**:
```bash
# SSH로 서버 접속
ssh username@your-server-ip

# 서버에서 프로젝트 위치 확인
cd ~/livescore-server/server
pwd  # 현재 경로 확인
```

**실행 방법**:
```bash
cd ~/livescore-server/server
npm ci
npm run build
pm2 start ecosystem.config.js --env production
```

---

## 📂 백엔드 서버 파일 구조

```
server/
├── src/                    # 소스 코드
│   ├── index.ts           # 서버 진입점
│   ├── models/            # 데이터베이스 모델
│   ├── routes/            # API 라우트
│   ├── middleware/        # 미들웨어
│   └── utils/             # 유틸리티
├── package.json           # 의존성 정보
├── tsconfig.json          # TypeScript 설정
├── ecosystem.config.js    # PM2 설정
└── .env                   # 환경변수 (서버에서 생성)
```

---

## 🔍 서버 위치 확인 방법

### 로컬에서 확인

```bash
# 프로젝트 루트에서
cd server
pwd  # Windows: 현재 경로 확인
```

### 서버에서 확인

```bash
# SSH로 서버 접속 후
cd ~/livescore-server/server
pwd  # 서버 경로 확인
ls -la  # 파일 목록 확인
```

---

## 🚀 서버 실행 위치

### 개발 환경 (로컬)

**위치**: `F:\Cursor\livescore\server\`

**실행**:
```bash
cd server
npm run dev
```

### 운영 환경 (서버)

**위치**: `~/livescore-server/server/` (또는 설정한 경로)

**실행**:
```bash
cd ~/livescore-server/server
pm2 start ecosystem.config.js --env production
```

---

## 📝 요약

| 환경 | 위치 | 실행 방법 |
|------|------|----------|
| **로컬 개발** | `F:\Cursor\livescore\server\` | `npm run dev` |
| **운영 서버** | `~/livescore-server/server/` | `pm2 start ecosystem.config.js` |

**현재 로컬 개발 중이시라면**: `F:\Cursor\livescore\server\` 디렉토리가 백엔드 서버입니다.

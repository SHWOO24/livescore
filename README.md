# 라이브스코어 사이트

실시간 스포츠 스코어 및 경기 정보를 제공하는 웹 애플리케이션입니다.

## 주요 기능

- ⚽ 실시간 라이브 스코어 및 미래 경기 정보
- 📧 이메일 회원가입 및 인증
- 🔐 로그인/로그아웃 기능
- 💬 실시간 라이브 채팅
- 📱 모바일 최적화
- 🎨 우수한 애니메이션 및 가독성
- 🎯 협찬사 배너 광고 영역

## 기술 스택

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion (애니메이션)
- Socket.io Client (실시간 채팅)

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- Socket.io (실시간 통신)
- JWT (인증)
- Nodemailer (이메일 인증)

## 설치 및 실행

### 1. 전체 의존성 설치
```bash
npm run install:all
```

### 2. 환경 변수 설정

`server/.env` 파일 생성:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/livescore
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### 3. 개발 서버 실행

#### 로컬 개발 (Windows/Mac)
```bash
npm run dev
```

또는 따로 실행:
```bash
# 터미널 1: 백엔드
cd server
npm run dev

# 터미널 2: 프론트엔드
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

#### 서버 배포 (Linux/VPS)
```bash
cd server
npm ci
npm run build
pm2 start ecosystem.config.js --env production
```

⚠️ **주의**: PM2는 서버(Linux/VPS)에서만 사용합니다. 로컬 개발에는 `npm run dev`를 사용하세요.

## 프로젝트 구조

```
livescore/
├── client/          # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
├── server/          # Express 백엔드
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   ├── utils/
│   │   └── index.ts
│   └── package.json
├── docs/            # 문서
│   ├── deployment/  # 배포 관련 문서
│   ├── guides/      # 가이드 문서
│   └── archive/     # 아카이브 문서
└── package.json
```

## 문서

### 빠른 시작
- [빠른 시작 가이드](./docs/guides/QUICK_START.md) - 프로젝트 시작하기
- [로컬 개발 환경](./docs/guides/LOCAL_DEVELOPMENT.md) - 로컬 개발 설정

### 배포
- [배포 가이드](./docs/deployment/DEPLOYMENT.md) - 전체 배포 가이드
- [Railway 배포](./docs/deployment/BACKEND_DEPLOY_RAILWAY.md) - Railway 배포 방법
- [Render 배포](./docs/deployment/BACKEND_DEPLOY_RENDER.md) - Render 배포 방법
- [Fly.io 배포](./docs/deployment/BACKEND_DEPLOY_FLY.md) - Fly.io 배포 방법
- [배포 체크리스트](./docs/deployment/DEPLOYMENT_CHECKLIST.md) - 배포 전 체크리스트

### 가이드
- [테스트 가이드](./docs/guides/TESTING_GUIDE.md) - 테스트 방법
- [문제 해결](./docs/guides/TROUBLESHOOTING.md) - 문제 해결 가이드
- [환경변수 가이드](./docs/guides/ENV_FILES_GUIDE.md) - 환경변수 설정
- [SSH 접근 가이드](./docs/guides/SSH_ACCESS_GUIDE.md) - SSH 접근 방법

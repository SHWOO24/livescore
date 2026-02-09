# 로컬 개발 환경 가이드

## ⚠️ 중요: PM2는 서버(VPS)에서만 사용

**PM2는 Linux/서버 환경에서 사용하는 프로세스 관리자입니다.**

- ❌ Windows 로컬에서는 PM2 사용 불가 (또는 설치 복잡)
- ✅ 로컬 개발: `npm run dev` 사용
- ✅ 서버 배포: SSH로 서버 접속 후 PM2 사용

---

## 로컬 개발 환경 (Windows)

### 백엔드 서버 실행

```bash
# 서버 디렉토리로 이동
cd server

# 개발 모드 실행 (자동 재컴파일)
npm run dev
```

이 명령어는:
- TypeScript를 자동으로 컴파일
- 파일 변경 시 자동 재시작
- `http://localhost:5000`에서 실행

### 프론트엔드 실행

```bash
# 새 터미널에서
cd client

# 개발 서버 실행
npm run dev
```

이 명령어는:
- Vite 개발 서버 실행
- `http://localhost:3000`에서 실행
- 파일 변경 시 자동 새로고침

### 동시 실행

```bash
# 프로젝트 루트에서
npm run dev
```

이 명령어는 백엔드와 프론트엔드를 동시에 실행합니다.

---

## 서버 배포 (VPS/Linux)

### PM2 사용 (서버에서만)

서버에 SSH로 접속한 후:

```bash
# 서버에 접속
ssh username@your-server-ip

# 서버에서 실행
cd ~/livescore-server/server
npm ci
npm run build
pm2 start ecosystem.config.js --env production
```

---

## Windows에서 PM2 사용하려면

**권장하지 않지만**, Windows에서도 PM2를 설치할 수 있습니다:

```bash
# 전역 설치
npm install -g pm2

# Windows 서비스로 설치 (관리자 권한 필요)
pm2 startup
```

하지만 **로컬 개발에는 `npm run dev`를 사용하는 것이 더 간단**합니다.

---

## 문제 해결

### "pm2가 인식되지 않습니다" 오류

**원인**: Windows 로컬 환경에서 PM2가 설치되지 않음

**해결**:
1. **로컬 개발**: `npm run dev` 사용 (권장)
2. **서버 배포**: SSH로 서버 접속 후 PM2 사용

### 로컬에서 서버 테스트

```bash
# 터미널 1: 백엔드
cd server
npm run dev

# 터미널 2: 프론트엔드
cd client
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 요약

| 환경 | 실행 방법 |
|------|----------|
| **로컬 개발 (Windows)** | `npm run dev` |
| **서버 배포 (Linux/VPS)** | `pm2 start ecosystem.config.js` |

**현재 상황**: Windows 로컬에서 개발 중이시라면 `npm run dev`를 사용하세요!

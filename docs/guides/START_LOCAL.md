# 로컬 개발 서버 시작하기

## 빠른 시작

### 방법 1: 한 번에 실행 (권장)

```bash
# 프로젝트 루트에서
npm run dev
```

이 명령어는 백엔드와 프론트엔드를 동시에 실행합니다.

### 방법 2: 따로 실행

**터미널 1 - 백엔드:**
```bash
cd server
npm run dev
```

**터미널 2 - 프론트엔드:**
```bash
cd client
npm run dev
```

---

## 접속 주소

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000
- **헬스체크**: http://localhost:5000/api/health

---

## 확인 사항

### 백엔드가 실행 중인지 확인

브라우저에서:
```
http://localhost:5000/api/health
```

응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 프론트엔드가 실행 중인지 확인

브라우저에서:
```
http://localhost:3000
```

---

## 문제 해결

### 포트가 이미 사용 중

```bash
# 포트 5000 사용 중인 프로세스 확인 (Windows)
netstat -ano | findstr :5000

# 포트 3000 사용 중인 프로세스 확인
netstat -ano | findstr :3000
```

### MongoDB 연결 실패

로컬 MongoDB가 실행 중인지 확인:
- MongoDB 서비스가 실행 중인지
- 또는 MongoDB Atlas 연결 문자열 확인

---

## ⚠️ PM2는 서버에서만!

**Windows 로컬에서는 PM2를 사용하지 마세요!**

- 로컬 개발: `npm run dev` ✅
- 서버 배포: PM2 사용 ✅

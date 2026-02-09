# SSH 접속 빠른 가이드

## 🚀 빠른 시작

### 1. SSH 접속 정보 확인

호스팅 서비스에서:
- SSH 호스트 (IP 또는 도메인)
- SSH 포트 (보통 22)
- 사용자명
- 비밀번호 (또는 SSH 키)

### 2. SSH 접속

**Windows PowerShell**:
```powershell
ssh username@your-server-ip
```

**비밀번호 입력 후 접속**

### 3. 백엔드 서버 실행

```bash
# 서버 디렉토리로 이동
cd ~/livescore-server/server

# PM2 상태 확인
pm2 status

# 서버 실행 (실행 중이 아니면)
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status
pm2 logs livescore-api --lines 20
```

### 4. 헬스체크

```bash
curl http://localhost:5000/api/health
```

**응답 확인**:
```json
{"status":"ok","message":"Server is running"}
```

---

## ✅ 완료!

백엔드 서버가 실행되면 프론트엔드에서 경기 정보가 표시됩니다!

---

## 🔧 문제 해결

### SSH 접속 실패
- 비밀번호 확인
- SSH 키 확인
- 호스팅 서비스에서 SSH 활성화 확인

### 서버 실행 실패
- `npm ci` 실행 확인
- `npm run build` 실행 확인
- `.env` 파일 확인

# SSH 접속 가이드

## 🔐 SSH 접속 방법

### 1. SSH 키 설정 (선택사항)

#### SSH 키가 있는 경우

1. "Manage SSH Keys" 버튼 클릭
2. 기존 SSH 키 확인 또는 새로 생성
3. Public Key를 서버에 등록

#### SSH 키가 없는 경우

**Windows에서 SSH 키 생성**:
```bash
# PowerShell 또는 Git Bash에서
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 키가 생성되면
cat ~/.ssh/id_rsa.pub
# 이 내용을 "Manage SSH Keys"에서 등록
```

---

### 2. SSH 접속 정보 확인

호스팅 서비스에서 다음 정보를 확인하세요:

- **SSH 호스트**: `your-server-ip` 또는 `your-domain.com`
- **SSH 포트**: 보통 `22` (또는 호스팅 서비스에서 제공하는 포트)
- **사용자명**: 호스팅 계정 사용자명
- **비밀번호**: 호스팅 계정 비밀번호 (또는 SSH 키 사용)

---

### 3. SSH 접속

#### Windows에서 SSH 접속

**방법 1: PowerShell 사용**

```powershell
# SSH 접속
ssh username@your-server-ip

# 또는 포트 지정
ssh -p 22 username@your-server-ip
```

**방법 2: PuTTY 사용**

1. PuTTY 다운로드 및 설치
2. Host Name: `your-server-ip`
3. Port: `22` (또는 호스팅 서비스에서 제공하는 포트)
4. Connection type: SSH
5. Open 클릭
6. 사용자명과 비밀번호 입력

**방법 3: VS Code Remote-SSH 확장**

1. VS Code에서 "Remote-SSH" 확장 설치
2. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. SSH 접속 정보 입력

---

### 4. 서버 접속 후 백엔드 실행

SSH 접속이 성공하면:

```bash
# 현재 위치 확인
pwd

# 홈 디렉토리로 이동
cd ~

# 프로젝트 디렉토리 확인
ls -la

# 서버 디렉토리로 이동
cd ~/livescore-server/server
# 또는 압축 해제한 위치
cd ~/livescore-server-upload/server

# PM2 상태 확인
pm2 status

# 서버가 실행 중이 아니면
npm ci
npm run build
pm2 start ecosystem.config.js --env production

# 로그 확인
pm2 logs livescore-api --lines 20
```

---

## 🔍 SSH 접속 문제 해결

### 문제 1: "Permission denied"

**원인**: 비밀번호 오류 또는 SSH 키 문제

**해결**:
- 비밀번호 확인
- SSH 키가 올바르게 등록되었는지 확인
- "Manage SSH Keys"에서 Public Key 확인

### 문제 2: "Connection refused"

**원인**: SSH 서비스가 비활성화되어 있음

**해결**:
- 호스팅 서비스에서 SSH 활성화 확인
- 포트 번호 확인

### 문제 3: "Host key verification failed"

**원인**: 서버 키가 변경됨

**해결**:
```bash
# Windows에서
ssh-keygen -R your-server-ip
```

---

## 📝 빠른 체크리스트

### SSH 접속 전
- [ ] 호스팅 서비스에서 SSH 활성화 확인
- [ ] SSH 접속 정보 확인 (호스트, 포트, 사용자명)
- [ ] SSH 키 생성 및 등록 (선택사항)

### SSH 접속 후
- [ ] 서버 디렉토리 확인 (`cd ~/livescore-server/server`)
- [ ] PM2 상태 확인 (`pm2 status`)
- [ ] 서버 실행 (`pm2 start ecosystem.config.js --env production`)
- [ ] 헬스체크 (`curl http://localhost:5000/api/health`)

---

## 🚀 빠른 명령어

### SSH 접속

```bash
ssh username@your-server-ip
```

### 서버 실행

```bash
cd ~/livescore-server/server
pm2 start ecosystem.config.js --env production
pm2 status
```

---

## 요약

1. **SSH 접속**: `ssh username@your-server-ip`
2. **서버 디렉토리로 이동**: `cd ~/livescore-server/server`
3. **서버 실행**: `pm2 start ecosystem.config.js --env production`
4. **상태 확인**: `pm2 status`

SSH 접속이 성공하면 백엔드 서버를 실행할 수 있습니다!

# 백엔드 서버 연결 오류 해결

## 🚨 현재 문제

**오류 메시지**: "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."

**원인**: 백엔드 서버가 실행되지 않았거나 연결할 수 없음

---

## ✅ 해결 방법

### 1. 백엔드 서버 실행 확인

#### 서버에 SSH 접속

```bash
ssh username@your-server-ip
```

#### 서버 상태 확인

```bash
# PM2 상태 확인
pm2 status

# 서버가 실행 중이 아니면
cd ~/livescore-server/server
pm2 start ecosystem.config.js --env production
```

#### 헬스체크

```bash
# 서버에서 직접 확인
curl http://localhost:5000/api/health

# 응답이 있어야 함:
# {"status":"ok","message":"Server is running"}
```

---

### 2. 프론트엔드 API URL 확인

프론트엔드가 올바른 백엔드 URL을 사용하는지 확인:

#### Namecheap에 업로드한 프론트엔드 확인

프론트엔드 빌드 시 환경변수가 포함되었는지 확인:

```bash
# 로컬에서 다시 빌드 (환경변수 확인)
cd client
cat .env.production

# 다음이 설정되어 있어야 함:
# VITE_API_BASE_URL=https://api.yourdomain.com
# VITE_SOCKET_URL=https://api.yourdomain.com
```

#### 환경변수 확인 후 재빌드

```bash
cd client
npm run build
npm run deploy:prepare

# deploy/static/ 내용을 다시 public_html에 업로드
```

---

### 3. 백엔드 서버 실행 단계

압축 해제 후 서버를 실행하지 않았다면:

```bash
# 서버에 SSH 접속
ssh username@your-server-ip

# 압축 해제한 위치로 이동
cd ~/livescore-server-upload/server
# 또는
cd ~/livescore-server/server

# 의존성 설치
npm ci

# 빌드
npm run build

# 환경변수 확인
cat .env
# 없으면 생성
cp .env.production.example .env
nano .env

# PM2 실행
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status
pm2 logs livescore-api --lines 50
```

---

### 4. 네트워크 및 방화벽 확인

#### 포트 확인

```bash
# 서버에서 포트 5000이 열려있는지 확인
netstat -tuln | grep 5000
# 또는
ss -tuln | grep 5000
```

#### 방화벽 확인

```bash
# UFW 사용 시
sudo ufw status
sudo ufw allow 5000

# 또는 iptables
sudo iptables -L -n
```

---

### 5. CORS 설정 확인

백엔드 서버의 `.env` 파일에서:

```env
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
```

프론트엔드 도메인이 CORS에 포함되어 있는지 확인.

---

## 🔍 문제 진단 체크리스트

### 백엔드 서버
- [ ] 서버에 SSH 접속 가능한가?
- [ ] `pm2 status`에서 서버가 실행 중인가?
- [ ] `curl http://localhost:5000/api/health`가 응답하는가?
- [ ] `.env` 파일이 올바르게 설정되어 있는가?
- [ ] MongoDB가 연결되어 있는가?

### 프론트엔드
- [ ] 브라우저 콘솔(F12)에서 오류 메시지 확인
- [ ] Network 탭에서 API 호출이 실패하는지 확인
- [ ] 프론트엔드 빌드 시 환경변수가 포함되었는가?

### 네트워크
- [ ] 백엔드 서버 포트(5000)가 열려있는가?
- [ ] 방화벽이 포트를 차단하지 않는가?
- [ ] Nginx가 올바르게 설정되어 있는가?

---

## 🚀 빠른 해결 (서버 실행)

```bash
# 서버에 SSH 접속
ssh username@your-server-ip

# 서버 디렉토리로 이동
cd ~/livescore-server/server

# 서버 실행 (이미 배포했다면)
pm2 restart livescore-api

# 또는 처음 실행
pm2 start ecosystem.config.js --env production

# 로그 확인
pm2 logs livescore-api --lines 20
```

---

## 📝 요약

**문제**: 백엔드 서버가 실행되지 않음

**해결**:
1. 서버에 SSH 접속
2. `cd ~/livescore-server/server`
3. `pm2 start ecosystem.config.js --env production`
4. `pm2 status`로 확인

백엔드 서버가 실행되면 프론트엔드에서 경기 정보가 표시됩니다!

# 문제 해결 가이드

## 🔍 Health Check

### 백엔드 Health Check

```bash
# 로컬
curl http://localhost:5000/api/health

# 프로덕션
curl https://your-backend-url.com/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

**문제 해결**:
- 404: 라우터 설정 확인
- 500: 서버 로그 확인
- 연결 실패: 서버 실행 상태 확인

---

## 🌐 CORS 체크

### CORS 오류 확인

브라우저 개발자 도구 → Console에서 확인:
```
Access to XMLHttpRequest at 'https://api.example.com/api/...' from origin 'https://scorelivenow.com' has been blocked by CORS policy
```

### 해결 방법

1. **백엔드 환경변수 확인**:
   ```env
   CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
   ```

2. **프론트엔드 도메인 확인**:
   - 백엔드 `CORS_ORIGIN`에 정확한 도메인 포함 확인
   - 프로토콜(`https://`) 포함 확인
   - 쉼표로 구분 확인

3. **백엔드 재시작**:
   - 환경변수 변경 후 서버 재시작 필요

---

## 🔌 Socket 체크

### Socket.io 연결 확인

브라우저 개발자 도구 → Console에서 확인:

**정상 연결**:
```
✅ Socket 연결됨
```

**연결 실패**:
```
❌ Socket 연결 해제됨
⚠️ Socket.io 연결 비활성화: 로컬 환경 또는 URL이 설정되지 않음
```

### 해결 방법

1. **환경변수 확인**:
   ```env
   VITE_SOCKET_URL=https://your-backend-url.com
   # 또는
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

2. **백엔드 Socket.io 설정 확인**:
   - Socket.io 서버가 실행 중인지 확인
   - CORS 설정 확인

3. **프론트엔드 재빌드**:
   - 환경변수 변경 후 재빌드 필요

4. **REST Fallback 확인**:
   - Socket 연결 실패 시 자동으로 REST 폴링으로 전환됨
   - 연결 모드 표시에서 "🟡 폴링 (REST)" 확인

---

## 📡 API 연결 문제

### API 호출 실패

브라우저 개발자 도구 → Network 탭에서 확인:

**404 오류**:
- 백엔드 서버가 실행 중인지 확인
- API URL이 올바른지 확인

**CORS 오류**:
- 위의 CORS 체크 참조

**타임아웃**:
- 백엔드 서버 응답 시간 확인
- 네트워크 연결 확인

### 해결 방법

1. **백엔드 Health Check**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **프론트엔드 환경변수 확인**:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

3. **API 엔드포인트 확인**:
   - `/api/livescore?sport=Soccer` 형식 확인
   - 쿼리 파라미터 확인

---

## 🗄️ MongoDB 연결 문제

### MongoDB 연결 실패

백엔드 로그에서 확인:
```
❌ MongoDB 연결 실패: ...
```

### 해결 방법

1. **연결 문자열 확인**:
   ```env
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/livescore
   ```

2. **MongoDB Atlas 설정 확인**:
   - Network Access에서 IP 허용 확인
   - Database Access에서 사용자 권한 확인

3. **연결 문자열 형식 확인**:
   - `<password>`를 실제 비밀번호로 변경
   - `<dbname>`을 `livescore`로 변경

---

## 🔄 실시간 업데이트 문제

### Socket.io 업데이트가 안 됨

1. **연결 상태 확인**:
   - 브라우저 콘솔에서 연결 상태 확인
   - 연결 모드 표시 확인

2. **이벤트 구독 확인**:
   - `subscribe` 이벤트가 전송되었는지 확인
   - 백엔드 로그에서 구독 확인

3. **REST Fallback 확인**:
   - Socket 실패 시 REST 폴링으로 자동 전환
   - 30초마다 자동 업데이트

---

## 🚀 배포 문제

### Render 배포 실패

1. **로그 확인**:
   - Render 대시보드 → Logs 탭
   - 빌드 오류 확인

2. **Root Directory 확인**:
   - Root Directory: `server` 설정 확인

3. **환경변수 확인**:
   - 모든 필수 환경변수 설정 확인

### Namecheap 업로드 문제

1. **파일 권한 확인**:
   - 파일: 644
   - 폴더: 755

2. **.htaccess 확인**:
   - 파일이 업로드되었는지 확인
   - 내용이 올바른지 확인

---

## 📝 일반적인 문제

### 페이지가 하얗게 표시됨

1. **JavaScript 오류 확인**:
   - 브라우저 개발자 도구 → Console
   - 오류 메시지 확인

2. **파일 경로 확인**:
   - `index.html`에서 `assets/` 경로 확인
   - 파일이 업로드되었는지 확인

### 데이터가 표시되지 않음

1. **백엔드 연결 확인**:
   - Health Check 확인
   - API 호출 확인

2. **캐시 확인**:
   - 브라우저 캐시 삭제
   - 강력 새로고침 (`Ctrl+Shift+R`)

---

## 🔗 유용한 명령어

### 백엔드 확인

```bash
# Health Check
curl https://your-backend-url.com/api/health

# 라이브스코어 조회
curl "https://your-backend-url.com/api/livescore?sport=Soccer"

# 스포츠 목록
curl https://your-backend-url.com/api/sports
```

### 프론트엔드 확인

```bash
# 빌드 확인
cd client
npm run build

# 빌드 결과 확인
ls -la dist/
```

---

## 📞 추가 도움

문제가 해결되지 않으면:
1. 브라우저 개발자 도구 → Console/Network 탭 확인
2. 백엔드 로그 확인
3. 환경변수 설정 확인
4. 문서 재확인

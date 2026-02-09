# 테스트 가이드

## 로컬 테스트

### 백엔드 서버 테스트

#### 1. 환경변수 설정

`server/.env` 파일 생성:

```env
PORT=5000
JWT_SECRET=test-secret-key
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/livescore
THESPORTSDB_API_KEY=123
CACHE_TTL_SECONDS=30
POLL_INTERVAL_SECONDS=30
DEFAULT_SPORTS=Soccer,Basketball,American Football,Baseball,Ice Hockey,Cricket,Tennis,Fighting,Motorsport,Volleyball
NODE_ENV=development
```

#### 2. 서버 실행

```bash
cd server
npm install
npm run dev
```

서버가 `http://localhost:5000`에서 실행됩니다.

#### 3. 헬스체크 테스트

```bash
curl http://localhost:5000/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### 4. 스포츠 목록 테스트

```bash
curl http://localhost:5000/api/sports
```

예상 응답:
```json
{
  "sports": ["Soccer", "Basketball", "American Football", ...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 5. 스코어 조회 테스트

```bash
# 특정 스포츠 스코어
curl "http://localhost:5000/api/scores/Soccer"

# 모든 스포츠 스코어
curl "http://localhost:5000/api/scores"

# 특정 날짜 스코어
curl "http://localhost:5000/api/scores/Soccer?date=2024-01-01"
```

예상 응답:
```json
{
  "sport": "Soccer",
  "date": "2024-01-01",
  "events": [
    {
      "sport": "Soccer",
      "eventId": "12345",
      "league": "Premier League",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "homeScore": 2,
      "awayScore": 1,
      "status": "live",
      "startTime": "2024-01-01T15:00:00.000Z",
      "lastUpdated": "2024-01-01T16:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 프론트엔드 테스트

#### 1. 환경변수 설정

`client/.env.local` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

#### 2. 프론트엔드 실행

```bash
cd client
npm install
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

#### 3. 브라우저에서 확인

1. `http://localhost:3000` 접속
2. 스포츠 탭이 정상적으로 표시되는지 확인
3. 스코어 데이터가 로드되는지 확인
4. Socket.io 연결 상태 확인 (브라우저 콘솔)

---

## 운영 테스트

### 백엔드 서버 테스트

#### 1. 헬스체크

```bash
curl https://your-backend-server-url.com/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### 2. 스포츠 목록

```bash
curl https://your-backend-server-url.com/api/sports
```

#### 3. 스코어 조회

```bash
curl "https://your-backend-server-url.com/api/scores/Soccer"
```

### 프론트엔드 테스트

#### 1. 환경변수 설정

`client/.env.production` 파일 생성:

```env
VITE_API_BASE_URL=https://your-backend-server-url.com
VITE_SOCKET_URL=https://your-backend-server-url.com
```

#### 2. 빌드 및 배포

```bash
cd client
npm run deploy:prepare
# deploy/static/ 내용을 public_html에 업로드
```

#### 3. 브라우저에서 확인

1. `https://scorelivenow.com` 접속
2. 스포츠 탭이 정상적으로 표시되는지 확인
3. 스코어 데이터가 로드되는지 확인
4. Socket.io 연결 상태 확인 (브라우저 콘솔)
5. 실시간 업데이트 확인 (30초마다 자동 업데이트)

---

## API 엔드포인트 테스트

### 인증 API

#### 회원가입

```bash
curl -X POST https://your-backend-server-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### 로그인

```bash
curl -X POST https://your-backend-server-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 사용자 정보 조회

```bash
curl https://your-backend-server-url.com/api/auth/me \
  -H "Cookie: token=your-jwt-token"
```

### 스코어 API

#### 모든 스포츠 스코어

```bash
curl "https://your-backend-server-url.com/api/scores"
```

#### 특정 스포츠 스코어

```bash
curl "https://your-backend-server-url.com/api/scores/Soccer"
```

#### 특정 날짜 스코어

```bash
curl "https://your-backend-server-url.com/api/scores/Soccer?date=2024-01-01"
```

---

## Socket.io 테스트

### 연결 테스트

브라우저 콘솔에서:

```javascript
const socket = io('https://your-backend-server-url.com', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Socket 연결됨');
  
  // 스코어 구독
  socket.emit('subscribe', { sport: 'Soccer', date: '2024-01-01' });
});

socket.on('scores:update', (data) => {
  console.log('스코어 업데이트:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Socket 연결 해제됨');
});
```

---

## 문제 해결

### 백엔드 서버가 응답하지 않음

1. 서버가 실행 중인지 확인
2. 포트가 올바르게 설정되었는지 확인
3. 방화벽 설정 확인
4. 로그 확인

### API 호출 실패

1. CORS 설정 확인
2. 환경변수 확인
3. 네트워크 연결 확인
4. 브라우저 콘솔에서 에러 확인

### Socket.io 연결 실패

1. CORS 설정 확인
2. WebSocket 지원 확인
3. 방화벽/프록시 설정 확인
4. 브라우저 콘솔에서 에러 확인

### 스코어 데이터가 없음

1. TheSportsDB API 키 확인
2. 폴링 서비스가 실행 중인지 확인
3. 캐시 상태 확인
4. 로그에서 API 호출 오류 확인

---

## 체크리스트

### 로컬 테스트

- [ ] 백엔드 서버 실행 성공
- [ ] 헬스체크 통과
- [ ] 스포츠 목록 API 작동
- [ ] 스코어 조회 API 작동
- [ ] 프론트엔드 실행 성공
- [ ] Socket.io 연결 성공
- [ ] 실시간 업데이트 작동

### 운영 테스트

- [ ] 백엔드 서버 배포 성공
- [ ] 헬스체크 통과
- [ ] 모든 API 엔드포인트 작동
- [ ] 프론트엔드 배포 성공
- [ ] Socket.io 연결 성공
- [ ] 실시간 업데이트 작동
- [ ] 모든 스포츠 탭 정상 작동

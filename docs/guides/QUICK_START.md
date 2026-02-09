# 빠른 시작 가이드

## 경기 정보가 표시되지 않는 경우

### 1. 백엔드 서버 실행 확인

경기 정보를 보려면 **백엔드 서버가 실행 중**이어야 합니다.

#### 백엔드 서버 실행 방법:

```bash
# 1. MongoDB가 실행 중인지 확인
# (로컬 MongoDB 사용 시)

# 2. 서버 디렉토리로 이동
cd server

# 3. 환경 변수 설정 (선택사항)
# .env 파일이 없으면 기본값 사용 (localhost:5000, localhost MongoDB)

# 4. 서버 실행
npm run dev
```

서버가 정상 실행되면:
- `✅ MongoDB 연결 성공`
- `🚀 서버가 포트 5000에서 실행 중입니다`
- 샘플 경기 데이터가 자동으로 생성됩니다

### 2. 프론트엔드 실행

새 터미널에서:

```bash
# 클라이언트 디렉토리로 이동
cd client

# 프론트엔드 실행
npm run dev
```

### 3. 확인 사항

1. **브라우저 콘솔 확인** (F12)
   - API 호출 오류가 있는지 확인
   - `경기 로드 실패` 메시지 확인

2. **백엔드 서버 상태 확인**
   - http://localhost:5000/api/health 접속
   - `{"status":"ok","message":"Server is running"}` 응답 확인

3. **MongoDB 연결 확인**
   - MongoDB가 실행 중인지 확인
   - 연결 문자열이 올바른지 확인

### 4. 문제 해결

#### "백엔드 서버에 연결할 수 없습니다" 오류
- 백엔드 서버가 실행 중인지 확인
- 포트 5000이 사용 중인지 확인
- `server/.env` 파일의 설정 확인

#### "MongoDB 연결 실패" 오류
- MongoDB가 실행 중인지 확인
- MongoDB 연결 문자열 확인 (`MONGODB_URI`)
- MongoDB Atlas 사용 시 네트워크 접근 설정 확인

#### 경기 데이터가 없음
- MongoDB에 데이터가 있는지 확인
- 개발 환경에서는 자동으로 샘플 데이터가 생성됩니다
- 수동으로 데이터를 추가하려면:
  ```bash
  # 서버 실행 후 API로 경기 생성
  POST http://localhost:5000/api/matches
  ```

### 5. 샘플 데이터 확인

개발 환경에서 서버를 처음 실행하면 자동으로 다음 샘플 경기가 생성됩니다:
- FC 서울 vs 수원 삼성 (라이브)
- 맨체스터 유나이티드 vs 리버풀 (라이브)
- LG 트윈스 vs KT 위즈 (종료)
- 레알 마드리드 vs 바르셀로나 (예정)
- 서울 SK vs 원주 DB (종료)

## 전체 실행 순서

```bash
# 터미널 1: 백엔드 서버
cd server
npm run dev

# 터미널 2: 프론트엔드
cd client
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## Namecheap Shared Hosting 배포 시

⚠️ **중요**: Shared Hosting에서는 백엔드 서버를 실행할 수 없습니다.

- 경기 정보는 표시되지 않습니다
- 별도의 백엔드 서버(VPS, Railway, Render 등)가 필요합니다
- 외부 백엔드 서버 URL을 설정하고 재빌드해야 합니다

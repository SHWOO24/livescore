# 문제 해결 가이드

## 파일 업로드 후 업데이트가 반영되지 않는 경우

### 백엔드 서버 (Node.js)

#### 1. 서버 재시작 확인

**PM2 사용 시:**
```bash
# 서버에서 실행
cd ~/livescore-server/server
pm2 restart livescore-api

# 또는
pm2 reload livescore-api

# 상태 확인
pm2 status
pm2 logs livescore-api
```

**직접 실행 시:**
- 서버를 중지하고 다시 시작
- `Ctrl+C`로 중지 후 `npm run start` 또는 `npm run dev` 재실행

#### 2. TypeScript 빌드 확인

파일을 수정한 경우 **반드시 빌드**가 필요합니다:

```bash
cd ~/livescore-server/server
npm run build
pm2 restart livescore-api
```

**개발 모드**에서는 자동으로 재컴파일됩니다:
```bash
npm run dev  # tsx watch로 자동 재컴파일
```

#### 3. 파일 업로드 확인

업로드한 파일이 올바른 위치에 있는지 확인:

```bash
# 서버에서 확인
cd ~/livescore-server/server
ls -la src/  # 소스 파일 확인
ls -la dist/  # 빌드 결과물 확인
```

#### 4. 로그 확인

에러가 있는지 확인:

```bash
# PM2 로그
pm2 logs livescore-api --lines 50

# 또는 직접 실행 시 콘솔 출력 확인
```

#### 5. MongoDB 연결 확인

```bash
# MongoDB가 실행 중인지 확인
# 로컬 MongoDB
sudo systemctl status mongod

# MongoDB Atlas는 네트워크 접근 설정 확인
```

---

### 프론트엔드 (React)

#### 1. 개발 서버 재시작

```bash
cd client
npm run dev
```

개발 서버는 파일 변경 시 자동으로 새로고침되지만, 문제가 있으면 재시작:

```bash
# 프로세스 종료 후
npm run dev
```

#### 2. 프로덕션 빌드

프로덕션 배포 시:

```bash
cd client
npm run build
# deploy/static/ 디렉토리에 새 파일 생성 확인
```

#### 3. 브라우저 캐시 클리어

브라우저에서:
- `Ctrl+Shift+R` (Windows/Linux) 또는 `Cmd+Shift+R` (Mac) - 강력 새로고침
- 개발자 도구 (F12) → Network 탭 → "Disable cache" 체크
- 시크릿 모드에서 테스트

#### 4. 빌드 파일 확인

```bash
cd client
ls -la dist/  # 빌드 결과물 확인
ls -la deploy/static/  # 배포 파일 확인
```

---

## 일반적인 문제 해결

### 문제 1: 코드 변경이 반영되지 않음

**원인**: 서버가 재시작되지 않음

**해결**:
```bash
# 백엔드
pm2 restart livescore-api

# 프론트엔드 (개발)
# 개발 서버는 자동 새로고침되지만, 문제 시 재시작
```

### 문제 2: TypeScript 오류

**원인**: 빌드 실패

**해결**:
```bash
cd server
npm run build
# 오류 메시지 확인 및 수정
```

### 문제 3: 모듈을 찾을 수 없음

**원인**: 
- 파일 경로 오류
- import 경로 오류
- 빌드되지 않음

**해결**:
```bash
# 파일 경로 확인
ls -la src/routes/
ls -la src/models/

# 빌드 재실행
npm run build
```

### 문제 4: 환경변수 변경이 반영되지 않음

**원인**: 서버가 재시작되지 않음

**해결**:
```bash
# .env 파일 수정 후
pm2 restart livescore-api

# 또는
pm2 delete livescore-api
pm2 start ecosystem.config.js --env production
```

### 문제 5: 프론트엔드 API 호출 실패

**원인**: 
- 백엔드 서버가 실행되지 않음
- CORS 설정 문제
- 환경변수 설정 오류

**해결**:
```bash
# 백엔드 서버 상태 확인
curl http://localhost:5000/api/health

# 프론트엔드 환경변수 확인
cat client/.env.production
```

---

## 체크리스트

### 백엔드 업데이트 시

- [ ] 파일이 올바른 위치에 업로드되었는지 확인
- [ ] `npm run build` 실행 (TypeScript 파일 수정 시)
- [ ] `pm2 restart livescore-api` 실행
- [ ] `pm2 logs livescore-api`로 에러 확인
- [ ] `curl http://localhost:5000/api/health`로 서버 상태 확인

### 프론트엔드 업데이트 시

- [ ] 파일이 올바른 위치에 업로드되었는지 확인
- [ ] `npm run build` 실행 (프로덕션 배포 시)
- [ ] 브라우저 캐시 클리어
- [ ] 개발 서버 재시작 (개발 환경)
- [ ] `deploy/static/` 파일 확인 (프로덕션 배포)

---

## 빠른 진단 명령어

```bash
# 백엔드 상태 확인
cd ~/livescore-server/server
pm2 status
pm2 logs livescore-api --lines 20
curl http://localhost:5000/api/health

# 프론트엔드 상태 확인
cd client
npm run dev  # 개발 서버 실행 중인지 확인
curl http://localhost:3000  # 개발 서버 접근 확인
```

---

## 자주 묻는 질문

### Q: 파일을 수정했는데 변경사항이 보이지 않아요

**A**: 
1. TypeScript 파일 수정 시: `npm run build` 후 서버 재시작
2. JavaScript 파일 수정 시: 서버 재시작만 필요
3. 프론트엔드: 개발 서버는 자동 새로고침, 문제 시 재시작

### Q: PM2로 재시작했는데도 안 돼요

**A**:
1. `pm2 delete livescore-api`로 완전 삭제
2. `npm run build` 재실행
3. `pm2 start ecosystem.config.js --env production` 재시작
4. 로그 확인: `pm2 logs livescore-api`

### Q: 브라우저에서 변경사항이 안 보여요

**A**:
1. 강력 새로고침: `Ctrl+Shift+R`
2. 브라우저 캐시 클리어
3. 개발자 도구에서 "Disable cache" 체크
4. 시크릿 모드에서 테스트

---

## 추가 도움말

문제가 계속되면 다음 정보를 확인하세요:

1. **서버 로그**: `pm2 logs livescore-api`
2. **빌드 오류**: `npm run build` 출력
3. **브라우저 콘솔**: F12 → Console 탭
4. **네트워크 요청**: F12 → Network 탭

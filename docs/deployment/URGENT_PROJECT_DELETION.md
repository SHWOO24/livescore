# 🚨 긴급: 프로젝트 삭제 예정 문제 해결

## 현재 상황

Railway 대시보드에서 확인된 상태:
- ⚠️ **"Your project is being scheduled for deletion"**
- ⚠️ **"You will have 48 hours until deletion"**
- ⚠️ **"0/1 service online"** - 서비스가 실행되지 않음
- 프로젝트: `scorelivenow.com`

**이것이 백엔드 호출이 안 되는 주요 원인입니다.**

---

## ✅ 즉시 조치 사항

### 방법 1: 프로젝트 삭제 취소 (권장)

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트 선택**: `scorelivenow.com` 클릭
3. **Settings** 탭 클릭
4. **프로젝트 삭제 취소** 옵션 확인
   - 또는 삭제 알림에서 "Cancel Deletion" 클릭
5. **서비스 재배포**:
   - 서비스 선택
   - "Deploy" 또는 "Redeploy" 클릭

**주의**: 삭제 취소가 불가능한 경우 방법 2로 진행하세요.

---

### 방법 2: 새 프로젝트 생성 (삭제 취소 불가능한 경우)

#### Step 1: 새 프로젝트 생성

1. Railway 대시보드 접속
2. **"+ New"** 버튼 클릭
3. **"New Project"** 선택
4. **"Deploy from GitHub repo"** 선택
5. GitHub 저장소 연결 및 선택

#### Step 2: 서비스 설정

1. **Root Directory**: `server` ⚠️ **중요!**
2. **Build Command**: `npm ci && npm run build`
3. **Start Command**: `npm start`

#### Step 3: 환경변수 설정

Railway 대시보드 → 서비스 → **Variables** 탭:

```
NODE_ENV=production
JWT_SECRET=your-strong-random-string-32-chars-minimum
CORS_ORIGIN=https://scorelivenow.com,https://www.scorelivenow.com
DATABASE_URL=mongodb+srv://...
THESPORTSDB_API_KEY=123
PRIMARY_POLL_INTERVAL_SECONDS=30
SECONDARY_POLL_INTERVAL_SECONDS=90
CACHE_TTL_SECONDS=30
DEFAULT_SPORTS=Soccer,Basketball,Baseball,American Football,Ice Hockey
```

**기존 프로젝트의 환경변수 복사**:
- 기존 프로젝트 → 서비스 → Variables 탭
- 모든 환경변수 복사
- 새 프로젝트에 붙여넣기

#### Step 4: 배포 확인

1. 배포 완료 대기
2. 서비스 URL 확인 (예: `https://your-service.railway.app`)
3. 헬스체크:
   ```bash
   curl https://your-service.railway.app/api/health
   ```

---

## 🔧 서비스 재배포 (프로젝트 유지 시)

프로젝트 삭제를 취소했다면:

### 1. 서비스 확인

1. 프로젝트 → 서비스 선택
2. **"Logs"** 탭에서 에러 확인
3. **"Settings"** 탭에서 설정 확인:
   - Root Directory: `server`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`

### 2. 재배포

1. 서비스 → **"Deploy"** 또는 **"Redeploy"** 클릭
2. 또는 Git에 푸시하면 자동 재배포

### 3. 배포 성공 확인

- 대시보드에서 "Deployed successfully" 확인
- "1/1 service online" 상태 확인

---

## 📋 체크리스트

### 프로젝트 삭제 취소
- [ ] Railway 대시보드 접속
- [ ] 프로젝트 선택
- [ ] 삭제 취소 시도
- [ ] 서비스 재배포
- [ ] 배포 성공 확인

### 새 프로젝트 생성 (삭제 취소 불가능한 경우)
- [ ] 새 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory: `server` 설정
- [ ] Build Command 설정
- [ ] Start Command 설정
- [ ] 환경변수 설정 (기존 값 복사)
- [ ] 배포 완료 대기
- [ ] 헬스체크 통과
- [ ] 프론트엔드 환경변수 업데이트

---

## 🔄 프론트엔드 업데이트

백엔드 서버 URL이 변경되면:

### 1. 환경변수 파일 업데이트

```bash
cd client
npm run create:env
```

새 백엔드 URL 입력 (예: `https://your-new-service.railway.app`)

### 2. 재빌드

```bash
npm run build
```

### 3. 재배포

`client/dist/` 폴더의 내용을 Namecheap `public_html/`에 재업로드

---

## 💡 빠른 해결 방법

### 가장 빠른 방법:

1. **프로젝트 삭제 취소 시도**
   - Railway 대시보드 → 프로젝트 → Settings
   - 삭제 취소 옵션 확인

2. **서비스 재배포**
   - 서비스 → Deploy 클릭

3. **삭제 취소 불가능한 경우**
   - 새 프로젝트 생성
   - 기존 환경변수 복사
   - 배포

---

## ⚠️ 중요 사항

1. **48시간 내 조치 필요**: 프로젝트가 삭제되기 전에 조치하세요
2. **환경변수 백업**: 기존 프로젝트의 환경변수를 복사해두세요
3. **프론트엔드 업데이트**: 백엔드 URL이 변경되면 프론트엔드도 업데이트해야 합니다
4. **계정 상태**: "30 days or $5.00 left" - 트라이얼 기간이 끝나면 서비스가 중단될 수 있습니다

---

## 🔗 관련 문서

- [프로젝트 삭제 문제 해결](./PROJECT_DELETION_FIX.md)
- [빌드 실패 해결](./BUILD_FAILED_FIX.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [프론트엔드 환경변수 설정](./ENV_SETUP_GUIDE.md)

---

## 📞 추가 도움

문제가 계속되면:

1. Railway 대시보드에서 프로젝트 상태 확인
2. 서비스 로그 확인
3. Railway 지원팀에 문의 (필요한 경우)

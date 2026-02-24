# 배포 체크리스트

## 프론트엔드 배포 전 확인사항

### 1. 코드 변경사항 확인
- [x] 배너 광고를 텔레그램 문의로 변경 (`AdBanner.tsx`, `Layout.tsx`, `Sidebar.tsx`)
- [x] 어드민 페이지 추가 (`AdminLogin.tsx`, `AdminDashboard.tsx`)
- [x] 탭 필터링 기능 추가 (`Home.tsx`)
- [x] AuthContext에 role/status 추가

### 2. 프론트엔드 빌드 및 배포

**로컬에서 빌드 테스트:**
```bash
cd client
npm run build
```

**빌드 성공 확인:**
- `client/dist/` 폴더에 빌드 결과물 생성 확인
- 콘솔에 에러 없음 확인

**Namecheap에 배포:**
1. `client/dist/` 폴더의 모든 파일을 `public_html/`에 업로드
2. 기존 파일 덮어쓰기 확인
3. 브라우저 캐시 클리어 후 확인

### 3. 백엔드 배포 확인

**Railway 환경변수 확인:**
- [ ] `ADMIN_EMAIL` 설정됨
- [ ] `ADMIN_PASSWORD` 설정됨
- [ ] `JWT_SECRET` 설정됨
- [ ] `CORS_ORIGIN` 설정됨

**Railway 배포 확인:**
- [ ] 최근 배포가 성공적으로 완료됨
- [ ] 배포 로그에서 "✅ [Admin] 초기 ADMIN 계정이 생성되었습니다" 메시지 확인

### 4. 배포 후 테스트

**배너 확인:**
- [ ] 메인 페이지 상단 배너가 "📱 텔레그램 문의 scorelivenow.com"으로 표시됨
- [ ] 사이드바 배너가 텔레그램 문의로 표시됨
- [ ] 푸터 배너가 텔레그램 문의로 표시됨
- [ ] 모든 배너 클릭 시 텔레그램 링크로 이동됨

**어드민 기능:**
- [ ] `/admin/login` 접속 가능
- [ ] ADMIN 계정으로 로그인 성공
- [ ] `/admin/dashboard`에서 승인 대기 사용자 목록 확인 가능
- [ ] 승인/거절 기능 작동 확인

**탭 필터링:**
- [ ] 전체/라이브/예정/종료 탭 클릭 시 필터링 작동
- [ ] 각 탭의 카운트가 정확히 표시됨

**일반 사용자:**
- [ ] 회원가입 시 "승인 대기" 메시지 표시
- [ ] 승인 전 로그인 시도 시 "계정 승인 필요" 메시지 표시
- [ ] 어드민 승인 후 로그인 성공

---

## 빠른 배포 명령어

### 프론트엔드 빌드
```bash
cd client
npm run build
```

### 빌드 결과물 확인
```bash
ls -la client/dist/
```

### 배포 파일 압축 (선택사항)
```bash
cd client/dist
zip -r ../../client-dist.zip .
```

---

## 문제 해결

### 배너가 여전히 placeholder로 표시됨
- 브라우저 캐시 클리어 (Ctrl+Shift+R)
- `client/dist/` 폴더의 파일이 최신인지 확인
- Namecheap에 업로드가 완료되었는지 확인

### 어드민 로그인 실패
- Railway 환경변수 `ADMIN_EMAIL`, `ADMIN_PASSWORD` 확인
- Railway 배포 로그에서 ADMIN 계정 생성 메시지 확인
- MongoDB에서 계정 확인

### 탭 필터링이 작동하지 않음
- 브라우저 콘솔에서 JavaScript 에러 확인
- `client/dist/` 폴더의 최신 빌드 파일 확인

---

**마지막 업데이트:** 2026-02-08

# Railway 빌드 커맨드 설정 방법

## 🎯 Railway 대시보드에서 빌드 커맨드 추가하기

### Step 1: Settings 화면으로 이동

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트 선택**: `scorelivenow.com` 또는 해당 프로젝트 클릭
3. **서비스 선택**: `livescore` 서비스 클릭
4. **Settings 탭 클릭**: 상단 메뉴에서 "Settings" 클릭

---

### Step 2: Build 섹션 찾기

Settings 화면에서:

1. **스크롤 다운**하여 "Build" 섹션 찾기
2. 또는 **오른쪽 사이드바**에서 "Build" 클릭 (빠른 이동)

---

### Step 3: Custom Build Command 추가

Build 섹션에서:

1. **"Custom Build Command"** 섹션 찾기
2. **"Custom Build Command"** 버튼 또는 입력 필드 클릭
3. 다음 명령어 입력:
   ```bash
   rm -rf node_modules/.cache && npm ci && npm run build
   ```
4. **저장** 버튼 클릭 (또는 Enter 키)

---

## 📸 단계별 스크린샷 가이드

### 1. Settings 화면 접근
```
Railway 대시보드
  → 프로젝트 선택
    → 서비스 선택 (livescore)
      → Settings 탭 클릭
```

### 2. Build 섹션 찾기
```
Settings 화면
  → 스크롤 다운
    → "Build" 섹션 찾기
      → 또는 오른쪽 사이드바에서 "Build" 클릭
```

### 3. Custom Build Command 입력
```
Build 섹션
  → "Custom Build Command" 섹션 찾기
    → 입력 필드 클릭
      → 다음 명령어 입력:
        rm -rf node_modules/.cache && npm ci && npm run build
      → 저장
```

---

## 🔧 빌드 커맨드 옵션

### 옵션 1: 캐시 디렉토리 삭제 후 빌드 (권장)
```bash
rm -rf node_modules/.cache && npm ci && npm run build
```

### 옵션 2: npm 캐시 경로 변경
```bash
npm ci --cache=/tmp/.npm && npm run build
```

### 옵션 3: 단순 버전 (문제가 없으면)
```bash
npm ci && npm run build
```

---

## ✅ 확인 방법

빌드 커맨드를 추가한 후:

1. **Settings 화면에서 확인**:
   - Build 섹션에 입력한 커맨드가 표시되는지 확인

2. **재배포**:
   - "Deploy" 버튼 클릭
   - 또는 Git에 푸시하면 자동 재배포

3. **로그 확인**:
   - Deployments 탭 → 최신 배포 → View Logs
   - 빌드 커맨드가 올바르게 실행되는지 확인

---

## 🐛 문제 해결

### 빌드 커맨드가 보이지 않으면:

1. **Build 섹션 확인**:
   - Settings 화면에서 Build 섹션이 있는지 확인
   - 스크롤을 더 내려서 확인

2. **권한 확인**:
   - 프로젝트 소유자 또는 관리자 권한이 있는지 확인

3. **브라우저 새로고침**:
   - F5 또는 Ctrl+R로 페이지 새로고침

---

## 💡 빠른 팁

1. **빌드 커맨드는 한 줄로 입력**:
   - 여러 명령어는 `&&`로 연결

2. **저장 후 즉시 재배포**:
   - 저장하면 자동으로 재배포가 시작될 수 있음
   - 또는 수동으로 "Deploy" 버튼 클릭

3. **변경사항 확인**:
   - Settings 화면에서 입력한 커맨드가 표시되는지 확인

---

## 📋 체크리스트

```
[ ] Railway 대시보드 접속
[ ] 프로젝트 선택
[ ] 서비스 선택 (livescore)
[ ] Settings 탭 클릭
[ ] Build 섹션 찾기
[ ] Custom Build Command 입력 필드 클릭
[ ] 빌드 커맨드 입력:
    rm -rf node_modules/.cache && npm ci && npm run build
[ ] 저장
[ ] 재배포 시도
[ ] 배포 성공 확인
```

---

## 🔗 관련 문서

- [Railway EBUSY 오류 해결](./RAILWAY_EBUSY_ERROR_FIX.md)
- [Railway 설정 구성](./RAILWAY_SETTINGS_CONFIGURATION.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)

---

## 📞 다음 단계

1. Settings → Build 섹션으로 이동
2. Custom Build Command 입력
3. 저장
4. 재배포
5. 배포 성공 확인

빌드 커맨드를 추가하면 EBUSY 오류가 해결될 것입니다!

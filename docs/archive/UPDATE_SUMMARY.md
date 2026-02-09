# 업데이트 요약 및 배포 가이드

## 📝 업데이트된 파일 목록

### 1. 라이브스코어 실시간 업데이트 개선
- **`client/src/pages/Home.tsx`**
  - Socket.io 연결 실패 시 5초마다 자동 폴링 추가
  - Silent 모드로 백그라운드 업데이트 (로딩 표시 없음)
  - useCallback으로 최적화

### 2. API 호출 개선
- **`client/src/utils/api.ts`**
  - 네트워크 오류 시 자동 재시도 로직 추가 (최대 2회)
  - 타임아웃 설정 (10초)
  - 지수 백오프 적용

### 3. 배너광고 개선
- **`client/src/components/Layout.tsx`**
  - 상단 배너: 사이즈 표기 (728x90) 및 모집 배너 추가
  - 하단 배너: 사이즈 표기 (300x100) 및 모집 배너 추가

- **`client/src/components/Sidebar.tsx`**
  - 사이드 배너: 사이즈 표기 (300x250) 및 모집 배너 추가

- **`client/src/components/AdBanner.tsx`**
  - 메인 배너: 사이즈 표기 (728x90) 및 모집 배너 추가

---

## 🚀 서버 업로드 절차

### 1단계: 빌드 및 배포 패키지 생성

```bash
cd client
npm run deploy:prepare
```

이 명령어는 다음을 수행합니다:
- TypeScript 타입 체크
- 프로덕션 빌드 (`client/dist/` 생성)
- 배포 패키지 생성 (`deploy/static/` 생성)

### 2단계: 업로드할 파일 확인

**업로드 경로**: `/home/username/scorelivenow.com/public_html/` (또는 cPanel에서 지정한 document root)

**업로드할 파일**: `deploy/static/` 디렉토리의 **모든 내용**

```
deploy/static/
├── index.html          ✅ 업로드
├── .htaccess           ✅ 업로드
├── robots.txt          ✅ 업로드
├── sitemap.xml         ✅ 업로드
└── assets/             ✅ 업로드 (폴더 전체)
    ├── index-*.js
    └── index-*.css
```

### 3단계: FTP/SFTP로 업로드

#### 방법 1: FileZilla 사용 (추천)

1. FileZilla 또는 다른 FTP 클라이언트로 접속
2. `public_html` 디렉토리로 이동
3. 기존 파일 백업 (선택사항)
4. `deploy/static/` 내부의 **모든 파일과 폴더**를 업로드
   - ⚠️ 중요: `deploy/static` 폴더 자체가 아닌, 그 안의 내용만 업로드

#### 방법 2: cPanel File Manager 사용

1. cPanel → File Manager 접속
2. `public_html` 디렉토리로 이동
3. `deploy/static/` 내용을 압축하여 업로드
4. cPanel에서 압축 해제

### 4단계: 확인 사항

배포 후 다음을 확인하세요:

1. **메인 페이지**: `https://scorelivenow.com/` 정상 로드
2. **SPA 라우팅**: `/login`, `/register` 직접 접속 시 404가 아닌 정상 페이지 표시
3. **정적 리소스**: CSS, JS 파일 정상 로드 (브라우저 개발자 도구 Network 탭)
4. **API 연결**: 브라우저 콘솔에서 API 호출 오류 확인 (백엔드 서버가 설정되어 있어야 함)
5. **실시간 업데이트**: 라이브 탭에서 5초마다 자동 업데이트 확인
6. **배너광고**: 상단, 사이드, 하단 배너에 사이즈 표기 및 모집 배너 확인

---

## ⚠️ 중요 사항

### 업로드 대상
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ `assets/` 폴더 (전체)
- ✅ `robots.txt`, `sitemap.xml`

### 업로드 금지
- ❌ `node_modules/`
- ❌ `src/`
- ❌ `package.json`
- ❌ `server/`
- ❌ 기타 개발 파일

---

## 🔄 업데이트된 기능

### 1. 실시간 라이브스코어 업데이트
- Socket.io 연결이 안 될 경우 자동으로 5초마다 폴링
- 네트워크 오류 시 자동 재시도 (최대 2회)
- 타임아웃 설정으로 응답 없는 요청 방지

### 2. 배너광고 개선
- 모든 배너에 사이즈 표기 추가 (우측 하단)
- 광고가 없을 때 모집 배너 자동 표시
- 이메일 링크: ad@scorelivenow.com

---

## 📋 빠른 배포 명령어

```bash
# 1. client 디렉토리로 이동
cd client

# 2. 빌드 및 배포 패키지 생성
npm run deploy:prepare

# 3. deploy/static/ 내용을 확인
ls -la ../deploy/static/

# 4. FTP/SFTP로 업로드
# deploy/static/ 내부의 모든 파일과 폴더를 public_html에 업로드
```

---

## ✅ 완료!

이제 `deploy/static/` 디렉토리의 모든 내용을 서버의 `public_html` 디렉토리에 업로드하면 됩니다!

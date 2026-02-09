# 서버에 업로드할 파일 정리

## 📦 압축 파일 생성

로컬에서 다음 명령어 실행:
```bash
npm run prepare:upload
```

이 명령어는 `livescore-server-upload.zip` 파일을 생성합니다.

---

## 📤 서버에 업로드할 파일

### 1. 압축 파일 업로드

**파일**: `livescore-server-upload.zip` (하나만 업로드!)

이 파일을 서버에 업로드합니다.

---

## 📂 압축 파일 내용

압축 해제 후:

```
livescore-server-upload/
├── server/              # 백엔드 서버 파일
│   ├── src/            # 소스 코드
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── ecosystem.config.js
│   └── .env.production.example
├── frontend/            # 프론트엔드 배포 파일
│   ├── index.html
│   ├── .htaccess
│   ├── assets/
│   ├── robots.txt
│   └── sitemap.xml
└── README.md
```

---

## 🎯 배포 방법

### 백엔드 서버 (VPS/Linux)

**업로드 위치**: `~/livescore-server/server/`

1. 압축 해제:
   ```bash
   unzip livescore-server-upload.zip
   ```

2. server 디렉토리 복사:
   ```bash
   cp -r server/* ~/livescore-server/server/
   ```

3. 서버에서 실행:
   ```bash
   cd ~/livescore-server/server
   npm ci
   npm run build
   pm2 start ecosystem.config.js --env production
   ```

### 프론트엔드 (Namecheap Shared Hosting)

**업로드 위치**: `public_html/`

1. 압축 해제:
   ```bash
   unzip livescore-server-upload.zip
   ```

2. frontend 디렉토리 내용을 public_html에 업로드:
   - `frontend/index.html` → `public_html/index.html`
   - `frontend/.htaccess` → `public_html/.htaccess`
   - `frontend/assets/` → `public_html/assets/`
   - `frontend/robots.txt` → `public_html/robots.txt`
   - `frontend/sitemap.xml` → `public_html/sitemap.xml`

---

## ✅ 업로드 체크리스트

### 백엔드 서버
- [ ] `livescore-server-upload.zip` 업로드
- [ ] 압축 해제
- [ ] `server/` 디렉토리 내용을 서버에 복사
- [ ] `npm ci` 실행
- [ ] `npm run build` 실행
- [ ] `.env` 파일 생성
- [ ] `pm2 start` 실행

### 프론트엔드
- [ ] `livescore-server-upload.zip` 업로드
- [ ] 압축 해제
- [ ] `frontend/` 디렉토리 내용을 `public_html/`에 업로드
- [ ] `.htaccess` 파일 확인
- [ ] 브라우저에서 `Ctrl+Shift+R` (강력 새로고침)

---

## ⚠️ 중요 사항

### 업로드하지 말아야 할 것

- ❌ `node_modules/` - 서버에서 `npm ci`로 설치
- ❌ `dist/` - 서버에서 `npm run build`로 생성
- ❌ `.env` - 서버에서 직접 생성 (보안)
- ❌ `logs/` - PM2가 자동 생성

### 업로드해야 할 것

- ✅ `src/` - 소스 코드
- ✅ `package.json` - 의존성 정보
- ✅ `tsconfig.json` - TypeScript 설정
- ✅ `ecosystem.config.js` - PM2 설정

---

## 요약

**업로드할 파일**: `livescore-server-upload.zip` (하나만!)

**압축 해제 후**:
- `server/` → 백엔드 서버에 복사
- `frontend/` → Namecheap `public_html/`에 업로드

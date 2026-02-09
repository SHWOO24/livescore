# 프론트엔드 Namecheap 배포 가이드

## 📋 사전 준비

- Namecheap Shared Hosting 계정
- FTP/SFTP 접속 정보
- `client/dist` 폴더 (빌드 완료)

---

## 🚀 배포 절차

### 1단계: 프론트엔드 빌드

```bash
cd client
npm run build
```

빌드 결과물은 `client/dist/` 폴더에 생성됩니다.

### 2단계: 업로드할 파일 확인

**업로드할 파일/폴더**:
```
client/dist/
├── index.html          ← 필수
├── .htaccess          ← 필수 (SPA 라우팅)
├── assets/            ← 필수 (CSS, JS 파일)
│   ├── index-*.js
│   └── index-*.css
├── favicon.png        ← 선택
├── logo.png           ← 선택
├── robots.txt         ← 선택
└── sitemap.xml        ← 선택
```

**업로드하지 말아야 할 것**:
- ❌ `node_modules/`
- ❌ `src/`
- ❌ `package.json`
- ❌ 기타 개발 파일

### 3단계: Namecheap에 업로드

#### 방법 1: cPanel File Manager

1. Namecheap cPanel 접속
2. "File Manager" 클릭
3. `public_html/` 디렉토리로 이동
4. 기존 파일 삭제 (필요시)
5. `client/dist/` 폴더의 **모든 내용**을 업로드
   - `dist` 폴더 자체가 아닌, `dist` 안의 내용만!

**최종 구조**:
```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-*.js
    └── index-*.css
```

#### 방법 2: FTP/SFTP 클라이언트

1. FTP/SFTP 클라이언트 실행 (FileZilla, WinSCP 등)
2. Namecheap FTP 정보로 접속
3. `public_html/` 디렉토리로 이동
4. 로컬의 `client/dist/` 폴더 내용을 업로드

---

## 📄 .htaccess 파일 설정

SPA 라우팅을 위해 `.htaccess` 파일이 필요합니다.

**위치**: `public_html/.htaccess`

**내용**:
```apache
# Apache/LiteSpeed SPA 라우팅 설정
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 디렉토리 리스팅 방지
<IfModule mod_autoindex.c>
  Options -Indexes
</IfModule>

DirectoryIndex index.html

# Gzip 압축 (선택사항)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# 브라우저 캐싱 (선택사항)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## ✅ 배포 확인

### 1. 메인 페이지 확인
- 브라우저에서 `https://scorelivenow.com` 접속
- 페이지가 정상 로드되는지 확인

### 2. SPA 라우팅 확인
- `/login`, `/register` 등 직접 접속 시 404가 아닌지 확인
- 브라우저 새로고침 시에도 정상 작동하는지 확인

### 3. 정적 파일 확인
- 브라우저 개발자 도구 → Network 탭
- CSS, JS 파일이 정상 로드되는지 확인
- 404 오류가 없는지 확인

### 4. 백엔드 연결 확인
- 브라우저 개발자 도구 → Console 탭
- API 호출 오류가 없는지 확인
- Socket.io 연결 상태 확인

---

## 🔧 문제 해결

### 페이지가 로드되지 않음

1. **파일 권한 확인**:
   ```bash
   # cPanel File Manager에서
   # 파일 권한: 644
   # 폴더 권한: 755
   ```

2. **.htaccess 파일 확인**:
   - `public_html/.htaccess` 파일이 있는지 확인
   - 내용이 올바른지 확인

3. **index.html 확인**:
   - `public_html/index.html` 파일이 있는지 확인

### 404 오류 (SPA 라우팅 실패)

1. **.htaccess 파일 확인**:
   - `public_html/.htaccess` 파일 존재 확인
   - mod_rewrite 모듈 활성화 확인 (cPanel에서 확인)

2. **파일 경로 확인**:
   - 모든 파일이 `public_html/` 루트에 있는지 확인
   - `dist` 폴더가 아닌 내용만 업로드했는지 확인

### CSS/JS 파일 로드 실패

1. **파일 경로 확인**:
   - `index.html`에서 `assets/` 경로가 올바른지 확인
   - 상대 경로 사용 확인

2. **파일 권한 확인**:
   - `assets/` 폴더 권한: 755
   - 파일 권한: 644

### 백엔드 연결 실패

1. **환경변수 확인**:
   - 빌드 시 `VITE_API_BASE_URL` 설정 확인
   - 재빌드 필요 시: `npm run build`

2. **CORS 확인**:
   - 백엔드 `CORS_ORIGIN`에 프론트엔드 도메인 포함 확인

---

## 📝 업데이트 절차

코드 수정 후 재배포:

1. **로컬에서 빌드**:
   ```bash
   cd client
   npm run build
   ```

2. **변경된 파일만 업로드**:
   - 수정된 파일만 선택하여 업로드
   - 또는 전체 재업로드

3. **브라우저 캐시 삭제**:
   - `Ctrl+Shift+R` (강력 새로고침)
   - 또는 브라우저 캐시 삭제

---

## 🗜️ 자동화: ZIP 파일 생성

빌드 후 ZIP 파일로 압축하여 업로드:

```bash
# 루트에서 실행
npm run zip:client
```

생성된 `client-dist.zip` 파일을 업로드하고 압축 해제하면 됩니다.

---

## 📋 체크리스트

### 배포 전
- [ ] `client/.env.production` 파일에 백엔드 URL 설정
- [ ] `npm run build` 성공 확인
- [ ] `client/dist/` 폴더에 필요한 파일 확인
- [ ] `.htaccess` 파일 확인

### 배포 후
- [ ] 메인 페이지 정상 로드 확인
- [ ] SPA 라우팅 작동 확인 (`/login` 등)
- [ ] CSS/JS 파일 정상 로드 확인
- [ ] 백엔드 API 연결 확인
- [ ] Socket.io 연결 확인 (선택사항)

---

## 🔗 관련 문서

- [백엔드 배포 가이드](./BACKEND_DEPLOY_RENDER.md)
- [문제 해결 가이드](./TROUBLESHOOT.md)
- [업로드 가이드](./WHAT_TO_UPLOAD.md)

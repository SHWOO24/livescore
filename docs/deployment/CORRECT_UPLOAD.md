# 올바른 업로드 방법

## 현재 상황

스크린샷을 보니 `public_html`에 잘못된 파일들이 업로드되어 있습니다.

## 올바른 업로드 절차

### 1단계: 로컬에서 배포 패키지 생성

```bash
# 프로젝트 루트에서
cd client

# 환경변수 설정 (백엔드 서버 URL)
# .env.production 파일 생성 및 수정
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com

# 빌드 및 배포 패키지 생성
npm run deploy:prepare
```

이 명령어는 `deploy/static/` 디렉토리에 올바른 파일만 생성합니다.

### 2단계: deploy/static/ 내용 확인

생성된 파일:
```
deploy/static/
├── index.html
├── .htaccess
├── robots.txt
├── sitemap.xml
└── assets/
    ├── index-*.js
    └── index-*.css
```

### 3단계: public_html 정리

**File Manager에서 삭제:**
- `node_modules/` ❌
- `client/` ❌
- `server/` ❌
- `livescore.zip` ❌
- `package.json` ❌
- `package-lock.json` ❌
- 모든 `.md` 파일 ❌

### 4단계: 올바른 파일만 업로드

`deploy/static/` 디렉토리의 **모든 내용**을 `public_html/`에 업로드:

- `index.html` → `public_html/index.html`
- `.htaccess` → `public_html/.htaccess`
- `assets/` → `public_html/assets/`
- `robots.txt` → `public_html/robots.txt`
- `sitemap.xml` → `public_html/sitemap.xml`

---

## 빠른 정리 스크립트 (로컬)

로컬에서 올바른 파일만 압축:

```bash
cd client
npm run deploy:prepare

# deploy/static/ 내용을 압축
cd deploy/static
zip -r ../../livescore-deploy.zip .
```

이 `livescore-deploy.zip` 파일만 업로드하고 압축 해제하면 됩니다.

---

## 중요: 업로드하지 말아야 할 것

- ❌ `node_modules/` (용량 큼, 보안 위험)
- ❌ `client/` (소스 코드)
- ❌ `server/` (백엔드 코드)
- ❌ `package.json` (개발 설정)
- ❌ `.gitignore` (Git 설정)
- ❌ 모든 문서 파일 (`.md`)

---

## 확인

업로드 후 `public_html`에는 다음만 있어야 합니다:

```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-*.js
│   └── index-*.css
├── robots.txt (선택)
└── sitemap.xml (선택)
```

**총 5개 이하의 항목만 있어야 합니다!**

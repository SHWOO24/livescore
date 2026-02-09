# 서버 업로드 가이드

## 압축 파일 생성

로컬에서 다음 명령어를 실행하세요:

```bash
npm run prepare:upload
```

이 명령어는 다음을 수행합니다:
1. 백엔드 서버 파일 정리 (`server/src/`, 설정 파일들)
2. 프론트엔드 빌드 및 배포 패키지 생성
3. 필요한 문서 파일 복사
4. `server-upload/` 디렉토리에 모든 파일 정리
5. `livescore-server-upload.zip` 압축 파일 생성

## 생성되는 파일

```
livescore-server-upload.zip
├── server/                    # 백엔드 서버 파일
│   ├── src/                  # 소스 코드
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── ecosystem.config.js
│   ├── .env.production.example
│   └── nginx.conf.example
├── frontend/                  # 프론트엔드 배포 파일
│   ├── index.html
│   ├── .htaccess
│   ├── assets/
│   ├── robots.txt
│   └── sitemap.xml
└── DEPLOY_BACKEND.md          # 배포 가이드
```

## 서버에 업로드

### 1. 압축 파일 업로드

`livescore-server-upload.zip` 파일을 서버에 업로드합니다.

### 2. 압축 해제

서버에서:

```bash
# 업로드한 위치로 이동
cd ~/uploads  # 또는 업로드한 위치

# 압축 해제
unzip livescore-server-upload.zip

# 또는
tar -xzf livescore-server-upload.zip
```

### 3. 백엔드 서버 배포

```bash
# server 디렉토리를 프로젝트 위치로 이동
mv server ~/livescore-server/

# 또는 직접 복사
cp -r server/* ~/livescore-server/server/
```

그 다음 `DEPLOY_BACKEND.md`를 참고하여 배포합니다.

### 4. 프론트엔드 배포 (Namecheap)

`frontend/` 디렉토리의 **모든 내용**을 `public_html/`에 업로드:

- `index.html` → `public_html/index.html`
- `.htaccess` → `public_html/.htaccess`
- `assets/` → `public_html/assets/`
- `robots.txt` → `public_html/robots.txt`
- `sitemap.xml` → `public_html/sitemap.xml`

## 포함되지 않는 파일

다음 파일들은 **서버에서 생성**해야 하므로 압축 파일에 포함되지 않습니다:

- `node_modules/` - 서버에서 `npm ci`로 설치
- `dist/` - 서버에서 `npm run build`로 생성
- `.env` - 서버에서 직접 생성
- `logs/` - PM2가 자동 생성

## 주의사항

1. ⚠️ 압축 파일에는 소스 코드만 포함됩니다
2. ⚠️ 서버에서 `npm ci`로 의존성 설치 필요
3. ⚠️ 서버에서 `npm run build`로 빌드 필요
4. ⚠️ `.env` 파일은 서버에서 직접 생성 필요

## 빠른 배포 체크리스트

### 백엔드
- [ ] `server/` 디렉토리 업로드
- [ ] `npm ci` 실행
- [ ] `npm run build` 실행
- [ ] `.env` 파일 생성
- [ ] `pm2 start ecosystem.config.js --env production`

### 프론트엔드
- [ ] `frontend/` 내용을 `public_html/`에 업로드
- [ ] `.htaccess` 파일 확인
- [ ] 브라우저에서 사이트 접속 테스트

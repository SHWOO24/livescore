# public_html 정리 가이드

## ⚠️ 현재 문제점

스크린샷을 보니 `public_html`에 **업로드하면 안 되는 파일들**이 있습니다:

### ❌ 삭제해야 할 파일/폴더

1. **`node_modules/`** - 절대 업로드 금지! (용량 큼, 불필요)
2. **`client/`** - 소스 코드 폴더 (업로드 불필요)
3. **`server/`** - 백엔드 서버 코드 (업로드 불필요)
4. **`livescore.zip`** - 압축 파일 (업로드 불필요)
5. **`package.json`** - 개발 설정 파일 (업로드 불필요)
6. **`package-lock.json`** - 개발 설정 파일 (업로드 불필요)
7. **`.gitignore`** - Git 설정 파일 (업로드 불필요)
8. **`README.md`, `DEPLOYMENT.md` 등** - 문서 파일 (업로드 불필요)

### ✅ 유지해야 할 파일/폴더

1. **`index.html`** ✅ 필수
2. **`assets/`** ✅ 필수 (CSS, JS 파일)
3. **`.htaccess`** ✅ 필수 (SPA 라우팅)
4. **`robots.txt`** ✅ SEO용 (선택사항)
5. **`sitemap.xml`** ✅ SEO용 (선택사항)

---

## 정리 방법

### 방법 1: File Manager에서 직접 삭제

1. File Manager에서 다음 파일/폴더를 선택:
   - `node_modules/`
   - `client/`
   - `server/`
   - `livescore.zip`
   - `package.json`
   - `package-lock.json`
   - `.gitignore`
   - `README.md`
   - `DEPLOYMENT.md`
   - `DEPLOY_BACKEND.md`
   - `QUICK_START.md`
   - `SUMMARY.md`

2. "Delete" 또는 "삭제" 버튼 클릭

### 방법 2: 올바른 파일만 다시 업로드

1. 로컬에서 올바른 파일만 준비:
   ```bash
   cd client
   npm run deploy:prepare
   ```
   이 명령어는 `deploy/static/` 디렉토리에 올바른 파일만 생성합니다.

2. `deploy/static/` 내용만 업로드:
   - `index.html`
   - `.htaccess`
   - `assets/` 폴더
   - `robots.txt` (있다면)
   - `sitemap.xml` (있다면)

3. 기존 파일 덮어쓰기

---

## 최종 public_html 구조

정리 후에는 다음과 같이 되어야 합니다:

```
public_html/
├── index.html          ✅
├── .htaccess           ✅
├── robots.txt          ✅ (선택사항)
├── sitemap.xml         ✅ (선택사항)
└── assets/             ✅
    ├── index-*.js
    └── index-*.css
```

**이것만 있으면 됩니다!**

---

## 보안 및 성능

### 왜 불필요한 파일을 삭제해야 하나요?

1. **보안**: 
   - `package.json`에 민감한 정보가 있을 수 있음
   - 소스 코드 노출 방지

2. **성능**:
   - `node_modules/`는 수백 MB (로딩 느림)
   - 불필요한 파일은 서버 리소스 낭비

3. **용량**:
   - Shared Hosting 용량 제한
   - 불필요한 파일은 용량 낭비

---

## 확인 체크리스트

정리 후 확인:

- [ ] `index.html`이 루트에 있는가?
- [ ] `.htaccess` 파일이 있는가?
- [ ] `assets/` 폴더만 있는가?
- [ ] `node_modules/`가 없는가?
- [ ] `client/`, `server/` 폴더가 없는가?
- [ ] `package.json`이 없는가?

---

## 다음 단계

1. 불필요한 파일 삭제
2. 올바른 파일만 업로드 확인
3. 브라우저에서 사이트 접속 테스트
4. `Ctrl+Shift+R`로 강력 새로고침

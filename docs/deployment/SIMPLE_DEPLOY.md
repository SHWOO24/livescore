# 간단한 배포 가이드

## 🎯 핵심 정리

### 로컬 (개발)
- **위치**: `F:\Cursor\livescore\server\`
- **용도**: 코드 작성 및 테스트
- **실행**: `npm run dev`

### 서버 (운영)
- **위치**: `~/livescore-server/server/` (서버에 새로 생성)
- **용도**: 실제 서비스 제공
- **실행**: `pm2 start ecosystem.config.js`

---

## 📤 배포 과정 (로컬 → 서버)

### 1. 로컬에서 압축 파일 생성

```bash
npm run prepare:upload
```

→ `livescore-server-upload.zip` 생성

### 2. 서버에 업로드

FTP/SFTP로 `livescore-server-upload.zip` 업로드

### 3. 서버에서 압축 해제 및 배포

```bash
# 서버에 SSH 접속
ssh username@your-server-ip

# 압축 해제
unzip livescore-server-upload.zip

# 백엔드 배포
cd ~/livescore-server/server
cp -r ../server-upload/server/* .
npm ci
npm run build
pm2 start ecosystem.config.js --env production

# 프론트엔드 배포 (Namecheap)
# frontend/ 디렉토리 내용을 public_html/에 업로드
```

---

## ❌ 혼동하지 마세요!

**"호스팅 서버에 업로드한 파일을 다시 로컬서버로 복사하라고?"**

→ **아니요!** 

- ✅ **로컬에서 서버로**: 개발한 코드를 서버에 배포
- ❌ **서버에서 로컬로**: 필요 없음

---

## 🔄 업데이트 시

코드를 수정했다면:

1. 로컬에서 테스트 (`npm run dev`)
2. 압축 파일 생성 (`npm run prepare:upload`)
3. 서버에 업로드
4. 서버에서 재배포 (`pm2 restart`)

**방향은 항상 로컬 → 서버입니다!**

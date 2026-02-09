# 배포 흐름도

## 📤 로컬 → 서버 (업로드)

### 현재 상황

```
로컬 (Windows)
└── F:\Cursor\livescore\
    ├── server/          ← 백엔드 소스 코드 (로컬 개발용)
    └── client/          ← 프론트엔드 소스 코드
```

### 배포 과정

```
1. 로컬에서 압축 파일 생성
   ↓
2. 압축 파일을 서버에 업로드
   ↓
3. 서버에서 압축 해제
   ↓
4. 서버에서 실행
```

---

## 🔄 배포 흐름

### 1단계: 로컬에서 압축 파일 생성

```bash
# 로컬에서 실행
npm run prepare:upload
```

**결과**: `livescore-server-upload.zip` 파일 생성

### 2단계: 서버에 업로드

**FTP/SFTP 또는 File Manager로 업로드**:
- `livescore-server-upload.zip` 파일을 서버에 업로드

### 3단계: 서버에서 압축 해제

```bash
# 서버에서 실행 (SSH 접속 후)
unzip livescore-server-upload.zip
```

### 4단계: 서버에서 배포

```bash
# 백엔드 서버
cd ~/livescore-server/server
cp -r ../server-upload/server/* .
npm ci
npm run build
pm2 start ecosystem.config.js --env production

# 프론트엔드 (Namecheap)
# frontend/ 디렉토리 내용을 public_html/에 업로드
```

---

## ❌ 잘못된 이해

**"호스팅 서버에 업로드한 파일을 다시 로컬서버로 복사하라고?"**

→ **아니요!** 반대입니다.

- ✅ **로컬 → 서버**: 로컬에서 개발한 코드를 서버에 업로드
- ❌ **서버 → 로컬**: 서버에서 로컬로 복사하는 것이 아님

---

## 📍 각 서버의 역할

### 로컬 서버 (개발용)

**위치**: `F:\Cursor\livescore\server\`

**용도**: 
- 개발 및 테스트
- `npm run dev`로 실행
- http://localhost:5000

**특징**:
- 개발 중인 코드
- 자동 재시작
- 디버깅 용이

### 운영 서버 (배포용)

**위치**: `~/livescore-server/server/` (서버에 새로 생성)

**용도**:
- 실제 사용자에게 서비스 제공
- PM2로 실행
- https://api.yourdomain.com

**특징**:
- 프로덕션 빌드
- 자동 재시작 (PM2)
- 안정성 중시

---

## 🔄 업데이트 흐름

### 코드 수정 시

```
1. 로컬에서 코드 수정
   ↓
2. 로컬에서 테스트 (npm run dev)
   ↓
3. 압축 파일 생성 (npm run prepare:upload)
   ↓
4. 서버에 업로드
   ↓
5. 서버에서 배포 (npm ci, build, pm2 restart)
```

---

## 요약

| 단계 | 위치 | 작업 |
|------|------|------|
| **개발** | 로컬 (`F:\Cursor\livescore\server\`) | 코드 작성 및 테스트 |
| **압축** | 로컬 | `npm run prepare:upload` |
| **업로드** | 로컬 → 서버 | `livescore-server-upload.zip` 업로드 |
| **배포** | 서버 (`~/livescore-server/server/`) | 압축 해제 및 실행 |

**방향**: 로컬 → 서버 (한 방향)

**서버 → 로컬 복사는 필요 없습니다!**

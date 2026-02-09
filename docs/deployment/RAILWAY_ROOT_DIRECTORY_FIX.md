# Railway Root Directory 설정 수정 가이드

## 🚨 문제 상황

Railway 빌드가 다음 오류로 실패합니다:
```
[ 3/12] COPY package*.json ./
Failed to build an image. Please check the build logs for more details.
```

**원인**: Railway 설정에서 **Root Directory**가 `server`로 설정되어 있어서, Dockerfile의 빌드 컨텍스트가 `server` 디렉토리가 되어 루트의 `package.json`을 찾을 수 없습니다.

---

## ✅ 해결 방법

### Step 1: Railway 대시보드에서 Root Directory 확인 및 수정

1. Railway 대시보드 접속
2. 프로젝트 선택 (`acceptable-determination`)
3. 서비스 선택
4. **Settings** 탭 클릭
5. **Root Directory** 설정 확인:
   - ❌ **잘못된 설정**: `server` 또는 다른 하위 디렉토리
   - ✅ **올바른 설정**: 비워두기 (빈 값) 또는 `/` (루트)

6. Root Directory를 **비워두거나 삭제**:
   - Root Directory 필드의 값을 **지우기**
   - 또는 `/` (루트)로 설정
   - **저장** 클릭

### Step 2: Builder 설정 확인

**Settings** 탭에서:

- **Builder**: `DOCKERFILE` (또는 `Dockerfile`)
- **Dockerfile Path**: `Dockerfile` (또는 비워두기 - 자동 감지)
- **Start Command**: `npm start`

### Step 3: 재배포

Root Directory를 수정한 후:

1. Railway가 자동으로 재배포를 시작합니다
2. 또는 수동으로 **Deployments** 탭 → **Redeploy** 클릭
3. 배포 로그 확인:
   ```
   [ 1/12] FROM node:20-alpine
   [ 2/12] WORKDIR /app
   [ 3/12] COPY package.json ./  ← 성공해야 함
   ```

---

## 📋 Railway 설정 체크리스트

Railway 대시보드 → 서비스 → **Settings** 탭에서 확인:

```
[ ] Root Directory: (비워두기 또는 /)
[ ] Builder: DOCKERFILE
[ ] Dockerfile Path: Dockerfile (또는 비워두기)
[ ] Start Command: npm start
```

---

## 🔍 확인 방법

### 빌드 로그에서 확인:

**성공적인 빌드 로그**:
```
[ 1/12] FROM node:20-alpine
[ 2/12] WORKDIR /app
[ 3/12] COPY package.json ./
[ 4/12] RUN npm install
[ 5/12] COPY server/package*.json ./server/
...
```

**실패한 빌드 로그** (Root Directory가 잘못된 경우):
```
[ 3/12] COPY package*.json ./
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ...
```

---

## 💡 왜 Root Directory를 비워야 하나요?

### Dockerfile 위치:
```
livescore/                    ← 프로젝트 루트
├── Dockerfile                ← 루트에 있음
├── package.json              ← 루트에 있음
├── server/
│   ├── src/
│   └── package.json
└── client/
    ├── src/
    └── package.json
```

### Dockerfile의 COPY 명령:
```dockerfile
COPY package.json ./          ← 루트의 package.json을 복사
COPY server/package*.json ./server/  ← server/ 디렉토리의 파일 복사
```

**Root Directory가 `server`로 설정되면**:
- 빌드 컨텍스트가 `server/` 디렉토리가 됨
- `COPY package.json ./`는 `server/package.json`을 찾으려고 시도
- 루트의 `package.json`을 찾을 수 없어서 실패

**Root Directory를 비우면**:
- 빌드 컨텍스트가 프로젝트 루트 (`livescore/`)가 됨
- `COPY package.json ./`는 루트의 `package.json`을 정상적으로 찾음
- 빌드 성공

---

## 🔗 관련 문서

- [Railway Dockerfile 배포 가이드](./RAILWAY_DOCKERFILE_DEPLOYMENT.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [CORS 오류 해결 가이드](./CORS_FIX_GUIDE.md)

---

**Root Directory를 비운 후 재배포하면 빌드가 성공합니다!**

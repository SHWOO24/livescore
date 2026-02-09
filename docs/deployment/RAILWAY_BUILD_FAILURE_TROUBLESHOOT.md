# Railway 빌드 실패 문제 해결 가이드

## 🚨 현재 상황

Railway 배포가 "Build image" 단계에서 실패합니다:
- ❌ 최근 배포 (5초 전, 2분 전): 실패
- ✅ 45분 전 배포: 성공

---

## 🔍 문제 진단 단계

### Step 1: 빌드 로그 확인 (가장 중요)

Railway 대시보드에서:

1. **Deployments** 탭 클릭
2. 실패한 배포 항목 클릭 (예: "5 seconds ago")
3. **"View logs"** 버튼 클릭
4. 빌드 로그에서 다음 정보 확인:
   - 어느 단계에서 실패했는지
   - 정확한 오류 메시지
   - `COPY` 명령이 실패했는지, `RUN` 명령이 실패했는지

**확인할 로그 예시**:
```
[ 1/12] FROM node:20-alpine
[ 2/12] WORKDIR /app
[ 3/12] COPY package.json ./  ← 여기서 실패하는지 확인
[ 4/12] RUN npm install       ← 또는 여기서 실패하는지 확인
```

---

## 🔧 일반적인 원인 및 해결 방법

### 원인 1: Root Directory 설정 문제

**증상**: `COPY package.json ./` 단계에서 실패

**해결**:
1. Railway 대시보드 → 서비스 → **Settings** 탭
2. **Root Directory** 확인:
   - ❌ 잘못된 값: `server` 또는 다른 하위 디렉토리
   - ✅ 올바른 값: 비워두기 (빈 값) 또는 `/`
3. Root Directory를 **비우고 저장**
4. 재배포

---

### 원인 2: Git에 파일이 커밋되지 않음

**증상**: `COPY package.json ./`에서 "file not found" 오류

**해결**:
```bash
# 로컬에서 확인
git status

# package.json이 추적되고 있는지 확인
git ls-files | grep package.json

# 없다면 추가
git add package.json
git add Dockerfile
git commit -m "Fix: Add package.json and Dockerfile"
git push origin main
```

---

### 원인 3: .dockerignore가 너무 많이 제외함

**증상**: 필요한 파일이 Docker 빌드 컨텍스트에서 제외됨

**해결**:
`.dockerignore` 파일 확인:
```dockerignore
# package.json은 제외하면 안 됨!
# ❌ package.json  ← 이렇게 하면 안 됨
# ✅ node_modules  ← 이것만 제외
```

현재 `.dockerignore`는 올바르게 설정되어 있습니다 (package.json 제외하지 않음).

---

### 원인 4: Dockerfile 경로 문제

**증상**: Railway가 Dockerfile을 찾을 수 없음

**해결**:
1. Railway 대시보드 → 서비스 → **Settings** 탭
2. **Dockerfile Path** 확인:
   - ✅ 올바른 값: `Dockerfile` (루트)
   - 또는 비워두기 (자동 감지)
3. Dockerfile이 루트 디렉토리에 있는지 확인:
   ```bash
   ls -la Dockerfile  # 루트에서 실행
   ```

---

### 원인 5: npm install 실패

**증상**: `RUN npm install` 단계에서 실패

**가능한 원인**:
- 네트워크 문제
- package.json에 잘못된 의존성
- npm 레지스트리 접근 문제

**해결**:
Dockerfile에서 npm 레지스트리 명시:
```dockerfile
RUN npm config set registry https://registry.npmjs.org/
RUN npm install
```

또는 더 자세한 로그:
```dockerfile
RUN npm install --verbose
```

---

## 📋 체크리스트

빌드 실패 시 다음을 확인하세요:

```
[ ] Railway Settings → Root Directory: (비워두기)
[ ] Railway Settings → Builder: DOCKERFILE
[ ] Railway Settings → Dockerfile Path: Dockerfile
[ ] Git에 package.json 커밋됨
[ ] Git에 Dockerfile 커밋됨
[ ] .dockerignore에 package.json이 제외되지 않음
[ ] 빌드 로그에서 정확한 오류 메시지 확인
```

---

## 🔍 빌드 로그 분석 가이드

### 성공적인 빌드 로그:
```
[ 1/12] FROM node:20-alpine
[ 2/12] WORKDIR /app
[ 3/12] COPY package.json ./
[ 4/12] RUN npm install
[ 5/12] COPY server/package*.json ./server/
[ 6/12] RUN cd server && npm install
...
✓ Build completed successfully
```

### 실패한 빌드 로그 예시:

**예시 1: 파일을 찾을 수 없음**
```
[ 3/12] COPY package.json ./
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref ...
```
→ **원인**: Root Directory가 잘못 설정됨 또는 파일이 Git에 없음

**예시 2: npm install 실패**
```
[ 4/12] RUN npm install
ERROR: npm ERR! code ECONNREFUSED
```
→ **원인**: 네트워크 문제 또는 npm 레지스트리 접근 불가

**예시 3: 빌드 명령 실패**
```
[ 9/12] RUN cd server && npm run build
ERROR: sh: 1: tsc: not found
```
→ **원인**: TypeScript가 설치되지 않음 (devDependencies 문제)

---

## 💡 빠른 해결 방법

1. **빌드 로그 확인** (가장 중요!)
   - Railway → Deployments → 실패한 배포 → View logs

2. **Root Directory 확인**
   - Settings → Root Directory 비우기

3. **Git 커밋 확인**
   ```bash
   git status
   git add .
   git commit -m "Fix build"
   git push
   ```

4. **재배포**
   - Railway가 자동으로 재배포 시작
   - 또는 수동으로 Redeploy 클릭

---

## 🔗 관련 문서

- [Railway Root Directory 수정 가이드](./RAILWAY_ROOT_DIRECTORY_FIX.md)
- [Railway Dockerfile 배포 가이드](./RAILWAY_DOCKERFILE_DEPLOYMENT.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)

---

**다음 단계**: Railway 대시보드에서 실패한 배포의 빌드 로그를 확인하고, 정확한 오류 메시지를 공유해주세요!

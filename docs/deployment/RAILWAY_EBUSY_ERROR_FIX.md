# Railway 배포 오류: "EBUSY: resource busy or locked" 해결 가이드

## 🚨 현재 상황

배포 로그에서 확인된 오류:
- ❌ **"npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'"**
- ❌ **"npm ci && npm run build" did not complete successfully: exit code: 240**
- 빌드 단계에서 실패
- 상태: **FAILED**

---

## 🔍 문제 원인 분석

### 오류 분석:

1. **문제**: `npm ci` 명령어가 실행되는 동안 `/app/node_modules/.cache` 디렉토리를 삭제하려고 할 때 리소스가 잠겨있음
2. **원인**: Docker 빌드 과정에서 캐시 마운트와 npm 캐시 디렉토리 간의 충돌
3. **발생 시점**: Build 단계에서 `npm ci` 실행 중

---

## ✅ 해결 방법

### 방법 1: Build Command 수정 (권장)

Railway 대시보드에서:

1. **Settings** → **Build** 섹션
2. **Custom Build Command** 클릭
3. 다음 명령어로 변경:
   ```bash
   npm ci --cache=/tmp/.npm && npm run build
   ```
   또는:
   ```bash
   rm -rf node_modules/.cache && npm ci && npm run build
   ```

4. **저장**

---

### 방법 2: railway.json 파일 수정

`server/railway.json` 파일 수정:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "rm -rf node_modules/.cache && npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

변경 후 Git에 푸시:
```bash
git add server/railway.json
git commit -m "Fix EBUSY error in build command"
git push origin main
```

---

### 방법 3: .npmrc 파일 생성 (선택사항)

`server/.npmrc` 파일 생성:

```
cache=/tmp/.npm
```

이 파일을 Git에 추가:
```bash
git add server/.npmrc
git commit -m "Add .npmrc to fix cache directory issue"
git push origin main
```

---

## 🔧 단계별 해결 방법

### Step 1: Build Command 수정

**옵션 A: Railway 대시보드에서 수정**

1. Railway 대시보드 → 프로젝트 → 서비스 선택
2. **Settings** → **Build** 섹션
3. **Custom Build Command** 클릭
4. 다음 중 하나 입력:
   ```bash
   rm -rf node_modules/.cache && npm ci && npm run build
   ```
   또는:
   ```bash
   npm ci --cache=/tmp/.npm && npm run build
   ```
5. **저장**

**옵션 B: railway.json 파일 수정**

1. `server/railway.json` 파일 열기
2. `buildCommand` 수정:
   ```json
   "buildCommand": "rm -rf node_modules/.cache && npm ci && npm run build"
   ```
3. Git에 푸시

---

### Step 2: 재배포

설정을 변경한 후:

1. Railway 대시보드 → 프로젝트
2. **"Deploy"** 버튼 클릭
3. 또는 Git에 푸시하면 자동 재배포

---

## 📋 해결 방법 비교

| 방법 | 장점 | 단점 |
|------|------|------|
| **방법 1: Build Command 수정** | 빠르고 간단, 즉시 적용 | Railway 대시보드에서만 설정 |
| **방법 2: railway.json 수정** | 코드로 관리, 버전 관리 가능 | Git 푸시 필요 |
| **방법 3: .npmrc 파일** | npm 설정으로 관리 | 추가 파일 필요 |

**권장**: 방법 1 또는 방법 2 (둘 다 효과적)

---

## 🔍 예상되는 성공 로그

Build Command를 수정하면:

```
✓ Installing dependencies
  → rm -rf node_modules/.cache (캐시 디렉토리 삭제)
  → npm ci (성공)
✓ Building project
  → npm run build
  → tsc (TypeScript 컴파일 성공)
✓ Starting service
  → npm start
  → node dist/index.js
```

**성공 메시지**: "Deployed successfully"

---

## 🐛 여전히 문제가 있으면

### 추가 해결 방법:

1. **캐시 클리어**:
   ```bash
   npm cache clean --force
   ```

2. **node_modules 완전 삭제 후 재설치**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Railway 빌드 캐시 비활성화** (가능한 경우):
   - Settings → Build → Build Cache 비활성화

---

## 📋 체크리스트

```
[ ] Build Command 수정됨
[ ] railway.json 파일 수정됨 (선택사항)
[ ] Git에 푸시됨 (railway.json 수정한 경우)
[ ] 재배포 시도
[ ] 배포 성공 확인
[ ] EBUSY 오류 해결 확인
```

---

## 💡 빠른 해결 방법

**가장 빠른 방법**:

1. Railway 대시보드 → Settings → Build
2. Custom Build Command에 다음 입력:
   ```bash
   rm -rf node_modules/.cache && npm ci && npm run build
   ```
3. 저장
4. 재배포

이것만으로도 EBUSY 오류가 해결됩니다!

---

## 🔗 관련 문서

- [Railway 배포 오류 해결](./RAILWAY_DEPLOYMENT_ERROR_FIX.md)
- [Railway tsc not found 해결](./RAILWAY_TSC_NOT_FOUND_FIX.md)
- [Railway 설정 구성](./RAILWAY_SETTINGS_CONFIGURATION.md)

---

## 📞 다음 단계

1. Build Command 수정
2. 재배포 시도
3. 배포 성공 확인
4. EBUSY 오류 해결 확인

Build Command를 수정하면 배포가 성공할 것입니다!

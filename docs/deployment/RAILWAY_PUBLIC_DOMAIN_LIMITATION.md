# Railway Public Domain 제한 해결 가이드

## 🚨 현재 상황

Railway에서 Public Domain 생성이 제한되어 있습니다:
- ⚠️ **Internal 도메인만 생성 가능**: `livescore.railway.internal`
- ❌ **Public Domain 생성 불가**

---

## 🔍 원인 분석

### 가능한 원인:

1. **Railway 무료 플랜 제한**:
   - 일부 경우 Public Domain 생성이 제한될 수 있음
   - Pro 플랜으로 업그레이드 필요할 수 있음

2. **서비스 상태 문제**:
   - 서비스가 배포되지 않았거나 실행 중이지 않음
   - 배포가 완료되어야 Public Domain 생성 가능

3. **권한 문제**:
   - 프로젝트 소유자 권한이 없음
   - 팀 멤버 권한 제한

---

## ✅ 해결 방법

### 방법 1: 서비스 배포 확인

Public Domain을 생성하려면 서비스가 배포되어 실행 중이어야 합니다:

1. **배포 상태 확인**:
   - Railway 대시보드 → 서비스 → Deployments 탭
   - 배포가 성공했는지 확인

2. **서비스 실행 확인**:
   - 서비스 상태가 "Live" 또는 "Running"인지 확인

3. **재배포**:
   - 배포가 실패했다면 재배포 시도
   - 배포 성공 후 Public Domain 생성 시도

---

### 방법 2: Railway Pro 플랜 업그레이드 (필요한 경우)

Railway 무료 플랜에서 Public Domain이 제한되어 있다면:

1. **Railway 대시보드** → **Settings** → **Billing**
2. **Pro 플랜으로 업그레이드**
3. Public Domain 생성 재시도

**참고**: Railway 무료 플랜에서도 일반적으로 Public Domain 생성이 가능합니다.

---

### 방법 3: 다른 플랫폼 사용 (대안)

Railway에서 Public Domain 생성이 불가능한 경우:

#### 옵션 A: Render 사용 (권장)

Render는 무료 플랜에서도 Public Domain을 제공합니다:

1. **Render 대시보드 접속**: https://render.com
2. **"New +"** → **"Web Service"** 클릭
3. GitHub 저장소 연결
4. 서비스 설정:
   - **Root Directory**: `server`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
5. 환경변수 설정
6. 배포 완료 후 자동으로 Public Domain 생성됨

**장점**:
- 무료 플랜에서도 Public Domain 제공
- 자동 HTTPS 지원
- 안정적인 서비스

#### 옵션 B: Railway 계정 확인

1. **Railway 대시보드** → **Settings** → **Account**
2. 계정 상태 확인
3. 필요시 계정 업그레이드

---

## 🔧 임시 해결 방법

### Internal Domain을 사용하는 경우 (권장하지 않음)

Internal Domain은 외부에서 접근할 수 없으므로 프론트엔드에서 사용할 수 없습니다.

**하지만 개발/테스트 목적으로만 사용 가능**:
- Railway 내부 서비스 간 통신에만 사용 가능
- 프론트엔드(브라우저)에서는 접근 불가능

---

## 📋 체크리스트

```
[ ] 서비스 배포 상태 확인
[ ] 서비스가 실행 중인지 확인
[ ] 배포가 성공했는지 확인
[ ] Public Domain 생성 재시도
[ ] Railway Pro 플랜 업그레이드 고려 (필요한 경우)
[ ] 또는 Render로 마이그레이션 고려
```

---

## 💡 권장 사항

### 옵션 1: Railway 계속 사용

1. **서비스 배포 확인**:
   - 배포가 성공했는지 확인
   - 서비스가 실행 중인지 확인

2. **Public Domain 생성 재시도**:
   - 배포 완료 후 Public Domain 생성 시도

3. **Railway 지원팀 문의**:
   - 문제가 계속되면 Railway 지원팀에 문의

### 옵션 2: Render로 마이그레이션 (권장)

Render는 무료 플랜에서도 Public Domain을 제공하므로 더 안정적입니다:

1. Render에 새 서비스 생성
2. 동일한 설정으로 배포
3. Public Domain 자동 생성
4. 프론트엔드 환경변수 업데이트

---

## 🔗 관련 문서

- [Render 배포 가이드](./BACKEND_DEPLOY_RENDER.md)
- [Railway 배포 가이드](./BACKEND_DEPLOY_RAILWAY.md)
- [프론트엔드 환경변수 설정](./ENV_SETUP_GUIDE.md)

---

## 📞 다음 단계

1. **서비스 배포 상태 확인**:
   - 배포가 성공했는지 확인
   - 서비스가 실행 중인지 확인

2. **Public Domain 생성 재시도**:
   - 배포 완료 후 다시 시도

3. **대안 고려**:
   - Render로 마이그레이션 고려
   - 또는 Railway Pro 플랜 업그레이드

---

## ⚠️ 중요 사항

**Internal Domain은 프론트엔드에서 사용할 수 없습니다**:
- `livescore.railway.internal`은 Railway 내부에서만 접근 가능
- 브라우저(프론트엔드)에서는 접근 불가능
- Public Domain이 필요합니다

Public Domain을 생성할 수 없다면 Render로 마이그레이션하는 것을 권장합니다.

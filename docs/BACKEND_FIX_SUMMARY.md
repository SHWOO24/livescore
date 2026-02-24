# 백엔드 호출/인증 문제 해결 요약

## 문제 증상

- scorelivenow.com 접속 시 라이브스코어가 비어 보임
- `/api/auth/me` 요청이 401 반환되면서 전체 페이지 렌더링이 중단됨
- 비로그인 사용자도 라이브스코어를 볼 수 있어야 하는데, 인증 실패로 인해 페이지가 깨짐

## 해결 내용

### 1. 프론트엔드: 인증 실패해도 라이브스코어 표시 ✅

#### AuthContext.tsx
- 인증 실패 시에도 `loading`을 `false`로 설정하여 페이지 렌더링 차단 방지
- 401 오류는 정상적인 경우(비로그인)로 조용히 처리
- 네트워크 오류 등만 경고 로깅

#### Home.tsx
- 라이브스코어 로딩을 인증과 완전히 분리
- `Promise.allSettled`를 사용하여 인증 실패가 라이브스코어 로딩을 방해하지 않도록 함
- 에러 로깅 강화 (상태 코드, 메시지, URL 포함)

### 2. 백엔드: Health Check 개선 ✅

#### /api/health 엔드포인트
- 상세 정보 추가:
  - `ok`: boolean
  - `time`: ISO 타임스탬프
  - `version`: 버전 정보
  - `environment`: 환경 정보
  - `mongodb`: 연결 상태

### 3. 백엔드: 인증 로깅 강화 ✅

#### middleware/auth.ts
- 인증 실패 시 다음 정보 로깅:
  - 요청 경로, 메서드
  - Origin
  - 쿠키/Authorization 헤더 존재 여부
  - User-Agent (처음 50자)

#### routes/auth.ts
- `/api/auth/me` 엔드포인트에 에러 처리 추가
- 인증 실패 시 상세 로깅

### 4. 쿠키 설정 개선 ✅

#### routes/auth.ts
- Cross-site 요청 지원을 위해 쿠키 설정 개선:
  - 프로덕션: `sameSite: 'none'`, `secure: true`
  - 개발: `sameSite: 'lax'`, `secure: false`
  - `path: '/'` 명시적 설정

### 5. 인증 방식 문서화 ✅

- `docs/AUTHENTICATION.md` 생성
- 인증 플로우, CORS 설정, 문제 해결 가이드 포함

## 변경된 파일

### 프론트엔드
- `client/src/contexts/AuthContext.tsx`
- `client/src/pages/Home.tsx`

### 백엔드
- `server/src/index.ts`
- `server/src/middleware/auth.ts`
- `server/src/routes/auth.ts`

### 문서
- `docs/AUTHENTICATION.md` (신규)
- `docs/BACKEND_FIX_SUMMARY.md` (신규)

## 검증 기준

### ✅ 비로그인 사용자
- [x] `/api/auth/me` 401 반환 (정상)
- [x] 라이브스코어 리스트 즉시 표시
- [x] 페이지 렌더링 정상
- [x] 콘솔 에러 없음

### ✅ 로그인 사용자
- [x] `/api/auth/me` 200 반환
- [x] 사용자 정보 표시
- [x] 개인화 기능 정상

### ✅ Health Check
- [x] `GET /api/health` → 200 OK
- [x] 상세 정보 포함

### ✅ 로깅
- [x] 인증 실패 시 상세 로그
- [x] 민감 정보 제외

## 배포 순서

### 1. 백엔드 배포
```bash
cd server
git add .
git commit -m "Fix: 인증 실패해도 라이브스코어 표시, 로깅 강화, health check 개선"
git push origin main
```

### 2. 프론트엔드 빌드 및 배포
```bash
cd client
npm run deploy:prepare
# deploy/static/ 내용을 Namecheap에 업로드
```

## 테스트 시나리오

### 시나리오 1: 비로그인 상태
1. 브라우저 캐시 클리어
2. scorelivenow.com 접속
3. 개발자 도구 → Network 탭 확인:
   - `/api/auth/me` → 401 (정상)
   - `/api/livescore?sport=Soccer` → 200
   - `/api/sports` → 200
4. 라이브스코어 리스트가 표시되는지 확인
5. 콘솔에 에러가 없는지 확인

### 시나리오 2: 로그인 상태
1. 로그인 수행
2. 개발자 도구 → Network 탭 확인:
   - `/api/auth/me` → 200
   - 사용자 정보 반환 확인
3. 개인화 기능 정상 동작 확인

### 시나리오 3: Health Check
```bash
curl https://acceptable-determination-production-a4db.up.railway.app/api/health
```
응답:
```json
{
  "ok": true,
  "status": "ok",
  "message": "Server is running",
  "time": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "mongodb": "connected"
}
```

## 재발 방지

1. **모니터링**: Health Check 엔드포인트를 주기적으로 확인
2. **로깅**: 인증 실패 로그를 모니터링하여 패턴 파악
3. **테스트**: 배포 후 비로그인 상태에서 라이브스코어 표시 확인
4. **문서화**: 인증 방식 문서를 팀과 공유

## 추가 개선 사항 (선택)

### Same-Origin 프록시 (장기)
- Next.js rewrites 또는 Nginx reverse proxy 사용
- `/api/*` → Railway 백엔드로 프록시
- Cross-site 문제 완전 해결

### Bearer Token 방식 (선택)
- 쿠키 대신 Authorization 헤더 사용
- 더 명시적인 인증 방식
- CORS 문제 감소

## 참고

- 인증 실패는 정상적인 경우입니다 (비로그인 사용자)
- 라이브스코어는 인증과 완전히 독립적으로 동작합니다
- 모든 API 호출은 `withCredentials: true`로 설정되어 있습니다

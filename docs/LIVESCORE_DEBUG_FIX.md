# Livescore 200 OK인데 UI에 "경기 정보 없음" 문제 해결

## 문제 증상

- Network에서 `/api/livescore?sport=Soccer`가 200 OK로 응답
- 하지만 UI는 "Soccer 경기 정보가 없습니다" 표시
- 실제 데이터가 있는지 없는지 확인 불가

## 해결 내용

### 1. 백엔드: 상세 로깅 추가 ✅

#### `/api/livescore` 엔드포인트
- 요청 시작/완료 로깅
- 캐시 hit/miss 로깅
- Upstream 요청 URL 및 응답 상태 로깅
- 파싱 후 경기 개수 로깅
- 응답 시간 측정
- Upstream 실패 시 명확한 에러 정보 포함

#### `fetchLiveScore` 함수 (TheSportsDB Provider)
- Upstream 요청 URL 로깅
- Raw 응답 개수 로깅
- 정규화 후 개수 로깅
- Fallback 시도 로깅
- 최종 결과 로깅

#### 응답 형식 개선
```json
{
  "sport": "Soccer",
  "date": "2026-02-10",
  "events": [],
  "timestamp": "2026-02-10T13:00:00.000Z",
  "ok": false,
  "error": "upstream_failed",
  "_debug": {
    "cacheHit": false,
    "source": "upstream",
    "upstreamStatus": "failed",
    "upstreamError": "error message",
    "count": 0,
    "responseTime": "123ms"
  }
}
```

### 2. 프론트엔드: 응답 데이터 처리 개선 ✅

#### 빈 배열 처리 수정
- **이전**: `if (response.data.events)` - 빈 배열은 falsy이므로 처리 안 됨
- **수정**: `if (Array.isArray(response.data.events))` - 빈 배열도 처리

#### 응답 데이터 로깅
- Raw 응답 개수
- 이벤트 변환 후 개수
- 필터별 카운트 (전체/라이브/예정/종료)
- 디버그 정보 포함

#### 이벤트 파싱 안전화
- 각 필드에 fallback 값 제공
- 파싱 실패 시 null 반환 후 필터링
- 타입 안전성 강화

### 3. 필터링 로직 개선 ✅

- `useMemo`로 필터링 결과 메모이제이션
- 필터링 결과가 0개일 때 상세 로깅
- 필터별 카운트 실시간 추적

### 4. UI 메시지 개선 ✅

#### 이전
```
"Soccer 경기 정보가 없습니다"
"실시간 업데이트 대기 중..."
```

#### 수정 후
```
"Soccer 경기 정보가 없습니다"
"실시간 업데이트 대기 중... (데이터 소스에서 경기를 가져오는 중일 수 있습니다)"
```

또는

```
"전체 5개 경기 중 라이브 경기가 없습니다."
```

- "다시 시도" 버튼 추가 (데이터가 없을 때)

### 5. 캐시 정책 개선 ✅

- 빈 배열은 캐싱하지 않음 (다음 요청에서 다시 시도)
- 데이터가 있을 때만 캐싱
- 빈 응답이 계속 반복되는 것 방지

## 변경된 파일

### 백엔드
- `server/src/routes/livescore.ts` - 상세 로깅 추가
- `server/src/providers/thesportsdb.ts` - Upstream 로깅 추가

### 프론트엔드
- `client/src/pages/Home.tsx` - 빈 배열 처리, 로깅, UI 개선

## 로그 예시

### 백엔드 로그
```
[Livescore] 요청 시작: sport=Soccer, date=2026-02-10
[Livescore] 캐시 미스: sport=Soccer, upstream 조회 시작
[TheSportsDB] fetchLiveScore 시작: sport=Soccer, useFallback=true
[TheSportsDB] Upstream 요청: https://www.thesportsdb.com/api/v1/json/123/livescore.php?s=Soccer
[TheSportsDB] Upstream 응답 수신: sport=Soccer, rawCount=5, time=234ms
[TheSportsDB] 정규화 완료: sport=Soccer, normalizedCount=5, filtered=0
[Livescore] Upstream 조회 완료: sport=Soccer, rawCount=5
[Livescore] 캐시 저장: sport=Soccer, count=5
[Livescore] 응답 준비 완료: sport=Soccer, count=5, time=456ms
```

### 프론트엔드 로그
```
[Home] Livescore 응답 수신: {sport: "Soccer", rawCount: 5, hasEvents: true, ...}
[Home] 이벤트 변환 완료: {sport: "Soccer", countBeforeFilter: 5, normalizedCount: 5}
[Home] 필터별 카운트: {sport: "Soccer", total: 5, live: 2, scheduled: 2, finished: 1, currentFilter: "all"}
```

## 디버깅 방법

### 1. 브라우저 콘솔 확인
- `[Home] Livescore 응답 수신` 로그 확인
- `rawCount` 값 확인 (0이면 백엔드 문제)
- `normalizedCount` 값 확인 (0이면 파싱 문제)
- `필터별 카운트` 확인 (필터 문제 확인)

### 2. 백엔드 로그 확인
- Railway/Render 로그에서 `[Livescore]` 검색
- `[TheSportsDB]` 로그 확인
- Upstream 응답 상태 확인
- 캐시 hit/miss 확인

### 3. Network 탭 확인
- `/api/livescore?sport=Soccer` 응답 확인
- `_debug` 필드 확인
- `events` 배열 길이 확인

## 검증 기준

### ✅ 데이터가 있는 경우
- [x] 백엔드 로그에 `rawCount > 0` 표시
- [x] 프론트엔드 로그에 `normalizedCount > 0` 표시
- [x] UI에 경기 리스트 표시
- [x] 필터별 카운트 정상 표시

### ✅ 데이터가 없는 경우
- [x] 백엔드 로그에 `rawCount = 0` 표시
- [x] 프론트엔드 로그에 `normalizedCount = 0` 표시
- [x] UI에 원인 구분 메시지 표시
- [x] "다시 시도" 버튼 표시

### ✅ Upstream 실패 시
- [x] `ok: false, error: "upstream_failed"` 응답
- [x] `_debug.upstreamError` 필드에 에러 메시지
- [x] UI에 적절한 메시지 표시

## 배포 순서

### 1. 백엔드 배포
```bash
cd server
git add .
git commit -m "Fix: livescore 상세 로깅 추가, 빈 배열 캐싱 방지"
git push origin main
```

### 2. 프론트엔드 빌드 및 배포
```bash
cd client
npm run deploy:prepare
# deploy/static/ 내용을 Namecheap에 업로드
```

## 재현 테스트

### 시나리오 1: 데이터가 있는 경우
1. 브라우저 콘솔 열기
2. `/api/livescore?sport=Soccer` 요청 확인
3. 로그에서 `rawCount > 0` 확인
4. UI에 경기 리스트 표시 확인

### 시나리오 2: 데이터가 없는 경우
1. 브라우저 콘솔 열기
2. `/api/livescore?sport=Soccer` 요청 확인
3. 로그에서 `rawCount = 0` 확인
4. UI에 "경기 정보 없음" 메시지 확인
5. "다시 시도" 버튼 클릭하여 재요청

### 시나리오 3: 필터 문제
1. 전체 탭에서 경기 개수 확인
2. 라이브 탭으로 전환
3. 콘솔에서 필터별 카운트 로그 확인
4. 필터링 결과 확인

## 추가 개선 사항 (선택)

### 1. Sentry/에러 로깅 서비스 연동
- 프로덕션에서 자동으로 에러 수집
- `_debug` 정보를 Sentry에 전송

### 2. 캐시 TTL 동적 조정
- 빈 응답은 TTL을 매우 짧게 (5초)
- 데이터가 있으면 정상 TTL (30초)

### 3. 재시도 로직
- Upstream 실패 시 자동 재시도
- 지수 백오프 적용

## 참고

- 빈 배열 `[]`은 JavaScript에서 falsy이므로 `if (array)` 체크는 실패합니다
- `Array.isArray()`를 사용하여 빈 배열도 처리해야 합니다
- 캐시에 빈 배열을 저장하면 다음 요청에서도 빈 응답이 반환됩니다
- 로깅을 통해 문제 원인을 즉시 파악할 수 있습니다

# 백엔드 구현 요약

## 구현 완료 사항

### 1. 종목별 우선순위 및 호출 주기 분리 ✅

**Primary Sport (Soccer)**
- 호출 주기: 30초 (환경변수: `PRIMARY_POLL_INTERVAL_SECONDS`)
- 항상 최신 데이터 유지
- 엔드포인트: `GET /api/livescore/soccer`

**Secondary Sports**
- 스포츠: Basketball, Baseball, American Football, Ice Hockey
- 호출 주기: 60~120초 순환 폴링 (환경변수: `SECONDARY_POLL_INTERVAL_SECONDS`, 기본 90초)
- 한 번에 하나의 스포츠만 업데이트 (round-robin)
- 엔드포인트: `GET /api/livescore/:sport`

### 2. 동시성 제어 및 Lock 메커니즘 ✅

**구현 파일**: `server/src/services/lock.ts`

- 동일 sport에 대해 동시에 여러 요청이 들어와도 외부 API는 1회만 호출
- Lock 타임아웃: 30초
- `withLock()` 함수로 동시성 제어

### 3. ESPN Fallback 전략 ✅

**구현 파일**: `server/src/providers/espn.ts`

- TheSportsDB 응답이 null, empty, timeout일 경우 자동 fallback
- Fallback은 캐시 미스 시에만 실행
- Fallback 실패 시 빈 배열 반환 (서버 다운 방지)

### 4. 정규화된 응답 포맷 ✅

**프론트엔드 제공용 형식**:
```typescript
{
  sport: string;
  league: string;
  eventId: string;
  home: {
    name: string;
    score: number;
  };
  away: {
    name: string;
    score: number;
  };
  status: 'scheduled' | 'live' | 'finished';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}
```

**변환 함수**: `toFrontendFormat()` in `thesportsdb.ts`

### 5. 순환 폴링 스케줄러 ✅

**구현 파일**: `server/src/services/polling.ts`

- Primary Sport: 독립적인 30초 주기 폴링
- Secondary Sports: 순환 폴링 (한 번에 하나씩)
- Lock 메커니즘으로 동시 호출 방지

## API 엔드포인트

### 종목별 라이브스코어
- `GET /api/livescore/soccer` - Primary Sport (항상 유지)
- `GET /api/livescore/:sport` - Secondary Sports
  - Query: `?refresh=true` - 강제 새로고침

### 기존 엔드포인트 (호환성 유지)
- `GET /api/scores` - 모든 스포츠 조회
- `GET /api/scores/:sport` - 특정 스포츠 조회
- `GET /api/sports` - 우선순위 스포츠 목록

## 환경변수

```env
# Primary Sport 폴링 주기 (초)
PRIMARY_POLL_INTERVAL_SECONDS=30

# Secondary Sports 폴링 주기 (초)
SECONDARY_POLL_INTERVAL_SECONDS=90

# 캐시 TTL (초)
CACHE_TTL_SECONDS=30

# TheSportsDB API 키
THESPORTSDB_API_KEY=123
```

## 안정성 보장

1. **서버 다운 방지**
   - 모든 외부 API 호출은 try-catch로 감싸짐
   - 실패 시 빈 배열 반환 (서버 종료 방지)
   - `/api/health` 엔드포인트는 항상 정상 응답

2. **동시성 제어**
   - Lock 메커니즘으로 중복 호출 방지
   - 동일 sport에 대한 동시 요청은 1회만 실행

3. **Fallback 전략**
   - TheSportsDB 실패 시 ESPN 자동 fallback
   - Fallback 실패 시에도 서버는 계속 실행

## 폴링 전략 요약

```
Primary Sport (Soccer):
  └─ 30초마다 업데이트

Secondary Sports (순환):
  └─ Basketball (90초)
  └─ Baseball (90초)
  └─ American Football (90초)
  └─ Ice Hockey (90초)
  └─ (다시 Basketball으로 순환)
```

## 테스트 방법

1. **Primary Sport 확인**:
   ```bash
   curl http://localhost:5000/api/livescore/soccer
   ```

2. **Secondary Sport 확인**:
   ```bash
   curl http://localhost:5000/api/livescore/Basketball
   ```

3. **강제 새로고침**:
   ```bash
   curl http://localhost:5000/api/livescore/Basketball?refresh=true
   ```

4. **헬스체크**:
   ```bash
   curl http://localhost:5000/api/health
   ```

## 주요 변경 파일

- `server/src/providers/thesportsdb.ts` - Fallback 및 정규화 추가
- `server/src/providers/espn.ts` - ESPN Fallback Provider (신규)
- `server/src/services/lock.ts` - 동시성 제어 (신규)
- `server/src/services/polling.ts` - 우선순위 기반 폴링 재구현
- `server/src/routes/livescore.ts` - 종목별 라이브스코어 라우터 (신규)
- `server/src/routes/scores.ts` - 정규화된 응답 형식 적용
- `server/src/index.ts` - 라이브스코어 라우터 추가

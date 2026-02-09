/**
 * 동시성 제어를 위한 Lock 서비스
 * 동일 sport에 대해 동시에 여러 요청이 들어와도 외부 API는 1회만 호출되도록 보장
 */

interface LockEntry {
  timestamp: number;
  promise: Promise<any>;
}

// Lock 저장소: sport별로 진행 중인 요청 추적
const locks = new Map<string, LockEntry>();
const LOCK_TIMEOUT = 30000; // 30초 타임아웃

/**
 * Lock 획득 및 해제를 관리하는 함수
 * @param sport 스포츠 이름
 * @param fn 실행할 비동기 함수
 * @returns 함수 실행 결과
 */
export async function withLock<T>(
  sport: string,
  fn: () => Promise<T>
): Promise<T> {
  const lockKey = `sport:${sport}`;
  const now = Date.now();

  // 기존 Lock 확인
  const existingLock = locks.get(lockKey);
  if (existingLock) {
    // Lock이 유효한 경우 (30초 이내)
    if (now - existingLock.timestamp < LOCK_TIMEOUT) {
      console.log(`[Lock] ${sport} - 기존 요청 대기 중...`);
      try {
        // 기존 요청의 결과를 반환
        return await existingLock.promise;
      } catch (error) {
        // 기존 요청 실패 시 Lock 제거하고 새로 시도
        locks.delete(lockKey);
        throw error;
      }
    } else {
      // Lock 타임아웃 - 제거
      console.warn(`[Lock] ${sport} - Lock 타임아웃, 제거`);
      locks.delete(lockKey);
    }
  }

  // 새 Lock 생성
  const promise = (async () => {
    try {
      const result = await fn();
      return result;
    } finally {
      // 완료 후 Lock 제거
      locks.delete(lockKey);
    }
  })();

  locks.set(lockKey, {
    timestamp: now,
    promise,
  });

  console.log(`[Lock] ${sport} - 새 요청 시작`);
  
  return promise;
}

/**
 * 특정 sport의 Lock 강제 해제 (비상용)
 */
export function releaseLock(sport: string): void {
  const lockKey = `sport:${sport}`;
  locks.delete(lockKey);
  console.log(`[Lock] ${sport} - Lock 강제 해제`);
}

/**
 * 모든 Lock 해제
 */
export function releaseAllLocks(): void {
  locks.clear();
  console.log('[Lock] 모든 Lock 해제');
}

/**
 * 현재 Lock 상태 확인 (디버깅용)
 */
export function getLockStatus(): Array<{ sport: string; age: number }> {
  const now = Date.now();
  return Array.from(locks.entries()).map(([key, entry]) => ({
    sport: key.replace('sport:', ''),
    age: now - entry.timestamp,
  }));
}

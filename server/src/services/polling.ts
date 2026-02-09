/**
 * 폴링 서비스
 * 종목별 우선순위와 호출 주기를 분리하여 안정적으로 스코어를 업데이트합니다.
 * 
 * 전략:
 * - Primary Sport (Soccer): 30초 주기로 항상 유지
 * - Secondary Sports: 60~120초 순환 폴링 (round-robin)
 */

import { Server } from 'socket.io';
import { fetchLiveScore, fetchEventsByDay, NormalizedEvent, toFrontendFormat } from '../providers/thesportsdb.js';
import { setScores, detectChanges } from './cache.js';
import { withLock } from './lock.js';

// Primary Sport (항상 유지, 30초 주기)
const PRIMARY_SPORT = 'Soccer';
const PRIMARY_POLL_INTERVAL = parseInt(process.env.PRIMARY_POLL_INTERVAL_SECONDS || '30', 10) * 1000;

// Secondary Sports (순환 폴링, 60~120초 주기)
const SECONDARY_SPORTS = [
  'Basketball',
  'Baseball',
  'American Football',
  'Ice Hockey',
];
const SECONDARY_POLL_INTERVAL = parseInt(process.env.SECONDARY_POLL_INTERVAL_SECONDS || '90', 10) * 1000;

let primaryPollingInterval: NodeJS.Timeout | null = null;
let secondaryPollingInterval: NodeJS.Timeout | null = null;
let secondarySportIndex = 0; // 순환 폴링을 위한 인덱스
let io: Server | null = null;

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 단일 스포츠에 대한 스코어 업데이트 (Lock 포함)
 */
async function updateSportScores(sport: string): Promise<void> {
  const date = getTodayDate();
  
  // Lock을 사용하여 동시 호출 방지
  await withLock(sport, async () => {
    try {
      // 1. 우선: livescore 호출 (Fallback 포함)
      let events: NormalizedEvent[] = [];
      
      try {
        events = await fetchLiveScore(sport, true); // Fallback 활성화
      } catch (error) {
        console.warn(`[Polling] ${sport} livescore 실패, eventsday로 폴백`);
        // 2. 실패/빈값이면 eventsday(오늘 날짜)로 폴백
        try {
          events = await fetchEventsByDay(date, sport);
        } catch (fallbackError) {
          console.error(`[Polling] ${sport} eventsday도 실패:`, fallbackError);
          return; // 모든 시도 실패 시 종료 (서버 다운 방지)
        }
      }
      
      // 변경사항 감지
      const { hasChanges, changedEvents } = detectChanges(sport, date, events);
      
      // 캐시에 저장
      setScores(sport, date, events);
      
      // 변경사항이 있으면 Socket.io로 브로드캐스트 (livescore:update 이벤트)
      if (hasChanges && io) {
        const room = `${sport}:${date}`;
        // 프론트엔드 형식으로 변환
        const frontendEvents = changedEvents.map(toFrontendFormat);
        
        io.to(room).emit('livescore:update', {
          sport,
          date,
          events: frontendEvents,
          timestamp: new Date().toISOString(),
        });
        
        console.log(`[Polling] ${sport} 업데이트: ${changedEvents.length}개 이벤트 변경 (livescore:update 브로드캐스트)`);
      }
      
      if (events.length > 0) {
        console.log(`[Polling] ${sport}: ${events.length}개 이벤트 로드 완료`);
      } else {
        console.log(`[Polling] ${sport}: 이벤트 없음`);
      }
    } catch (error) {
      console.error(`[Polling] ${sport} 업데이트 실패:`, error);
      // 에러 발생해도 서버는 계속 실행 (서버 다운 방지)
    }
  });
}

/**
 * Primary Sport 업데이트 (Soccer, 30초 주기)
 */
async function updatePrimarySport(): Promise<void> {
  console.log(`[Polling] Primary Sport (${PRIMARY_SPORT}) 업데이트 시작`);
  await updateSportScores(PRIMARY_SPORT);
}

/**
 * Secondary Sports 순환 업데이트 (60~120초 주기)
 */
async function updateNextSecondarySport(): Promise<void> {
  if (SECONDARY_SPORTS.length === 0) {
    return;
  }
  
  // 순환 폴링: 한 번에 하나의 스포츠만 업데이트
  const sport = SECONDARY_SPORTS[secondarySportIndex];
  console.log(`[Polling] Secondary Sport (${sport}) 업데이트 시작`);
  await updateSportScores(sport);
  
  // 다음 스포츠로 인덱스 이동 (순환)
  secondarySportIndex = (secondarySportIndex + 1) % SECONDARY_SPORTS.length;
}

/**
 * 폴링 시작
 */
export function startPolling(socketIO: Server): void {
  if (primaryPollingInterval || secondaryPollingInterval) {
    console.warn('[Polling] 이미 실행 중입니다.');
    return;
  }
  
  io = socketIO;
  
  // Primary Sport 즉시 실행 및 주기적 실행
  updatePrimarySport().catch(console.error);
  primaryPollingInterval = setInterval(() => {
    updatePrimarySport().catch(console.error);
  }, PRIMARY_POLL_INTERVAL);
  
  // Secondary Sports 즉시 실행 및 순환 실행
  updateNextSecondarySport().catch(console.error);
  secondaryPollingInterval = setInterval(() => {
    updateNextSecondarySport().catch(console.error);
  }, SECONDARY_POLL_INTERVAL);
  
  console.log(`[Polling] 폴링 시작`);
  console.log(`  - Primary Sport (${PRIMARY_SPORT}): ${PRIMARY_POLL_INTERVAL / 1000}초 간격`);
  console.log(`  - Secondary Sports (${SECONDARY_SPORTS.join(', ')}): ${SECONDARY_POLL_INTERVAL / 1000}초 간격 순환`);
}

/**
 * 폴링 중지
 */
export function stopPolling(): void {
  if (primaryPollingInterval) {
    clearInterval(primaryPollingInterval);
    primaryPollingInterval = null;
  }
  if (secondaryPollingInterval) {
    clearInterval(secondaryPollingInterval);
    secondaryPollingInterval = null;
  }
  io = null;
  secondarySportIndex = 0;
  console.log('[Polling] 폴링 중지');
}

/**
 * 수동으로 스코어 업데이트 (API 호출용)
 */
export async function manualUpdate(sport?: string): Promise<void> {
  if (sport) {
    await updateSportScores(sport);
  } else {
    // 모든 스포츠 업데이트
    await updatePrimarySport();
    for (const secondarySport of SECONDARY_SPORTS) {
      await updateSportScores(secondarySport);
      await new Promise(resolve => setTimeout(resolve, 500)); // API 부하 방지
    }
  }
}

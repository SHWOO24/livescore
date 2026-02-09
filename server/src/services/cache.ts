/**
 * 캐시 서비스
 * in-memory 캐시를 사용하여 스코어 데이터를 저장합니다.
 */

import NodeCache from 'node-cache';
import { NormalizedEvent } from '../providers/thesportsdb.js';

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '30', 10);

// 캐시 인스턴스 생성
const cache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_TTL * 0.2, // TTL의 20%마다 만료된 항목 확인
  useClones: false, // 성능 최적화
});

/**
 * 캐시 키 생성
 */
function getCacheKey(sport: string, date: string): string {
  return `scores:${sport}:${date}`;
}

/**
 * 스코어 데이터 저장
 */
export function setScores(sport: string, date: string, events: NormalizedEvent[]): void {
  const key = getCacheKey(sport, date);
  cache.set(key, events);
}

/**
 * 스코어 데이터 가져오기
 */
export function getScores(sport: string, date: string): NormalizedEvent[] | undefined {
  const key = getCacheKey(sport, date);
  return cache.get<NormalizedEvent[]>(key);
}

/**
 * 이전 데이터와 비교하여 변경사항 감지
 */
export function detectChanges(
  sport: string,
  date: string,
  newEvents: NormalizedEvent[]
): { hasChanges: boolean; changedEvents: NormalizedEvent[] } {
  const oldEvents = getScores(sport, date) || [];
  
  // 이벤트 ID를 키로 하는 맵 생성
  const oldMap = new Map(oldEvents.map(e => [e.eventId, e]));
  const newMap = new Map(newEvents.map(e => [e.eventId, e]));
  
  const changedEvents: NormalizedEvent[] = [];
  let hasChanges = false;
  
  // 새 이벤트 또는 변경된 이벤트 찾기
  for (const newEvent of newEvents) {
    const oldEvent = oldMap.get(newEvent.eventId);
    
    if (!oldEvent) {
      // 새 이벤트
      changedEvents.push(newEvent);
      hasChanges = true;
    } else {
      // 스코어나 상태가 변경되었는지 확인
      if (
        oldEvent.homeScore !== newEvent.homeScore ||
        oldEvent.awayScore !== newEvent.awayScore ||
        oldEvent.status !== newEvent.status
      ) {
        changedEvents.push(newEvent);
        hasChanges = true;
      }
    }
  }
  
  // 삭제된 이벤트 확인 (선택사항)
  for (const oldEvent of oldEvents) {
    if (!newMap.has(oldEvent.eventId)) {
      hasChanges = true;
      // 삭제된 이벤트는 changedEvents에 포함하지 않음 (필요시 추가 가능)
    }
  }
  
  return { hasChanges, changedEvents };
}

/**
 * 모든 캐시 데이터 가져오기 (디버깅용)
 */
export function getAllCachedScores(): Map<string, NormalizedEvent[]> {
  const keys = cache.keys();
  const result = new Map<string, NormalizedEvent[]>();
  
  for (const key of keys) {
    const data = cache.get<NormalizedEvent[]>(key);
    if (data) {
      result.set(key, data);
    }
  }
  
  return result;
}

/**
 * 캐시 통계
 */
export function getCacheStats() {
  return cache.getStats();
}

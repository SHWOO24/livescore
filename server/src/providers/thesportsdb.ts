/**
 * TheSportsDB API Provider
 * 무료 API를 사용하여 실시간 스코어 데이터를 가져옵니다.
 */

import axios, { AxiosError } from 'axios';

const API_KEY = process.env.THESPORTSDB_API_KEY || '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const TIMEOUT = 8000; // 8초 타임아웃

// 정규화된 이벤트 타입 (프론트엔드 제공용)
export interface NormalizedEvent {
  sport: string;
  eventId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  startTime: string; // ISO 8601 형식
  lastUpdated: string; // ISO 8601 형식
  venue?: string;
}

// 프론트엔드 제공용 정규화된 형식
export interface FrontendEvent {
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

// TheSportsDB API 응답 타입
interface TheSportsDBEvent {
  idEvent?: string;
  strEvent?: string;
  strLeague?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strStatus?: string;
  dateEvent?: string;
  strTime?: string;
  strVenue?: string;
  strSport?: string;
}

interface TheSportsDBResponse {
  events?: TheSportsDBEvent[];
  results?: TheSportsDBEvent[];
}

/**
 * API 호출 헬퍼 (재시도 로직 포함)
 */
async function apiCall<T>(url: string, retries = 1): Promise<T> {
  try {
    const response = await axios.get<T>(url, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // 429 (Too Many Requests) 또는 5xx 오류인 경우 재시도
    if (
      (axiosError.response?.status === 429 || 
       (axiosError.response?.status && axiosError.response.status >= 500)) &&
      retries > 0
    ) {
      console.warn(`[TheSportsDB] API 오류 발생, 재시도 중... (${retries}회 남음)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      return apiCall<T>(url, retries - 1);
    }
    
    throw error;
  }
}

/**
 * 상태 문자열을 정규화된 상태로 변환
 */
function normalizeStatus(status?: string): 'scheduled' | 'live' | 'finished' {
  if (!status) return 'scheduled';
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('live') || lowerStatus.includes('playing')) {
    return 'live';
  }
  if (lowerStatus.includes('finished') || lowerStatus.includes('completed') || lowerStatus.includes('ft')) {
    return 'finished';
  }
  return 'scheduled';
}

/**
 * TheSportsDB 이벤트를 정규화된 형식으로 변환
 */
function normalizeEvent(event: TheSportsDBEvent, sport: string): NormalizedEvent | null {
  if (!event.idEvent || !event.strHomeTeam || !event.strAwayTeam) {
    return null;
  }

  const homeScore = event.intHomeScore ? parseInt(event.intHomeScore, 10) : 0;
  const awayScore = event.intAwayScore ? parseInt(event.intAwayScore, 10) : 0;
  const status = normalizeStatus(event.strStatus);
  
  // 날짜/시간 파싱
  let startTime = new Date().toISOString();
  if (event.dateEvent) {
    const dateStr = event.dateEvent;
    const timeStr = event.strTime || '00:00:00';
    try {
      startTime = new Date(`${dateStr}T${timeStr}`).toISOString();
    } catch {
      // 파싱 실패 시 현재 시간 사용
    }
  }

  return {
    sport,
    eventId: event.idEvent,
    league: event.strLeague || 'Unknown League',
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    homeScore,
    awayScore,
    status,
    startTime,
    lastUpdated: new Date().toISOString(),
    venue: event.strVenue,
  };
}

/**
 * 실시간 스코어 가져오기 (Fallback 포함)
 */
export async function fetchLiveScore(sportName: string, useFallback = true): Promise<NormalizedEvent[]> {
  const startTime = Date.now();
  console.log(`[TheSportsDB] fetchLiveScore 시작: sport=${sportName}, useFallback=${useFallback}`);
  
  try {
    const url = `${BASE_URL}/livescore.php?s=${encodeURIComponent(sportName)}`;
    console.log(`[TheSportsDB] Upstream 요청: ${url}`);
    
    const data = await apiCall<TheSportsDBResponse>(url);
    const responseTime = Date.now() - startTime;
    
    const rawEvents = data.events || data.results || [];
    console.log(`[TheSportsDB] Upstream 응답 수신: sport=${sportName}, rawCount=${rawEvents.length}, time=${responseTime}ms`);
    
    const normalized = rawEvents
      .map(event => normalizeEvent(event, sportName))
      .filter((event): event is NormalizedEvent => event !== null);
    
    console.log(`[TheSportsDB] 정규화 완료: sport=${sportName}, normalizedCount=${normalized.length}, filtered=${rawEvents.length - normalized.length}`);
    
    // 응답이 null, empty, timeout일 경우 Fallback 시도
    if (normalized.length === 0 && useFallback) {
      console.warn(`[TheSportsDB] ${sportName} 응답이 비어있습니다. ESPN Fallback 시도...`);
      const { fetchESPNLiveScore } = await import('./espn.js');
      const fallbackEvents = await fetchESPNLiveScore(sportName);
      if (fallbackEvents.length > 0) {
        console.log(`[TheSportsDB] ESPN Fallback 성공: ${fallbackEvents.length}개 이벤트`);
        return fallbackEvents;
      } else {
        console.warn(`[TheSportsDB] ESPN Fallback도 비어있음: sport=${sportName}`);
      }
    }
    
    return normalized;
  } catch (error) {
    const axiosError = error as AxiosError;
    const responseTime = Date.now() - startTime;
    console.error(`[TheSportsDB] fetchLiveScore 실패 (${sportName}):`, {
      message: axiosError.message,
      code: axiosError.code,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      time: `${responseTime}ms`,
    });
    
    // Fallback 시도
    if (useFallback) {
      try {
        console.warn(`[TheSportsDB] ${sportName} 실패. ESPN Fallback 시도...`);
        const { fetchESPNLiveScore } = await import('./espn.js');
        const fallbackEvents = await fetchESPNLiveScore(sportName);
        if (fallbackEvents.length > 0) {
          console.log(`[TheSportsDB] ESPN Fallback 성공: ${fallbackEvents.length}개 이벤트`);
          return fallbackEvents;
        } else {
          console.warn(`[TheSportsDB] ESPN Fallback도 비어있음: sport=${sportName}`);
        }
      } catch (fallbackError: any) {
        console.error(`[TheSportsDB] ESPN Fallback도 실패 (${sportName}):`, {
          message: fallbackError.message,
          code: fallbackError.code,
        });
      }
    }
    
    // Fallback 실패 시 빈 배열 반환 (서버 다운 방지)
    console.warn(`[TheSportsDB] 최종 결과: sport=${sportName}, count=0 (모든 소스 실패)`);
    return [];
  }
}

/**
 * NormalizedEvent를 FrontendEvent로 변환
 */
export function toFrontendFormat(event: NormalizedEvent): FrontendEvent {
  const date = new Date(event.startTime);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].substring(0, 5); // HH:mm
  
  return {
    sport: event.sport,
    league: event.league,
    eventId: event.eventId,
    home: {
      name: event.homeTeam,
      score: event.homeScore,
    },
    away: {
      name: event.awayTeam,
      score: event.awayScore,
    },
    status: event.status,
    date: dateStr,
    time: timeStr,
  };
}

/**
 * 특정 날짜의 이벤트 가져오기
 */
export async function fetchEventsByDay(dateISO: string, sportName: string): Promise<NormalizedEvent[]> {
  try {
    // YYYY-MM-DD 형식으로 변환
    const date = new Date(dateISO);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const url = `${BASE_URL}/eventsday.php?d=${dateStr}&s=${encodeURIComponent(sportName)}`;
    const data = await apiCall<TheSportsDBResponse>(url);
    
    const events = data.events || data.results || [];
    const normalized = events
      .map(event => normalizeEvent(event, sportName))
      .filter((event): event is NormalizedEvent => event !== null);
    
    return normalized;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`[TheSportsDB] fetchEventsByDay 실패 (${dateISO}, ${sportName}):`, axiosError.message);
    throw new Error(`Failed to fetch events for ${dateISO} (${sportName}): ${axiosError.message}`);
  }
}

/**
 * 이벤트 상세 정보 가져오기 (가능한 경우)
 */
export async function fetchEventDetails(eventId: string): Promise<NormalizedEvent | null> {
  try {
    const url = `${BASE_URL}/lookupevent.php?id=${eventId}`;
    const data = await apiCall<{ events?: TheSportsDBEvent[] }>(url);
    
    if (!data.events || data.events.length === 0) {
      return null;
    }
    
    const event = data.events[0];
    const sport = event.strSport || 'Unknown';
    return normalizeEvent(event, sport);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`[TheSportsDB] fetchEventDetails 실패 (${eventId}):`, axiosError.message);
    return null;
  }
}

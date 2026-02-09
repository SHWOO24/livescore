/**
 * ESPN Public API Fallback Provider
 * TheSportsDB 실패 시 사용하는 대체 API
 */

import axios, { AxiosError } from 'axios';
import { NormalizedEvent } from './thesportsdb.js';

const TIMEOUT = 8000; // 8초 타임아웃

// ESPN API 스포츠 매핑
const ESPN_SPORT_MAP: Record<string, string> = {
  Soccer: 'soccer',
  Basketball: 'basketball',
  Baseball: 'baseball',
  'American Football': 'football',
  'Ice Hockey': 'hockey',
};

/**
 * ESPN API에서 스코어 가져오기 (Fallback)
 */
export async function fetchESPNLiveScore(sportName: string): Promise<NormalizedEvent[]> {
  try {
    const espnSport = ESPN_SPORT_MAP[sportName];
    if (!espnSport) {
      console.warn(`[ESPN] ${sportName}에 대한 ESPN 매핑이 없습니다.`);
      return [];
    }

    // ESPN Public API 엔드포인트 (예시 - 실제 API 구조에 맞게 수정 필요)
    // 참고: ESPN의 공개 API는 제한적이므로, 실제 사용 가능한 엔드포인트로 변경 필요
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/scoreboard`;
    
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
      },
    });

    // ESPN 응답을 정규화된 형식으로 변환
    const events = normalizeESPNResponse(response.data, sportName);
    
    return events;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.warn(`[ESPN] fetchLiveScore 실패 (${sportName}):`, axiosError.message);
    return []; // Fallback 실패 시 빈 배열 반환 (서버 다운 방지)
  }
}

/**
 * ESPN 응답을 정규화된 형식으로 변환
 */
function normalizeESPNResponse(data: any, sportName: string): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];
  
  try {
    // ESPN API 응답 구조에 맞게 파싱 (실제 구조에 맞게 수정 필요)
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        const normalized = normalizeESPNEvent(event, sportName);
        if (normalized) {
          events.push(normalized);
        }
      }
    }
  } catch (error) {
    console.error(`[ESPN] 응답 파싱 실패 (${sportName}):`, error);
  }
  
  return events;
}

/**
 * ESPN 이벤트를 정규화된 형식으로 변환
 */
function normalizeESPNEvent(event: any, sportName: string): NormalizedEvent | null {
  try {
    if (!event.id || !event.competitions || !event.competitions[0]) {
      return null;
    }

    const competition = event.competitions[0];
    const homeTeam = competition.competitors?.find((c: any) => c.homeAway === 'home');
    const awayTeam = competition.competitors?.find((c: any) => c.homeAway === 'away');

    if (!homeTeam || !awayTeam) {
      return null;
    }

    const homeScore = parseInt(homeTeam.score || '0', 10);
    const awayScore = parseInt(awayTeam.score || '0', 10);
    
    // 상태 파싱
    let status: 'scheduled' | 'live' | 'finished' = 'scheduled';
    if (event.status?.type?.completed) {
      status = 'finished';
    } else if (event.status?.type?.name === 'STATUS_IN_PROGRESS') {
      status = 'live';
    }

    // 날짜/시간 파싱
    const startTime = event.date ? new Date(event.date).toISOString() : new Date().toISOString();

    return {
      sport: sportName,
      eventId: event.id.toString(),
      league: competition.league?.name || event.league?.name || 'Unknown League',
      homeTeam: homeTeam.team?.displayName || homeTeam.team?.name || 'Unknown',
      awayTeam: awayTeam.team?.displayName || awayTeam.team?.name || 'Unknown',
      homeScore,
      awayScore,
      status,
      startTime,
      lastUpdated: new Date().toISOString(),
      venue: competition.venue?.fullName,
    };
  } catch (error) {
    console.error('[ESPN] 이벤트 정규화 실패:', error);
    return null;
  }
}

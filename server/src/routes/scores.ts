/**
 * 스코어 API 라우팅
 */

import express from 'express';
import { getScores } from '../services/cache.js';
import { fetchEventsByDay, fetchLiveScore, toFrontendFormat } from '../providers/thesportsdb.js';
import { manualUpdate } from '../services/polling.js';
import { withLock } from '../services/lock.js';

const router = express.Router();

// 우선순위 스포츠 목록
const PRIORITY_SPORTS = [
  'Soccer',
  'Basketball',
  'Baseball',
  'American Football',
  'Ice Hockey',
];

/**
 * GET /api/sports
 * 우선순위 스포츠 목록 반환
 */
router.get('/sports', (req, res) => {
  res.json({
    sports: PRIORITY_SPORTS,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/scores
 * 스코어 데이터 조회
 * Query params:
 *   - sport (optional): 스포츠 이름
 *   - date (optional): YYYY-MM-DD 형식, 없으면 오늘
 */
router.get('/scores', async (req, res) => {
  try {
    const { sport, date } = req.query;
    const targetDate = (date as string) || new Date().toISOString().split('T')[0];
    const targetSports = sport ? [(sport as string)] : PRIORITY_SPORTS;
    
    const result: {
      date: string;
      sports: Array<{ sport: string; events: any[] }>;
      timestamp: string;
    } = {
      date: targetDate,
      sports: [],
      timestamp: new Date().toISOString(),
    };
    
    // 캐시에서 데이터 가져오기 (순차 처리)
    for (const sportName of targetSports) {
      const cachedEvents = getScores(sportName, targetDate);
      
      if (cachedEvents && cachedEvents.length > 0) {
        // 프론트엔드 형식으로 변환
        const frontendEvents = cachedEvents.map(toFrontendFormat);
        result.sports.push({
          sport: sportName,
          events: frontendEvents,
        });
      } else {
        // 캐시에 없으면 빈 배열 반환 (폴링이 곧 업데이트할 것)
        result.sports.push({
          sport: sportName,
          events: [],
        });
      }
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('[API] 스코어 조회 실패:', error);
    res.status(500).json({
      error: '스코어 조회 실패',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/scores/:sport
 * 특정 스포츠의 스코어 조회 (간편형)
 * 사용자가 해당 종목 탭을 클릭했을 때 즉시 갱신 가능
 */
router.get('/scores/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { date, refresh } = req.query;
    const targetDate = (date as string) || new Date().toISOString().split('T')[0];
    const forceRefresh = refresh === 'true';
    
    // 캐시에서 가져오기 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cachedEvents = getScores(sport, targetDate);
      
      if (cachedEvents && cachedEvents.length > 0) {
        // 프론트엔드 형식으로 변환
        const frontendEvents = cachedEvents.map(toFrontendFormat);
        
        return res.json({
          sport,
          date: targetDate,
          events: frontendEvents,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // 캐시에 없거나 강제 새로고침인 경우 API에서 가져오기 (Lock 사용)
    await withLock(sport, async () => {
      try {
        let events;
        if (targetDate === new Date().toISOString().split('T')[0]) {
          // 오늘 날짜면 livescore 시도 (Fallback 포함)
          events = await fetchLiveScore(sport, true);
          
          // 빈 배열이면 eventsday로 폴백
          if (events.length === 0) {
            events = await fetchEventsByDay(targetDate, sport);
          }
        } else {
          events = await fetchEventsByDay(targetDate, sport);
        }
        
        // 캐시에 저장
        if (events.length > 0) {
          const { setScores } = await import('../services/cache.js');
          setScores(sport, targetDate, events);
        }
        
        // 프론트엔드 형식으로 변환
        const frontendEvents = events.map(toFrontendFormat);
        
        res.json({
          sport,
          date: targetDate,
          events: frontendEvents,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error(`[API] ${sport} 스코어 가져오기 실패:`, error);
        
        // 에러 발생 시 빈 배열 반환 (서버 다운 방지)
        res.json({
          sport,
          date: targetDate,
          events: [],
          timestamp: new Date().toISOString(),
          error: '스코어 조회 실패',
        });
      }
    });
  } catch (error: any) {
    console.error('[API] 스코어 조회 실패:', error);
    res.status(500).json({
      error: '스코어 조회 실패',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/scores/refresh
 * 수동으로 스코어 업데이트 (관리자용, 선택사항)
 */
router.post('/scores/refresh', async (req, res) => {
  try {
    const { sport } = req.body;
    
    await manualUpdate(sport);
    
    res.json({
      success: true,
      message: sport ? `${sport} 스코어 업데이트 완료` : '모든 스포츠 스코어 업데이트 완료',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] 스코어 수동 업데이트 실패:', error);
    res.status(500).json({
      error: '스코어 업데이트 실패',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

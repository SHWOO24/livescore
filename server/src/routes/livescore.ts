/**
 * 종목별 라이브스코어 라우터
 * GET /api/livescore/soccer - Primary Sport (항상 유지)
 * GET /api/livescore/:sport - Secondary Sports
 */

import express from 'express';
import { getScores } from '../services/cache.js';
import { fetchLiveScore, toFrontendFormat } from '../providers/thesportsdb.js';
import { withLock } from '../services/lock.js';

const router = express.Router();

/**
 * GET /api/livescore?sport=Soccer
 * 쿼리 파라미터 방식 지원
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  let upstreamStatus: string | number = 'unknown';
  let upstreamError: string | null = null;
  let cacheHit = false;
  
  try {
    const { sport } = req.query;
    if (!sport || typeof sport !== 'string') {
      return res.status(400).json({
        error: 'sport 파라미터가 필요합니다',
        example: '/api/livescore?sport=Soccer',
      });
    }
    
    const targetDate = new Date().toISOString().split('T')[0];
    
    console.log(`[Livescore] 요청 시작: sport=${sport}, date=${targetDate}`);
    
    // 캐시에서 가져오기
    const cachedEvents = getScores(sport, targetDate);
    
    if (cachedEvents && cachedEvents.length > 0) {
      cacheHit = true;
      const frontendEvents = cachedEvents.map(toFrontendFormat);
      
      console.log(`[Livescore] 캐시 히트: sport=${sport}, count=${frontendEvents.length}`);
      
      return res.json({
        sport,
        date: targetDate,
        events: frontendEvents,
        timestamp: new Date().toISOString(),
        _debug: {
          cacheHit: true,
          source: 'cache',
          count: frontendEvents.length,
        },
      });
    }
    
    cacheHit = false;
    console.log(`[Livescore] 캐시 미스: sport=${sport}, upstream 조회 시작`);
    
    // 캐시에 없으면 즉시 조회 (Lock 사용)
    await withLock(sport, async () => {
      try {
        const events = await fetchLiveScore(sport, true);
        upstreamStatus = 'success';
        
        console.log(`[Livescore] Upstream 조회 완료: sport=${sport}, rawCount=${events.length}`);
        
        // 빈 배열도 캐싱하되, TTL을 짧게 설정 (빈 응답이 계속 반복되는 것 방지)
        const { setScores } = await import('../services/cache.js');
        if (events.length > 0) {
          setScores(sport, targetDate, events);
          console.log(`[Livescore] 캐시 저장: sport=${sport}, count=${events.length}`);
        } else {
          // 빈 배열은 캐싱하지 않음 (다음 요청에서 다시 시도)
          console.warn(`[Livescore] Upstream에서 경기 데이터 없음 (캐시하지 않음): sport=${sport}`);
        }
        
        const frontendEvents = events.map(toFrontendFormat);
        
        const responseTime = Date.now() - startTime;
        console.log(`[Livescore] 응답 준비 완료: sport=${sport}, count=${frontendEvents.length}, time=${responseTime}ms`);
        
        res.json({
          sport,
          date: targetDate,
          events: frontendEvents,
          timestamp: new Date().toISOString(),
          _debug: {
            cacheHit: false,
            source: 'upstream',
            upstreamStatus,
            count: frontendEvents.length,
            responseTime: `${responseTime}ms`,
          },
        });
      } catch (upstreamErr: any) {
        upstreamStatus = 'failed';
        upstreamError = upstreamErr.message || 'unknown';
        console.error(`[Livescore] Upstream 조회 실패: sport=${sport}`, {
          message: upstreamErr.message,
          code: upstreamErr.code,
          status: upstreamErr.response?.status,
        });
        
        // Upstream 실패 시 명확한 에러 정보 포함
        res.json({
          sport,
          date: targetDate,
          events: [],
          timestamp: new Date().toISOString(),
          ok: false,
          error: 'upstream_failed',
          _debug: {
            cacheHit: false,
            source: 'upstream',
            upstreamStatus: 'failed',
            upstreamError,
            count: 0,
          },
        });
      }
    });
  } catch (error: any) {
    console.error(`[Livescore] ${req.query.sport} 라이브스코어 조회 실패:`, {
      message: error.message,
      stack: error.stack,
      sport: req.query.sport,
    });
    
    res.json({
      sport: req.query.sport as string,
      date: new Date().toISOString().split('T')[0],
      events: [],
      timestamp: new Date().toISOString(),
      ok: false,
      error: 'server_error',
      _debug: {
        cacheHit,
        source: 'error',
        upstreamStatus,
        upstreamError,
        count: 0,
      },
    });
  }
});

/**
 * GET /api/livescore/soccer
 * Primary Sport (Soccer) 라이브스코어 조회
 * 항상 최신 데이터 유지 (30초 주기 폴링)
 */
router.get('/soccer', async (req, res) => {
  const startTime = Date.now();
  let upstreamStatus: string | number = 'unknown';
  let cacheHit = false;
  
  try {
    const targetDate = new Date().toISOString().split('T')[0];
    const sport = 'Soccer';
    
    console.log(`[Livescore] 요청 시작: sport=${sport}, date=${targetDate}`);
    
    // 캐시에서 가져오기
    const cachedEvents = getScores(sport, targetDate);
    
    if (cachedEvents && cachedEvents.length > 0) {
      cacheHit = true;
      const frontendEvents = cachedEvents.map(toFrontendFormat);
      
      console.log(`[Livescore] 캐시 히트: sport=${sport}, count=${frontendEvents.length}`);
      
      return res.json({
        sport,
        date: targetDate,
        events: frontendEvents,
        timestamp: new Date().toISOString(),
        _debug: {
          cacheHit: true,
          source: 'cache',
          count: frontendEvents.length,
        },
      });
    }
    
    cacheHit = false;
    console.log(`[Livescore] 캐시 미스: sport=${sport}, upstream 조회 시작`);
    
    // 캐시에 없으면 즉시 조회 (Lock 사용)
    await withLock(sport, async () => {
      try {
        const events = await fetchLiveScore(sport, true);
        upstreamStatus = 'success';
        
        console.log(`[Livescore] Upstream 조회 완료: sport=${sport}, rawCount=${events.length}`);
        
        const { setScores } = await import('../services/cache.js');
        if (events.length > 0) {
          setScores(sport, targetDate, events);
          console.log(`[Livescore] 캐시 저장: sport=${sport}, count=${events.length}`);
        } else {
          console.warn(`[Livescore] Upstream에서 경기 데이터 없음 (캐시하지 않음): sport=${sport}`);
        }
        
        const frontendEvents = events.map(toFrontendFormat);
        const responseTime = Date.now() - startTime;
        
        console.log(`[Livescore] 응답 준비 완료: sport=${sport}, count=${frontendEvents.length}, time=${responseTime}ms`);
        
        res.json({
          sport,
          date: targetDate,
          events: frontendEvents,
          timestamp: new Date().toISOString(),
          _debug: {
            cacheHit: false,
            source: 'upstream',
            upstreamStatus,
            count: frontendEvents.length,
            responseTime: `${responseTime}ms`,
          },
        });
      } catch (upstreamErr: any) {
        upstreamStatus = 'failed';
        console.error(`[Livescore] Upstream 조회 실패: sport=${sport}`, {
          message: upstreamErr.message,
          code: upstreamErr.code,
        });
        
        res.json({
          sport,
          date: targetDate,
          events: [],
          timestamp: new Date().toISOString(),
          ok: false,
          error: 'upstream_failed',
          _debug: {
            cacheHit: false,
            source: 'upstream',
            upstreamStatus: 'failed',
            upstreamError: upstreamErr.message,
            count: 0,
          },
        });
      }
    });
  } catch (error: any) {
    console.error('[Livescore] Soccer 라이브스코어 조회 실패:', {
      message: error.message,
      stack: error.stack,
    });
    
    res.json({
      sport: 'Soccer',
      date: new Date().toISOString().split('T')[0],
      events: [],
      timestamp: new Date().toISOString(),
      ok: false,
      error: 'server_error',
      _debug: {
        cacheHit,
        source: 'error',
        upstreamStatus,
        count: 0,
      },
    });
  }
});

/**
 * GET /api/livescore/:sport
 * Secondary Sports 라이브스코어 조회
 * 사용자가 해당 종목 탭을 클릭했을 때만 즉시 갱신 가능
 */
router.get('/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { refresh } = req.query;
    const targetDate = new Date().toISOString().split('T')[0];
    const forceRefresh = refresh === 'true';
    
    // 캐시에서 가져오기 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cachedEvents = getScores(sport, targetDate);
      
      if (cachedEvents && cachedEvents.length > 0) {
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
      const events = await fetchLiveScore(sport, true);
      
      if (events.length > 0) {
        const { setScores } = await import('../services/cache.js');
        setScores(sport, targetDate, events);
      }
      
      const frontendEvents = events.map(toFrontendFormat);
      
      res.json({
        sport,
        date: targetDate,
        events: frontendEvents,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error: any) {
    console.error(`[API] ${req.params.sport} 라이브스코어 조회 실패:`, error);
    res.json({
      sport: req.params.sport,
      date: new Date().toISOString().split('T')[0],
      events: [],
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

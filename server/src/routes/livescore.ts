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
  try {
    const { sport } = req.query;
    if (!sport || typeof sport !== 'string') {
      return res.status(400).json({
        error: 'sport 파라미터가 필요합니다',
        example: '/api/livescore?sport=Soccer',
      });
    }
    
    const targetDate = new Date().toISOString().split('T')[0];
    
    // 캐시에서 가져오기
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
    
    // 캐시에 없으면 즉시 조회 (Lock 사용)
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
    console.error(`[API] ${req.query.sport} 라이브스코어 조회 실패:`, error);
    res.json({
      sport: req.query.sport as string,
      date: new Date().toISOString().split('T')[0],
      events: [],
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/livescore/soccer
 * Primary Sport (Soccer) 라이브스코어 조회
 * 항상 최신 데이터 유지 (30초 주기 폴링)
 */
router.get('/soccer', async (req, res) => {
  try {
    const targetDate = new Date().toISOString().split('T')[0];
    
    // 캐시에서 가져오기
    const cachedEvents = getScores('Soccer', targetDate);
    
    if (cachedEvents && cachedEvents.length > 0) {
      const frontendEvents = cachedEvents.map(toFrontendFormat);
      
      return res.json({
        sport: 'Soccer',
        date: targetDate,
        events: frontendEvents,
        timestamp: new Date().toISOString(),
      });
    }
    
    // 캐시에 없으면 즉시 조회 (Lock 사용)
    await withLock('Soccer', async () => {
      const events = await fetchLiveScore('Soccer', true);
      
      if (events.length > 0) {
        const { setScores } = await import('../services/cache.js');
        setScores('Soccer', targetDate, events);
      }
      
      const frontendEvents = events.map(toFrontendFormat);
      
      res.json({
        sport: 'Soccer',
        date: targetDate,
        events: frontendEvents,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error: any) {
    console.error('[API] Soccer 라이브스코어 조회 실패:', error);
    res.json({
      sport: 'Soccer',
      date: new Date().toISOString().split('T')[0],
      events: [],
      timestamp: new Date().toISOString(),
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

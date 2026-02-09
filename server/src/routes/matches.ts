import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 모든 경기 조회 (실시간, 예정, 종료)
router.get(
  '/',
  [
    query('status').optional().isIn(['scheduled', 'live', 'finished']),
    query('sport').optional().isString(),
    query('date').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const { status, sport, date } = req.query;
      const filter: any = {};

      if (status) filter.status = status;
      if (sport) filter.sport = sport;
      if (date) {
        const startDate = new Date(date as string);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date as string);
        endDate.setHours(23, 59, 59, 999);
        filter.matchDate = { $gte: startDate, $lte: endDate };
      }

      const matches = await Match.find(filter)
        .sort({ matchDate: 1, createdAt: -1 })
        .limit(100);

      res.json({ matches });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 실시간 경기 조회
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'live' })
      .sort({ matchDate: 1 });

    res.json({ matches });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

// 예정된 경기 조회
router.get('/scheduled', async (req, res) => {
  try {
    const now = new Date();
    const matches = await Match.find({
      status: 'scheduled',
      matchDate: { $gte: now },
    })
      .sort({ matchDate: 1 })
      .limit(50);

    res.json({ matches });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

// 경기 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: '경기를 찾을 수 없습니다' });
    }
    res.json({ match });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

// 경기 생성 (관리자용)
router.post(
  '/',
  protect,
  [
    body('sport').notEmpty().withMessage('스포츠 종류를 입력해주세요'),
    body('league').notEmpty().withMessage('리그를 입력해주세요'),
    body('homeTeam').notEmpty().withMessage('홈팀을 입력해주세요'),
    body('awayTeam').notEmpty().withMessage('원정팀을 입력해주세요'),
    body('matchDate').isISO8601().withMessage('올바른 날짜 형식이 아닙니다'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const match = await Match.create(req.body);
      
      // Socket.io로 새 경기 브로드캐스트
      const io = (req as any).io;
      if (io) {
        io.to('matches').emit('match:new', match);
      }
      
      res.status(201).json({ match });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 경기 스코어 업데이트 (관리자용)
router.patch(
  '/:id/score',
  protect,
  [
    body('homeScore').optional().isInt({ min: 0 }),
    body('awayScore').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['scheduled', 'live', 'finished']),
  ],
  async (req, res) => {
    try {
      const { homeScore, awayScore, status } = req.body;
      const match = await Match.findById(req.params.id);

      if (!match) {
        return res.status(404).json({ message: '경기를 찾을 수 없습니다' });
      }

      if (homeScore !== undefined) match.homeScore = homeScore;
      if (awayScore !== undefined) match.awayScore = awayScore;
      if (status) match.status = status;

      await match.save();
      
      // Socket.io로 실시간 업데이트 브로드캐스트
      const io = (req as any).io;
      if (io) {
        io.to('matches').emit('match:update', match);
        if (homeScore !== undefined || awayScore !== undefined) {
          io.to('matches').emit('score:update', {
            matchId: match._id.toString(),
            homeScore: match.homeScore,
            awayScore: match.awayScore,
          });
        }
      }
      
      res.json({ match });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 경기 삭제 (관리자용)
router.delete('/:id', protect, async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ message: '경기를 찾을 수 없습니다' });
    }
    res.json({ message: '경기가 삭제되었습니다' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

export default router;

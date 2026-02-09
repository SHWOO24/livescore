import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import ChatRoom from '../models/ChatRoom.js';
import { protect, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// 채팅룸 목록 조회
router.get(
  '/',
  [
    query('public').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const { public: isPublic } = req.query;
      const filter: any = {};

      if (isPublic !== undefined) {
        filter.isPublic = isPublic === 'true';
      }

      // 공개 채팅룸 또는 사용자가 멤버인 채팅룸
      if (!req.user) {
        filter.isPublic = true;
      } else {
        filter.$or = [
          { isPublic: true },
          { members: req.user._id },
        ];
      }

      const rooms = await ChatRoom.find(filter)
        .populate('createdBy', 'name')
        .populate('members', 'name')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ rooms });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 채팅룸 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!room) {
      return res.status(404).json({ message: '채팅룸을 찾을 수 없습니다' });
    }

    res.json({ room });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

// 채팅룸 생성 (인증 필요)
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('채팅룸 이름을 입력해주세요').isLength({ max: 50 }).withMessage('채팅룸 이름은 50자 이하여야 합니다'),
    body('description').optional().isLength({ max: 200 }).withMessage('설명은 200자 이하여야 합니다'),
    body('isPublic').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, isPublic = true } = req.body;

      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다' });
      }

      const room = await ChatRoom.create({
        name,
        description,
        createdBy: req.user._id,
        members: [req.user._id],
        isPublic,
      });

      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('createdBy', 'name')
        .populate('members', 'name');

      res.status(201).json({ room: populatedRoom });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 채팅룸 참여 (인증 필요)
router.post(
  '/:id/join',
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      const room = await ChatRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ message: '채팅룸을 찾을 수 없습니다' });
      }

      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다' });
      }

      if (room.members.includes(req.user._id)) {
        return res.status(400).json({ message: '이미 참여 중인 채팅룸입니다' });
      }

      room.members.push(req.user._id);
      await room.save();

      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('createdBy', 'name')
        .populate('members', 'name');

      res.json({ room: populatedRoom });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 채팅룸 나가기 (인증 필요)
router.post(
  '/:id/leave',
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      const room = await ChatRoom.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ message: '채팅룸을 찾을 수 없습니다' });
      }

      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다' });
      }

      if (room.createdBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: '채팅룸 생성자는 나갈 수 없습니다' });
      }

      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다' });
      }

      const userId = req.user._id;
      room.members = room.members.filter(
        (memberId) => memberId.toString() !== userId.toString()
      );
      await room.save();

      res.json({ message: '채팅룸에서 나갔습니다' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

export default router;

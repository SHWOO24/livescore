import express from 'express';
import { body, validationResult, query } from 'express-validator';
import ChatMessage from '../models/ChatMessage.js';
import ChatRoom from '../models/ChatRoom.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 채팅 메시지 조회 (채팅룸별)
router.get(
  '/',
  [
    query('roomId').notEmpty().withMessage('채팅룸 ID가 필요합니다'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: any, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;

      // 채팅룸 존재 확인
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: '채팅룸을 찾을 수 없습니다' });
      }

      // 공개 채팅룸이 아니고 사용자가 멤버가 아닌 경우
      if (!room.isPublic && (!req.user || !room.members.includes(req.user._id))) {
        return res.status(403).json({ message: '이 채팅룸에 접근할 수 없습니다' });
      }

      const messages = await ChatMessage.find({ room: roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email')
        .select('-user.password');

      res.json({ messages: messages.reverse() });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 채팅 메시지 전송 (인증 필요)
router.post(
  '/',
  protect,
  [
    body('roomId').notEmpty().withMessage('채팅룸 ID가 필요합니다'),
    body('message').trim().notEmpty().withMessage('메시지를 입력해주세요').isLength({ max: 500 }).withMessage('메시지는 500자 이하여야 합니다'),
  ],
  async (req: any, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId, message } = req.body;

      // 채팅룸 존재 및 권한 확인
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: '채팅룸을 찾을 수 없습니다' });
      }

      if (!room.isPublic && !room.members.includes(req.user._id)) {
        return res.status(403).json({ message: '이 채팅룸에 메시지를 보낼 수 없습니다' });
      }

      const chatMessage = await ChatMessage.create({
        room: roomId,
        user: req.user._id,
        userName: req.user.name,
        message,
      });

      const populatedMessage = await ChatMessage.findById(chatMessage._id)
        .populate('user', 'name email')
        .select('-user.password');

      res.status(201).json({ message: populatedMessage });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

export default router;

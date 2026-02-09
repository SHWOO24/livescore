import express, { Request, Response } from 'express';
import User from '../models/User.js';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// 모든 라우트는 인증 및 ADMIN 권한 필요
router.use(protect);
router.use(requireAdmin);

/**
 * 승인 대기 사용자 목록 조회
 * GET /api/admin/users?status=PENDING
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.json({
      users,
      count: users.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

/**
 * 사용자 승인
 * PATCH /api/admin/users/:id/approve
 */
router.patch('/users/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    user.status = 'APPROVED';
    await user.save();

    res.json({
      message: '사용자가 승인되었습니다',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

/**
 * 사용자 거절
 * PATCH /api/admin/users/:id/reject
 */
router.patch('/users/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    user.status = 'REJECTED';
    await user.save();

    res.json({
      message: '사용자가 거절되었습니다',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
  }
});

export default router;

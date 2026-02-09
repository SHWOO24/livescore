import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken, generateVerificationToken, generateResetToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { protect, AuthRequest } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 회원가입
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
    body('name').trim().notEmpty().withMessage('이름을 입력해주세요'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // 이메일 중복 확인
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: '이미 가입된 이메일입니다' });
      }

      // 인증 토큰 생성
      const verificationToken = generateVerificationToken();

      // 사용자 생성
      const user = await User.create({
        email,
        password,
        name,
        verificationToken,
      });

      // 인증 이메일 전송
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증해주세요.',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 이메일 인증
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: '인증 토큰이 필요합니다' });
    }

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'secret') as any;
    
    if (decoded.type !== 'verification') {
      return res.status(400).json({ message: '유효하지 않은 토큰입니다' });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: '유효하지 않은 토큰입니다' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: '이메일 인증이 완료되었습니다' });
  } catch (error: any) {
    res.status(400).json({ message: '인증에 실패했습니다' });
  }
});

// 로그인
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: '이메일 인증이 필요합니다' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' });
      }

      const token = generateToken(user._id.toString());

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      });

      res.json({
        message: '로그인 성공',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 로그아웃
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: '로그아웃되었습니다' });
});

// 현재 사용자 정보
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증이 필요합니다' });
  }
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

// 비밀번호 재설정 요청
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
        return res.json({ message: '비밀번호 재설정 이메일을 전송했습니다' });
      }

      const resetToken = generateResetToken();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1시간
      await user.save();

      await sendPasswordResetEmail(email, resetToken);

      res.json({ message: '비밀번호 재설정 이메일을 전송했습니다' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다' });
    }
  }
);

// 비밀번호 재설정
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('토큰이 필요합니다'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      if (decoded.type !== 'reset') {
        return res.status(400).json({ message: '유효하지 않은 토큰입니다' });
      }

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: '유효하지 않거나 만료된 토큰입니다' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: '비밀번호가 재설정되었습니다' });
    } catch (error: any) {
      res.status(400).json({ message: '비밀번호 재설정에 실패했습니다' });
    }
  }
);

export default router;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 쿠키에서 토큰 가져오기
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    // 헤더에서 토큰 가져오기
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // 인증 실패 로깅 (민감 정보 제외)
      console.log('[Auth] 인증 실패 - 토큰 없음:', {
        path: req.path,
        method: req.method,
        origin: req.headers.origin,
        hasCookie: !!req.cookies.token,
        hasAuthHeader: !!req.headers.authorization,
        userAgent: req.headers['user-agent']?.substring(0, 50),
      });
      return res.status(401).json({ message: '인증이 필요합니다' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다' });
    }

    // 승인된 사용자만 접근 가능 (ADMIN은 항상 승인됨)
    if (user.role !== 'ADMIN' && user.status !== 'APPROVED') {
      return res.status(403).json({ 
        message: '계정 승인이 필요합니다. 관리자 승인 후 로그인할 수 있습니다.' 
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: '이메일 인증이 필요합니다' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '인증에 실패했습니다' });
  }
};

/**
 * ADMIN 권한이 필요한 미들웨어
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // protect 미들웨어를 먼저 통과해야 함
    if (!req.user) {
      return res.status(401).json({ message: '인증이 필요합니다' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '관리자 권한이 필요합니다' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ message: '권한 확인에 실패했습니다' });
  }
};

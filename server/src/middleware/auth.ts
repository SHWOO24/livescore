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
      return res.status(401).json({ message: '인증이 필요합니다' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다' });
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

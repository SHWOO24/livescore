import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const generateVerificationToken = (): string => {
  return jwt.sign(
    { type: 'verification' },
    JWT_SECRET,
    { expiresIn: '24h' } as jwt.SignOptions
  );
};

export const generateResetToken = (): string => {
  return jwt.sign(
    { type: 'reset' },
    JWT_SECRET,
    { expiresIn: '1h' } as jwt.SignOptions
  );
};

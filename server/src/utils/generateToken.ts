import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const generateVerificationToken = (): string => {
  return jwt.sign(
    { type: 'verification' },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: '24h',
    }
  );
};

export const generateResetToken = (): string => {
  return jwt.sign(
    { type: 'reset' },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: '1h',
    }
  );
};

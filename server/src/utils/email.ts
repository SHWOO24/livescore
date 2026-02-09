import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"라이브스코어" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '이메일 인증을 완료해주세요',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">라이브스코어 이메일 인증</h2>
        <p>안녕하세요!</p>
        <p>회원가입을 완료하기 위해 아래 링크를 클릭하여 이메일을 인증해주세요.</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          이메일 인증하기
        </a>
        <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          이 링크는 24시간 동안 유효합니다.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"라이브스코어" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '비밀번호 재설정',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">비밀번호 재설정</h2>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 링크를 클릭하여 새 비밀번호를 설정해주세요.</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          비밀번호 재설정하기
        </a>
        <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          이 링크는 1시간 동안 유효합니다. 요청하지 않으셨다면 이 이메일을 무시하세요.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

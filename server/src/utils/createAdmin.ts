import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * 초기 ADMIN 계정 생성
 * 서버 시작 시 1회만 실행되며, 이미 존재하면 재생성하지 않음
 */
export async function createInitialAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ [Admin] ADMIN_EMAIL 또는 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
      console.warn('⚠️ [Admin] 초기 ADMIN 계정이 생성되지 않습니다.');
      return;
    }

    // 이미 ADMIN 계정이 존재하는지 확인
    const existingAdmin = await User.findOne({ 
      email: adminEmail.toLowerCase(),
      role: 'ADMIN'
    });

    if (existingAdmin) {
      console.log('✅ [Admin] ADMIN 계정이 이미 존재합니다:', adminEmail);
      return;
    }

    // 기존 사용자가 있지만 ADMIN이 아닌 경우 업데이트
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingUser) {
      existingUser.role = 'ADMIN';
      existingUser.status = 'APPROVED';
      existingUser.password = await bcrypt.hash(adminPassword, 12);
      await existingUser.save();
      console.log('✅ [Admin] 기존 사용자를 ADMIN으로 업데이트했습니다:', adminEmail);
      return;
    }

    // 새 ADMIN 계정 생성
    const adminUser = await User.create({
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      status: 'APPROVED',
      isVerified: true,
    });

    console.log('✅ [Admin] 초기 ADMIN 계정이 생성되었습니다:', adminEmail);
    console.log('   - Role: ADMIN');
    console.log('   - Status: APPROVED');
  } catch (error: any) {
    console.error('❌ [Admin] ADMIN 계정 생성 실패:', error.message);
  }
}

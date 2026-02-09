#!/usr/bin/env node

/**
 * .env.production 파일 생성 스크립트
 * 
 * 사용 방법:
 * node create-env-production.js
 * 또는
 * npm run create:env
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('='.repeat(60));
  console.log('프론트엔드 환경변수 설정');
  console.log('='.repeat(60));
  console.log('');
  
  const envPath = path.join(__dirname, '.env.production');
  const examplePath = path.join(__dirname, '.env.production.example');
  
  // 예제 파일 읽기
  let exampleContent = '';
  if (fs.existsSync(examplePath)) {
    exampleContent = fs.readFileSync(examplePath, 'utf-8');
  }
  
  console.log('백엔드 서버 URL을 입력해주세요.');
  console.log('');
  console.log('예시:');
  console.log('  - Render: https://livescore-api.onrender.com');
  console.log('  - Railway: https://your-app.railway.app');
  console.log('  - VPS: https://api.scorelivenow.com');
  console.log('');
  
  const backendUrl = await question('백엔드 서버 URL: ');
  
  if (!backendUrl || !backendUrl.trim()) {
    console.error('❌ 백엔드 서버 URL을 입력해주세요.');
    rl.close();
    process.exit(1);
  }
  
  const url = backendUrl.trim();
  
  // URL 형식 검증
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('❌ URL은 http:// 또는 https://로 시작해야 합니다.');
    rl.close();
    process.exit(1);
  }
  
  // 환경변수 파일 내용 생성
  const envContent = `# 프로덕션 환경 변수
# 이 파일은 빌드 시점에 사용됩니다.
# 빌드 후에는 변경해도 반영되지 않으므로, 변경 시 재빌드가 필요합니다.

# 백엔드 API 서버 URL
VITE_API_BASE_URL=${url}

# Socket.io 서버 URL (대부분 VITE_API_BASE_URL과 동일)
VITE_SOCKET_URL=${url}
`;
  
  // 파일 작성
  fs.writeFileSync(envPath, envContent, 'utf-8');
  
  console.log('');
  console.log('✅ .env.production 파일이 생성되었습니다!');
  console.log('');
  console.log('다음 단계:');
  console.log('  1. npm run build 실행');
  console.log('  2. client/dist/ 폴더 내용을 Namecheap에 업로드');
  console.log('');
  console.log('생성된 파일:');
  console.log(`  ${envPath}`);
  console.log('');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ 오류 발생:', error);
  rl.close();
  process.exit(1);
});

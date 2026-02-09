/**
 * client/dist 폴더를 ZIP으로 압축하는 스크립트
 * Namecheap 업로드를 쉽게 하기 위함
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'client', 'dist');
const zipFile = path.join(rootDir, 'client-dist.zip');

console.log('📦 client/dist ZIP 파일 생성 중...\n');

// dist 폴더 확인
if (!fs.existsSync(distDir)) {
  console.error('❌ client/dist 폴더가 없습니다. 먼저 빌드를 실행하세요:');
  console.error('   cd client && npm run build');
  process.exit(1);
}

// 기존 ZIP 파일 삭제
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
  console.log('🧹 기존 ZIP 파일 삭제');
}

// ZIP 파일 생성
try {
  if (process.platform === 'win32') {
    // Windows: PowerShell Compress-Archive 사용
    execSync(
      `powershell Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipFile}" -Force`,
      { stdio: 'inherit' }
    );
  } else {
    // Linux/Mac: zip 명령어 사용
    execSync(
      `cd "${distDir}" && zip -r "${zipFile}" .`,
      { stdio: 'inherit' }
    );
  }

  const stats = fs.statSync(zipFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✅ ZIP 파일 생성 완료: ${path.basename(zipFile)} (${sizeMB} MB)`);
  console.log(`\n📤 업로드 방법:`);
  console.log(`   1. ${zipFile} 파일을 Namecheap cPanel에 업로드`);
  console.log(`   2. cPanel File Manager에서 압축 해제`);
  console.log(`   3. public_html/ 디렉토리에 내용 이동`);
  console.log(`\n또는`);
  console.log(`   client/dist/ 폴더 내용을 직접 public_html/에 업로드`);
} catch (error) {
  console.error('❌ ZIP 파일 생성 실패:', error.message);
  console.log('\n수동으로 압축하세요:');
  console.log(`   ${distDir} 폴더를 압축하세요`);
  process.exit(1);
}

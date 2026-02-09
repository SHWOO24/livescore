import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const deployDir = path.join(rootDir, '..', 'deploy', 'static');

// 배포 디렉토리 생성
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// dist 디렉토리 확인
if (!fs.existsSync(distDir)) {
  console.error('❌ dist 디렉토리가 없습니다. 먼저 npm run build를 실행하세요.');
  process.exit(1);
}

// 파일 복사 함수
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// 디렉토리 복사 함수
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

console.log('📦 배포 패키지 준비 중...');

// dist 내용을 deploy/static으로 복사
const entries = fs.readdirSync(distDir, { withFileTypes: true });

for (const entry of entries) {
  const srcPath = path.join(distDir, entry.name);
  const destPath = path.join(deployDir, entry.name);
  
  if (entry.isDirectory()) {
    copyDir(srcPath, destPath);
    console.log(`✅ ${entry.name}/ 디렉토리 복사 완료`);
  } else {
    copyFile(srcPath, destPath);
    console.log(`✅ ${entry.name} 파일 복사 완료`);
  }
}

// public 폴더의 robots.txt, sitemap.xml도 복사
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = ['robots.txt', 'sitemap.xml'];
  for (const file of publicFiles) {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(deployDir, file);
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
      console.log(`✅ ${file} 파일 복사 완료`);
    }
  }
}

// .htaccess 파일 확인
const htaccessPath = path.join(deployDir, '.htaccess');
if (!fs.existsSync(htaccessPath)) {
  console.warn('⚠️  .htaccess 파일이 없습니다. dist/.htaccess를 확인하세요.');
}

// 배포 파일 목록 출력
console.log('\n📋 배포 파일 목록:');
const deployFiles = [];
function listFiles(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      listFiles(fullPath, relativePath);
    } else {
      deployFiles.push(relativePath.replace(/\\/g, '/'));
    }
  }
}

listFiles(deployDir);
deployFiles.sort().forEach(file => {
  const stats = fs.statSync(path.join(deployDir, file));
  const size = (stats.size / 1024).toFixed(2);
  console.log(`   ${file} (${size} KB)`);
});

console.log(`\n✅ 배포 패키지 준비 완료: ${deployDir}`);
console.log(`\n📤 Namecheap Shared Hosting에 업로드할 파일:`);
console.log(`   ${deployDir} 디렉토리의 모든 내용을 public_html에 업로드하세요.`);

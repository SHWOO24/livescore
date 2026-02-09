import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 업로드 대상 디렉토리
const uploadDir = path.join(rootDir, 'server-upload');
const zipFile = path.join(rootDir, 'livescore-server-upload.zip');

// 삭제 함수
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// 디렉토리 복사 함수
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.statSync(src).isDirectory()) {
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
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 파일 복사 함수
function copyFile(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(src, dest);
}

console.log('📦 서버 업로드 패키지 준비 중...\n');

// 기존 업로드 디렉토리 및 압축 파일 삭제
console.log('🧹 기존 파일 정리...');
removeDir(uploadDir);
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

// 업로드 디렉토리 생성
fs.mkdirSync(uploadDir, { recursive: true });

// 1. 백엔드 서버 파일 복사
console.log('📂 백엔드 서버 파일 복사...');
const serverSrc = path.join(rootDir, 'server', 'src');
const serverUploadSrc = path.join(uploadDir, 'server', 'src');
copyDir(serverSrc, serverUploadSrc);

// 서버 설정 파일들
const serverFiles = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'ecosystem.config.js',
  '.env.production.example',
  'nginx.conf.example',
];

serverFiles.forEach(file => {
  const src = path.join(rootDir, 'server', file);
  const dest = path.join(uploadDir, 'server', file);
  if (fs.existsSync(src)) {
    copyFile(src, dest);
    console.log(`   ✅ ${file}`);
  }
});

// 2. 프론트엔드 배포 파일 준비
console.log('\n📂 프론트엔드 배포 파일 준비...');
try {
  // 프론트엔드 빌드
  console.log('   🔨 프론트엔드 빌드 중...');
  process.chdir(path.join(rootDir, 'client'));
  execSync('npm run build', { stdio: 'inherit' });
  
  // 배포 패키지 생성
  console.log('   📦 배포 패키지 생성 중...');
  execSync('node scripts/prepare-deploy.js', { stdio: 'inherit' });
  
  // deploy/static 내용을 server-upload/frontend로 복사
  const deployStatic = path.join(rootDir, 'client', 'dist');
  const frontendUpload = path.join(uploadDir, 'frontend');
  
  if (fs.existsSync(deployStatic)) {
    copyDir(deployStatic, frontendUpload);
    console.log('   ✅ 프론트엔드 배포 파일 복사 완료');
  }
  
  // .htaccess 파일도 복사
  const htaccessSrc = path.join(rootDir, 'client', 'dist', '.htaccess');
  const htaccessDest = path.join(frontendUpload, '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    copyFile(htaccessSrc, htaccessDest);
    console.log('   ✅ .htaccess 파일 복사 완료');
  } else {
    // .htaccess 파일이 없으면 생성
    const htaccessContent = `# Apache/LiteSpeed SPA 라우팅 설정
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 디렉토리 리스팅 방지
<IfModule mod_autoindex.c>
  Options -Indexes
</IfModule>

DirectoryIndex index.html
`;
    fs.writeFileSync(htaccessDest, htaccessContent);
    console.log('   ✅ .htaccess 파일 생성 완료');
  }
  
  // public 폴더의 robots.txt, sitemap.xml도 복사
  const publicDir = path.join(rootDir, 'client', 'public');
  ['robots.txt', 'sitemap.xml'].forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(frontendUpload, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    }
  });
} catch (error) {
  console.error('   ❌ 프론트엔드 빌드 실패:', error.message);
}

// 3. 문서 파일 복사
console.log('\n📄 문서 파일 복사...');
const docs = [
  'DEPLOY_BACKEND.md',
  'DEPLOYMENT.md',
  'server/UPLOAD_FILES.md',
  'server/DEPLOYMENT_SUMMARY.md',
  'server/CORS_GUIDE.md',
];

docs.forEach(doc => {
  const src = path.join(rootDir, doc);
  const dest = path.join(uploadDir, doc);
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    copyFile(src, dest);
    console.log(`   ✅ ${doc}`);
  }
});

// 4. README 생성
const readmeContent = `# 서버 업로드 패키지

이 압축 파일에는 서버에 배포할 파일들이 포함되어 있습니다.

## 디렉토리 구조

\`\`\`
server-upload/
├── server/              # 백엔드 서버 파일
│   ├── src/            # 소스 코드
│   ├── package.json
│   ├── tsconfig.json
│   ├── ecosystem.config.js
│   └── .env.production.example
├── frontend/            # 프론트엔드 배포 파일 (Namecheap용)
│   ├── index.html
│   ├── .htaccess
│   └── assets/
└── DEPLOY_BACKEND.md    # 배포 가이드
\`\`\`

## 배포 방법

### 백엔드 서버 (VPS)

1. \`server/\` 디렉토리 내용을 서버에 업로드
2. \`DEPLOY_BACKEND.md\` 참고하여 배포

### 프론트엔드 (Namecheap Shared Hosting)

1. \`frontend/\` 디렉토리 내용을 \`public_html/\`에 업로드
2. \`DEPLOYMENT.md\` 참고

## 중요 사항

- ⚠️ \`node_modules/\`는 서버에서 \`npm ci\`로 설치
- ⚠️ \`.env\` 파일은 서버에서 직접 생성
- ⚠️ 백엔드는 \`npm run build\` 후 배포
`;

fs.writeFileSync(path.join(uploadDir, 'README.md'), readmeContent);
console.log('   ✅ README.md 생성');

// 5. 압축 파일 생성
console.log('\n🗜️  압축 파일 생성 중...');
process.chdir(rootDir);

try {
  // Windows에서는 PowerShell의 Compress-Archive 사용
  // Linux/Mac에서는 zip 명령어 사용
  if (process.platform === 'win32') {
    execSync(`powershell Compress-Archive -Path "${uploadDir}\\*" -DestinationPath "${zipFile}" -Force`, { stdio: 'inherit' });
  } else {
    execSync(`cd ${uploadDir} && zip -r ${zipFile} .`, { stdio: 'inherit' });
  }
  
  const stats = fs.statSync(zipFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ 압축 완료: ${path.basename(zipFile)} (${sizeMB} MB)`);
} catch (error) {
  console.error('❌ 압축 실패:', error.message);
  console.log('\n수동으로 압축하세요:');
  console.log(`   ${uploadDir} 디렉토리를 압축하세요`);
}

// 파일 목록 출력
console.log('\n📋 업로드 패키지 내용:');
function listFiles(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      console.log(`   📁 ${relativePath}/`);
      listFiles(fullPath, relativePath);
    } else {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`   📄 ${relativePath} (${size} KB)`);
    }
  }
}

listFiles(uploadDir);

console.log(`\n📤 서버에 업로드할 파일:`);
console.log(`   ${zipFile}`);
console.log(`\n💡 압축 해제 후:`);
console.log(`   - server/ → 백엔드 서버에 업로드`);
console.log(`   - frontend/ → Namecheap public_html에 업로드`);

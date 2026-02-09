# 서버 업로드 파일 가이드

## ✅ 업로드해야 할 파일

### 필수 파일 및 디렉토리

```
server/
├── src/                          ✅ 필수 (소스 코드)
│   ├── index.ts
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── package.json                  ✅ 필수
├── package-lock.json            ✅ 필수 (또는 npm ci 사용 시 자동 생성)
├── tsconfig.json                ✅ 필수 (TypeScript 설정)
├── ecosystem.config.js          ✅ 필수 (PM2 설정)
├── .env.production.example      ✅ 참고용 (실제 .env는 서버에서 생성)
└── .gitignore                   ✅ 선택사항
```

### 선택적 파일 (문서/설정 예시)

```
server/
├── nginx.conf.example           ⚠️ 참고용 (서버에 직접 복사하지 않음)
├── CORS_GUIDE.md                ⚠️ 참고용
├── DEPLOYMENT_SUMMARY.md        ⚠️ 참고용
└── README.md                    ⚠️ 참고용
```

---

## ❌ 업로드하지 말아야 할 파일

### 절대 업로드 금지

```
server/
├── node_modules/                ❌ 절대 업로드 금지 (서버에서 npm ci로 설치)
├── dist/                        ❌ 업로드 불필요 (서버에서 npm run build로 생성)
├── .env                        ❌ 절대 업로드 금지 (서버에서 직접 생성, Git 커밋 안 됨)
├── logs/                       ❌ 업로드 불필요 (PM2가 자동 생성)
├── *.log                       ❌ 업로드 불필요
└── .git/                       ❌ 업로드 불필요 (Git 저장소)
```

---

## 📤 업로드 방법

### 방법 1: Git을 통한 배포 (권장)

```bash
# 서버에서 실행
cd ~/livescore-server
git clone https://github.com/your-username/livescore.git .
cd server
```

**장점**: 
- 자동으로 필요한 파일만 가져옴
- `.gitignore`에 의해 불필요한 파일 제외
- 업데이트가 쉬움 (`git pull`)

### 방법 2: FTP/SFTP로 수동 업로드

**업로드할 디렉토리/파일**:
- `server/src/` (폴더 전체)
- `server/package.json`
- `server/package-lock.json`
- `server/tsconfig.json`
- `server/ecosystem.config.js`
- `server/.env.production.example` (참고용)

**업로드하지 않을 것**:
- `server/node_modules/` ❌
- `server/dist/` ❌
- `server/.env` ❌
- `server/logs/` ❌

### 방법 3: 압축 파일로 업로드

**로컬에서 압축**:
```bash
# 로컬에서 실행
cd server
tar -czf server-deploy.tar.gz \
  src/ \
  package.json \
  package-lock.json \
  tsconfig.json \
  ecosystem.config.js \
  .env.production.example \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.env \
  --exclude=logs
```

**서버에서 압축 해제**:
```bash
# 서버에서 실행
cd ~/livescore-server
tar -xzf server-deploy.tar.gz
```

---

## 🔧 서버에서 실행할 작업

업로드 후 서버에서 다음을 실행:

```bash
cd ~/livescore-server/server

# 1. 의존성 설치 (node_modules 생성)
npm ci

# 2. TypeScript 빌드 (dist/ 생성)
npm run build

# 3. 환경변수 파일 생성
cp .env.production.example .env
nano .env  # 실제 값으로 수정

# 4. 로그 디렉토리 생성
mkdir -p logs

# 5. PM2로 실행
pm2 start ecosystem.config.js --env production
```

---

## 📋 최종 업로드 체크리스트

### 업로드 전 확인

- [ ] `node_modules/` 폴더가 업로드 목록에 없는지 확인
- [ ] `.env` 파일이 업로드 목록에 없는지 확인
- [ ] `dist/` 폴더가 업로드 목록에 없는지 확인
- [ ] `logs/` 폴더가 업로드 목록에 없는지 확인

### 업로드 후 확인

- [ ] `src/` 디렉토리가 있는지 확인
- [ ] `package.json` 파일이 있는지 확인
- [ ] `tsconfig.json` 파일이 있는지 확인
- [ ] `ecosystem.config.js` 파일이 있는지 확인

### 서버에서 실행 후 확인

- [ ] `npm ci` 성공 (node_modules 생성)
- [ ] `npm run build` 성공 (dist/ 생성)
- [ ] `.env` 파일 생성 및 설정 완료
- [ ] `pm2 start` 성공

---

## 🚨 주의사항

### 1. node_modules는 절대 업로드하지 마세요
- 용량이 매우 큼 (수백 MB)
- 플랫폼별로 다를 수 있음
- 서버에서 `npm ci`로 설치해야 함

### 2. .env 파일은 절대 업로드하지 마세요
- 보안 위험 (비밀번호, JWT_SECRET 등)
- 서버에서 직접 생성해야 함
- `.env.production.example`을 참고하여 생성

### 3. dist/ 폴더는 업로드 불필요
- 서버에서 `npm run build`로 생성
- TypeScript 소스 코드만 있으면 됨

### 4. Git 사용 시
- `.gitignore`가 올바르게 설정되어 있으면 자동으로 제외됨
- `git clone` 또는 `git pull` 사용 권장

---

## 📝 요약

### 업로드해야 할 것
- ✅ `src/` (소스 코드)
- ✅ `package.json`, `package-lock.json`
- ✅ `tsconfig.json`
- ✅ `ecosystem.config.js`
- ✅ `.env.production.example` (참고용)

### 업로드하지 말아야 할 것
- ❌ `node_modules/` (서버에서 `npm ci`로 설치)
- ❌ `dist/` (서버에서 `npm run build`로 생성)
- ❌ `.env` (서버에서 직접 생성)
- ❌ `logs/` (PM2가 자동 생성)

### 서버에서 실행할 명령어
```bash
npm ci          # 의존성 설치
npm run build   # 빌드
# .env 파일 생성 및 설정
pm2 start ecosystem.config.js --env production
```

# Railway 안정 배포를 위한 Dockerfile
# npm ci를 사용하지 않고 npm install만 사용하여 EBUSY 오류 방지

FROM node:20-alpine

WORKDIR /app

# 루트 package.json 복사 (package-lock.json은 선택사항)
COPY package.json ./

# 루트 의존성 설치 (npm ci 금지, npm install 사용)
# package-lock.json이 있으면 사용하고, 없으면 최신 버전 설치
RUN npm install

# 서버 의존성 설치
COPY server/package*.json ./server/
RUN cd server && npm install

# 클라이언트 의존성 설치 (TypeScript 포함)
COPY client/package*.json ./client/
RUN cd client && npm install

# 소스 코드 복사
# 명시적으로 디렉토리 경로 지정 (Railway 빌드 컨텍스트 대응)
COPY server/ ./server/
COPY client/ ./client/

# 빌드 단계
# 1. 서버 빌드 (TypeScript 컴파일)
RUN cd server && npm run build

# 2. 클라이언트 빌드 (TypeScript 컴파일 + Vite 빌드)
RUN cd client && npm run build

# 프로덕션 실행
# Railway는 PORT 환경변수를 자동으로 제공
CMD ["npm", "start"]

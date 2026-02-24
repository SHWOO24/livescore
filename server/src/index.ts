import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';
import chatRoomRoutes from './routes/chatRooms.js';
import scoresRoutes from './routes/scores.js';
import livescoreRoutes from './routes/livescore.js';
import { setupSocketIO } from './utils/socket.js';
import { seedMatches, seedChatRooms } from './utils/seedData.js';
import { startPolling } from './services/polling.js';
import { createInitialAdmin } from './utils/createAdmin.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/livescore';

// CORS 설정
// Railway 환경변수 CORS_ORIGIN을 사용하여 허용된 Origin 목록 파싱
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// CORS 설정 디버깅 로그
console.log('🔧 [CORS] 설정 정보:');
console.log('  - CORS_ORIGIN 환경변수:', process.env.CORS_ORIGIN || '(설정되지 않음)');
console.log('  - NODE_ENV:', process.env.NODE_ENV || '(설정되지 않음)');
console.log('  - 허용된 Origin:', allowedOrigins.length > 0 ? allowedOrigins : '(없음 - 모든 Origin 허용)');

// CORS Middleware
app.use(cors({
  origin: (origin, cb) => {
    // origin이 없으면 same-origin/서버간 호출 허용
    if (!origin) return cb(null, true);
    // 허용된 Origin 목록에 있으면 허용
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // 그 외는 거부
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Preflight(OPTIONS) 요청 처리
app.options("*", cors());

// Socket.io 설정 (reverse proxy 환경 대응)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      // origin이 없으면 same-origin/서버간 호출 허용
      if (!origin) return cb(null, true);
      // 허용된 Origin 목록에 있으면 허용
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // 그 외는 거부
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  // Reverse proxy 환경에서도 동작하도록 설정
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: '/socket.io', // 기본 path 유지
});
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
});

app.use('/api/', limiter);

// Socket.io를 req에 주입하기 위한 미들웨어
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat-rooms', chatRoomRoutes);
app.use('/api', scoresRoutes); // 스코어 라우팅
app.use('/api/livescore', livescoreRoutes); // 종목별 라이브스코어 라우팅

// Health check (항상 200 반환, 상세 정보 포함)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    ok: true,
    status: 'ok', 
    message: 'Server is running',
    time: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Socket.io setup
setupSocketIO(io);

// 폴링 서비스 시작 (MongoDB 연결 후)

// 서버 시작 (MongoDB 연결 실패해도 서버는 계속 실행)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다 (0.0.0.0)`);
  
  // MongoDB connection (비동기, 실패해도 서버는 계속 실행)
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ MongoDB 연결 성공');
      
      // 초기 ADMIN 계정 생성
      await createInitialAdmin();
      
      // 개발 환경에서 샘플 데이터 생성
      if (process.env.NODE_ENV !== 'production') {
        try {
          await seedMatches();
          await seedChatRooms();
        } catch (error) {
          console.warn('⚠️ 샘플 데이터 생성 실패 (무시):', error);
        }
      }
    })
    .catch((error) => {
      console.error('❌ MongoDB 연결 실패 (서버는 계속 실행):', error);
      console.warn('⚠️ MongoDB 없이도 API는 작동하지만, 채팅/인증 기능은 사용할 수 없습니다.');
    });
  
  // 폴링 서비스 시작 (MongoDB 연결 여부와 무관)
  startPolling(io);
});

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatMessage from '../models/ChatMessage.js';
import ChatRoom from '../models/ChatRoom.js';

// 채팅 Rate Limiting (3msg/5s)
const chatRateLimit = new Map<string, { count: number; resetTime: number }>();
const CHAT_RATE_LIMIT = 3; // 최대 메시지 수
const CHAT_RATE_WINDOW = 5000; // 5초

function checkChatRateLimit(socketId: string): boolean {
  const now = Date.now();
  const record = chatRateLimit.get(socketId);
  
  if (!record || now > record.resetTime) {
    // 새 윈도우 시작
    chatRateLimit.set(socketId, { count: 1, resetTime: now + CHAT_RATE_WINDOW });
    return true;
  }
  
  if (record.count >= CHAT_RATE_LIMIT) {
    return false; // Rate limit 초과
  }
  
  record.count++;
  return true;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

export const setupSocketIO = (io: Server) => {
  // 인증 미들웨어
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];

      if (!token) {
        // 인증 없이도 연결 가능 (읽기 전용)
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
      const user = await User.findById(decoded.id);

      if (user && user.isVerified) {
        socket.userId = user._id.toString();
        socket.userName = user.name;
      }

      next();
    } catch (error) {
      // 인증 실패해도 연결 허용 (읽기 전용)
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ 사용자 연결: ${socket.id}`);

    // 실시간 경기 업데이트 구독 (기존)
    socket.on('subscribe:matches', () => {
      socket.join('matches');
    });

    // 스코어 업데이트 구독 (새로운)
    socket.on('subscribe', (data: { sport?: string; date?: string }) => {
      if (data.sport && data.date) {
        const room = `${data.sport}:${data.date}`;
        socket.join(room);
        console.log(`[Socket] ${socket.id}가 ${room} 구독`);
      } else {
        // 모든 스포츠 구독
        socket.join('scores:all');
      }
    });

    // 스코어 구독 해제
    socket.on('unsubscribe', (data: { sport?: string; date?: string }) => {
      if (data.sport && data.date) {
        const room = `${data.sport}:${data.date}`;
        socket.leave(room);
      } else {
        socket.leave('scores:all');
      }
    });

    // 채팅룸 입장
    socket.on('chat:join-room', async (data: { roomId: string }) => {
      try {
        if (!data.roomId) {
          socket.emit('error', { message: '채팅룸 ID가 필요합니다' });
          return;
        }

        // 채팅룸 존재 확인
        const room = await ChatRoom.findById(data.roomId);

        if (!room) {
          socket.emit('error', { message: '채팅룸을 찾을 수 없습니다' });
          return;
        }

        // 공개 채팅룸이 아니고 사용자가 멤버가 아닌 경우
        if (!room.isPublic && (!socket.userId || !room.members.includes(socket.userId as any))) {
          socket.emit('error', { message: '이 채팅룸에 접근할 수 없습니다' });
          return;
        }

        socket.join(`room:${data.roomId}`);
        socket.emit('chat:joined-room', { roomId: data.roomId });
      } catch (error: any) {
        socket.emit('error', { message: error.message || '채팅룸 입장에 실패했습니다' });
      }
    });

    // 채팅룸 나가기
    socket.on('chat:leave-room', (data: { roomId: string }) => {
      if (data.roomId) {
        socket.leave(`room:${data.roomId}`);
        socket.emit('chat:left-room', { roomId: data.roomId });
      }
    });

    // 채팅 메시지 전송
    socket.on('chat:message', async (data: { roomId: string; message: string }) => {
      try {
        if (!socket.userId || !socket.userName) {
          socket.emit('error', { message: '로그인이 필요합니다' });
          return;
        }

        // Rate limiting 체크
        if (!checkChatRateLimit(socket.id)) {
          socket.emit('error', { message: '메시지를 너무 빠르게 보내고 있습니다. 잠시 후 다시 시도해주세요.' });
          return;
        }

        if (!data.roomId) {
          socket.emit('error', { message: '채팅룸 ID가 필요합니다' });
          return;
        }

        if (!data.message || data.message.trim().length === 0 || data.message.length > 500) {
          socket.emit('error', { message: '메시지는 1자 이상 500자 이하여야 합니다' });
          return;
        }

        // 채팅룸 존재 및 권한 확인
        const room = await ChatRoom.findById(data.roomId);

        if (!room) {
          socket.emit('error', { message: '채팅룸을 찾을 수 없습니다' });
          return;
        }

        if (!room.isPublic && !room.members.includes(socket.userId as any)) {
          socket.emit('error', { message: '이 채팅룸에 메시지를 보낼 수 없습니다' });
          return;
        }

        const chatMessage = await ChatMessage.create({
          room: data.roomId,
          user: socket.userId,
          userName: socket.userName,
          message: data.message.trim(),
        });

        const messageData = {
          _id: chatMessage._id,
          roomId: data.roomId,
          user: {
            _id: socket.userId,
            name: socket.userName,
          },
          message: chatMessage.message,
          createdAt: chatMessage.createdAt,
        };

        // 해당 채팅룸에만 메시지 브로드캐스트
        io.to(`room:${data.roomId}`).emit('chat:new-message', messageData);
      } catch (error: any) {
        socket.emit('error', { message: error.message || '메시지 전송에 실패했습니다' });
      }
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`❌ 사용자 연결 해제: ${socket.id}`);
      // Rate limit 데이터 정리
      chatRateLimit.delete(socket.id);
    });
  });

};

// 경기 업데이트를 브로드캐스트하는 헬퍼 함수
export const broadcastMatchUpdate = (io: Server, match: any) => {
  io.to('matches').emit('match:update', match);
};

// 경기 스코어 업데이트를 브로드캐스트하는 헬퍼 함수
export const broadcastScoreUpdate = (io: Server, matchId: string, homeScore: number, awayScore: number) => {
  io.to('matches').emit('score:update', { matchId, homeScore, awayScore });
};

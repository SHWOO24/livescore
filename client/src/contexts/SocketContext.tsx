/**
 * Socket.io 실시간 통신 컨텍스트
 * 
 * ⚠️ Namecheap Shared Hosting 제약사항:
 * - Shared Hosting 환경에서는 Node.js 서버가 실행되지 않으므로
 *   Socket.io 연결이 불가능합니다.
 * - 실시간 채팅, 실시간 스코어 업데이트 기능이 동작하지 않습니다.
 * 
 * 해결 방법:
 * 1. 별도의 백엔드 서버(VPS, Railway, Render 등)에 Socket.io 서버 배포
 * 2. 연결 URL을 외부 백엔드 서버로 변경
 * 3. 재빌드 후 배포
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/api';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Socket URL 결정: VITE_SOCKET_URL 우선, 없으면 VITE_API_BASE_URL 사용
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;
    
    // 환경변수가 없으면 Socket.io 연결하지 않음
    if (!socketUrl) {
      if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
        console.warn(
          '⚠️ [Socket] VITE_SOCKET_URL 또는 VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.\n' +
          '프로덕션 환경에서는 백엔드 서버 URL을 환경변수로 설정해야 합니다.\n' +
          '예: VITE_SOCKET_URL=https://acceptable-determination-production-a4db.up.railway.app'
        );
      }
      return;
    }

    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true, // 자동 재연결 활성화
      transports: ['websocket', 'polling'], // WebSocket 우선, 실패 시 polling
      auth: async (cb) => {
        try {
          const response = await api.get('/api/auth/me');
          if (response.data.user) {
            cb({ token: document.cookie.split('token=')[1]?.split(';')[0] });
          } else {
            cb({});
          }
        } catch {
          cb({});
        }
      },
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket 연결됨');
      setConnected(true);
      newSocket.emit('subscribe:matches');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket 연결 해제됨');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket && newSocket.connected) {
        newSocket.close();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

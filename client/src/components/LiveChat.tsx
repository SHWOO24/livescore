import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import ChatRooms from './ChatRooms';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import toast from 'react-hot-toast';

interface ChatMessage {
  _id: string;
  roomId: string;
  user: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
}

const LiveChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showRooms, setShowRooms] = useState(true);
  const { socket, connected } = useSocket();
  const { isAuthenticated, user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedRoomId && socket) {
      loadMessages(selectedRoomId);
      socket.emit('chat:join-room', { roomId: selectedRoomId });
    }

    return () => {
      if (selectedRoomId && socket) {
        socket.emit('chat:leave-room', { roomId: selectedRoomId });
      }
    };
  }, [selectedRoomId, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:new-message', (message: ChatMessage) => {
      if (message.roomId === selectedRoomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('chat:joined-room', ({ roomId }: { roomId: string }) => {
      if (roomId === selectedRoomId) {
        loadMessages(roomId);
      }
    });

    return () => {
      socket.off('chat:new-message');
      socket.off('chat:joined-room');
    };
  }, [socket, selectedRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (roomId: string) => {
    try {
      const response = await api.get(`/api/chat?roomId=${roomId}`);
      setMessages(response.data.messages);
    } catch (error: any) {
      console.error('메시지 로드 실패:', error);
      toast.error(error.response?.data?.message || '메시지를 불러올 수 없습니다');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectRoom = (roomId: string) => {
    if (socket && selectedRoomId) {
      socket.emit('chat:leave-room', { roomId: selectedRoomId });
    }
    setSelectedRoomId(roomId);
    setShowRooms(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isAuthenticated || !selectedRoomId) return;

    socket.emit('chat:message', {
      roomId: selectedRoomId,
      message: newMessage.trim(),
    });
    setNewMessage('');
    inputRef.current?.focus();
  };

  return (
    <>
      {/* 채팅 버튼 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors z-40"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {!connected && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </motion.button>

      {/* 채팅 창 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 w-[500px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50"
          >
            {/* 헤더 */}
            <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <h3 className="font-semibold">채팅룸</h3>
              </div>
              <div className="flex items-center space-x-2">
                {!showRooms && (
                  <button
                    onClick={() => setShowRooms(true)}
                    className="text-white hover:text-gray-200 text-sm"
                  >
                    목록
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 채팅룸 목록 또는 채팅 화면 */}
            {showRooms ? (
              <ChatRooms
                onSelectRoom={handleSelectRoom}
                selectedRoomId={selectedRoomId || undefined}
              />
            ) : selectedRoomId ? (
              <>
                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      메시지가 없습니다. 첫 메시지를 보내보세요!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col space-y-1 ${
                          message.user._id === user?.id ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-primary-600">
                            {message.user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), 'HH:mm', { locale: ko })}
                          </span>
                        </div>
                        <p
                          className={`text-sm rounded-lg p-2 max-w-[70%] ${
                            message.user._id === user?.id
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-800 bg-gray-100'
                          }`}
                        >
                          {message.message}
                        </p>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                {isAuthenticated ? (
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || !connected}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        전송
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 border-t text-center text-sm text-gray-500">
                    <Link to="/login" className="text-primary-600 hover:underline">
                      로그인
                    </Link>
                    이 필요합니다
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                채팅룸을 선택해주세요
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;

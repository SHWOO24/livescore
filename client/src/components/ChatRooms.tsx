import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  members: Array<{
    _id: string;
    name: string;
  }>;
  isPublic: boolean;
  createdAt: string;
}

interface ChatRoomsProps {
  onSelectRoom: (roomId: string) => void;
  selectedRoomId?: string;
}

const ChatRooms: React.FC<ChatRoomsProps> = ({ onSelectRoom, selectedRoomId }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chat-rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('채팅룸 로드 실패:', error);
      toast.error('채팅룸을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      toast.error('채팅룸 이름을 입력해주세요');
      return;
    }

    try {
      const response = await api.post('/api/chat-rooms', {
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || undefined,
        isPublic: true,
      });
      
      setRooms([response.data.room, ...rooms]);
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateForm(false);
      toast.success('채팅룸이 생성되었습니다');
      onSelectRoom(response.data.room._id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '채팅룸 생성에 실패했습니다');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await api.post(`/api/chat-rooms/${roomId}/join`);
      toast.success('채팅룸에 참여했습니다');
      loadRooms();
      onSelectRoom(roomId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '채팅룸 참여에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">채팅룸</h3>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              {showCreateForm ? '취소' : '+ 생성'}
            </button>
          )}
        </div>

        {showCreateForm && isAuthenticated && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateRoom}
            className="space-y-2 mb-4"
          >
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="채팅룸 이름"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={50}
            />
            <input
              type="text"
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              placeholder="설명 (선택사항)"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={200}
            />
            <button
              type="submit"
              className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
            >
              생성
            </button>
          </motion.form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            채팅룸이 없습니다
          </div>
        ) : (
          <div className="p-2">
            {rooms.map((room) => {
              const isMember = isAuthenticated && user && room.members.some((m: any) => m._id === user.id);
              const isSelected = selectedRoomId === room._id;

              return (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onSelectRoom(room._id)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">{room.name}</h4>
                      {room.description && (
                        <p className="text-xs text-gray-500 mt-1">{room.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-400">
                          멤버 {room.members.length}명
                        </span>
                        {room.isPublic && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            공개
                          </span>
                        )}
                      </div>
                    </div>
                    {!isMember && isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinRoom(room._id);
                        }}
                        className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        참여
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRooms;

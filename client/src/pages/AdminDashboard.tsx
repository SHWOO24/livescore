import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

  useEffect(() => {
    // ADMIN 권한 확인
    if (user && user.role !== 'ADMIN') {
      toast.error('관리자 권한이 필요합니다');
      navigate('/');
      return;
    }

    fetchUsers();
  }, [filterStatus, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'ALL' ? undefined : filterStatus;
      const response = await api.get('/api/admin/users', {
        params: status ? { status } : {},
      });
      setUsers(response.data.users || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('관리자 권한이 필요합니다');
        navigate('/admin/login');
      } else {
        toast.error('사용자 목록을 불러오는데 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.patch(`/api/admin/users/${userId}/approve`);
      toast.success('사용자가 승인되었습니다');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '승인에 실패했습니다');
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('정말로 이 사용자를 거절하시겠습니까?')) {
      return;
    }

    try {
      await api.patch(`/api/admin/users/${userId}/reject`);
      toast.success('사용자가 거절되었습니다');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '거절에 실패했습니다');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || ''}`}>
        {status === 'PENDING' ? '승인 대기' : status === 'APPROVED' ? '승인됨' : '거절됨'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'PENDING'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              승인 대기
            </button>
            <button
              onClick={() => setFilterStatus('APPROVED')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'APPROVED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              승인됨
            </button>
            <button
              onClick={() => setFilterStatus('REJECTED')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'REJECTED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              거절됨
            </button>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">사용자가 없습니다</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <motion.li
                  key={user._id || user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {getStatusBadge(user.status)}
                        <span className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    {user.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user._id || user.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(user._id || user.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

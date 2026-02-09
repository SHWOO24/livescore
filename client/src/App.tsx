/**
 * 라이브스코어 메인 애플리케이션
 * 
 * ⚠️ Namecheap Shared Hosting 배포 시 주의사항:
 * 
 * 1. 실시간 기능 제한:
 *    - Socket.io (실시간 채팅, 스코어 업데이트) 동작 안 함
 *    - 백엔드 API 호출 불가 (로그인, 회원가입 등)
 * 
 * 2. 해결 방법:
 *    - 별도 백엔드 서버 배포 필요 (VPS, Railway, Render 등)
 *    - API URL을 환경 변수로 설정하여 외부 서버 연결
 *    - 재빌드 후 배포
 * 
 * 3. 현재 상태:
 *    - 정적 파일만 서비스 가능
 *    - SPA 라우팅은 .htaccess로 처리됨
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';

// 코드 스플리팅: 페이지를 동적으로 로드
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                }
              />
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

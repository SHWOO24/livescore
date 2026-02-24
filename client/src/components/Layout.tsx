import React, { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import Sidebar from './Sidebar';
import Logo from './Logo';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/scorelivenow';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-80">
        {/* 헤더 */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          {/* 상단 헤더 텔레그램 문의 배너 */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <motion.a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.01 }}
                className="block text-center"
              >
                <p className="text-primary-700 font-semibold text-sm">📱 텔레그램 문의 scorelivenow.com</p>
              </motion.a>
            </div>
          </div>

          {/* 메인 헤더 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Logo size="md" showText={true} className="flex items-center" />

              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  {t('header.home')}
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <LanguageSelector />
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-gray-600 hidden sm:inline">
                      {user?.name}{t('header.welcome')}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {t('header.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {t('header.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      {t('header.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1">{children}</main>

        {/* 푸터 */}
        <footer className="bg-gray-800 text-white mt-12">
          {/* 푸터 텔레그램 문의 배너 */}
          <div className="bg-gray-900 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <motion.a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block text-center"
              >
                <p className="text-white font-semibold">📱 텔레그램 문의 scorelivenow.com</p>
              </motion.a>
            </div>
          </div>

          {/* 푸터 정보 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-400">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

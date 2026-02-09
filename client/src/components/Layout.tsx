import React, { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import Sidebar from './Sidebar';
import OptimizedImage from './OptimizedImage';

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

  const headerAdBanners = [
    {
      id: 1,
      title: 'Header Ad',
      image: 'https://via.placeholder.com/728x90/0ea5e9/ffffff?text=Header+Banner+Ad',
      link: '#',
      size: '728x90',
    },
  ];

  const footerAdBanners = [
    {
      id: 1,
      title: 'Footer Ad 1',
      image: 'https://via.placeholder.com/300x100/10b981/ffffff?text=Footer+Ad+1',
      link: '#',
      size: '300x100',
    },
    {
      id: 2,
      title: 'Footer Ad 2',
      image: 'https://via.placeholder.com/300x100/8b5cf6/ffffff?text=Footer+Ad+2',
      link: '#',
      size: '300x100',
    },
    {
      id: 3,
      title: 'Footer Ad 3',
      image: 'https://via.placeholder.com/300x100/f59e0b/ffffff?text=Footer+Ad+3',
      link: '#',
      size: '300x100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-80">
        {/* 헤더 */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          {/* 상단 헤더 광고 배너 */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center justify-center gap-4">
                {headerAdBanners.length > 0 ? (
                  headerAdBanners.map((banner) => (
                    <motion.div
                      key={banner.id}
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                    >
                      <motion.a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <OptimizedImage
                          src={banner.image}
                          alt={banner.title}
                          className="h-16 w-auto mx-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          lazy={true}
                        />
                      </motion.a>
                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                        {banner.size}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-center min-w-[728px]"
                  >
                    <a
                      href="mailto:ad@scorelivenow.com?subject=배너광고 문의"
                      className="block"
                    >
                      <p className="text-white font-bold text-lg">📢 배너광고 모집</p>
                      <p className="text-white text-sm mt-1">상단 배너 (728x90)</p>
                      <p className="text-white text-xs mt-1">광고 문의: ad@scorelivenow.com</p>
                    </a>
                    <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                      728x90
                    </span>
                  </motion.div>
                )}
              </div>
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

              <Link to="/" className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center"
                >
                  <span className="text-6xl md:text-7xl lg:text-8xl font-bold text-primary-600 leading-none">
                    S
                  </span>
                </motion.div>
              </Link>

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
          {/* 푸터 광고 배너 */}
          <div className="bg-gray-900 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {footerAdBanners.length > 0 ? (
                  footerAdBanners.map((banner) => (
                    <motion.div
                      key={banner.id}
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <OptimizedImage
                          src={banner.image}
                          alt={banner.title}
                          className="h-20 w-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                          lazy={true}
                        />
                      </motion.a>
                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                        {banner.size}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 text-center min-w-[300px]"
                  >
                    <a
                      href="mailto:ad@scorelivenow.com?subject=배너광고 문의"
                      className="block"
                    >
                      <p className="text-white font-bold">📢 배너광고 모집</p>
                      <p className="text-white text-xs mt-1">하단 배너 (300x100)</p>
                      <p className="text-white text-xs mt-1">광고 문의: ad@scorelivenow.com</p>
                    </a>
                    <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                      300x100
                    </span>
                  </motion.div>
                )}
              </div>
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

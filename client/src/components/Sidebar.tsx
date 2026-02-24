import React from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/scorelivenow';

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto ${
          isOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="p-6">
          {/* 닫기 버튼 (모바일) */}
          <div className="flex justify-end mb-6 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 텔레그램 문의 배너 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">문의</h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <motion.a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <p className="text-white font-bold text-lg mb-2">📱 텔레그램 문의</p>
                <p className="text-white text-base">scorelivenow.com</p>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

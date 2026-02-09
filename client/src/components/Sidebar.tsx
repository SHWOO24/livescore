import React from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const adBanners = [
    {
      id: 1,
      title: 'Sidebar Ad 1',
      image: 'https://via.placeholder.com/300x250/0ea5e9/ffffff?text=Sidebar+Ad+1',
      link: '#',
      size: '300x250',
    },
    {
      id: 2,
      title: 'Sidebar Ad 2',
      image: 'https://via.placeholder.com/300x250/10b981/ffffff?text=Sidebar+Ad+2',
      link: '#',
      size: '300x250',
    },
  ];

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

          {/* 광고 배너 섹션 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">광고</h3>
            {adBanners.length > 0 ? (
              adBanners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <motion.a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    className="block"
                  >
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    />
                  </motion.a>
                  <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                    {banner.size}
                  </span>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-center"
              >
                <a
                  href="mailto:ad@scorelivenow.com?subject=배너광고 문의"
                  className="block"
                >
                  <p className="text-white font-bold">📢 배너광고 모집</p>
                  <p className="text-white text-sm mt-2">사이드 배너 (300x250)</p>
                  <p className="text-white text-xs mt-1">광고 문의: ad@scorelivenow.com</p>
                </a>
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                  300x250
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

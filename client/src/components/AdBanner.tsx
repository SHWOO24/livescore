import React from 'react';
import { motion } from 'framer-motion';

const AdBanner: React.FC = () => {
  // 실제 광고는 여기에 배너 이미지나 광고 코드를 넣으면 됩니다
  const adBanners = [
    {
      id: 1,
      title: '협찬사 배너 1',
      image: 'https://via.placeholder.com/728x90/0ea5e9/ffffff?text=Sponsor+Banner+1',
      link: '#',
      size: '728x90',
    },
    {
      id: 2,
      title: '협찬사 배너 2',
      image: 'https://via.placeholder.com/728x90/10b981/ffffff?text=Sponsor+Banner+2',
      link: '#',
      size: '728x90',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-50 via-white to-primary-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          {adBanners.length > 0 ? (
            adBanners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative shine-effect rounded-xl overflow-hidden"
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
                    className="w-full max-w-4xl h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </motion.a>
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                  {banner.size}
                </span>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-center min-w-[728px]"
            >
              <a
                href="mailto:ad@scorelivenow.com?subject=배너광고 문의"
                className="block"
              >
                <p className="text-white font-bold text-xl">📢 배너광고 모집</p>
                <p className="text-white text-base mt-2">메인 배너 (728x90)</p>
                <p className="text-white text-sm mt-1">광고 문의: ad@scorelivenow.com</p>
              </a>
              <span className="absolute -bottom-1 -right-1 text-[8px] bg-gray-800 text-white px-1 rounded">
                728x90
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdBanner;

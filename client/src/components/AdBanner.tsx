import React from 'react';
import { motion } from 'framer-motion';

const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/scorelivenow';

const AdBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary-50 via-white to-primary-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center"
        >
          <motion.a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="block w-full max-w-4xl bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <p className="text-white font-bold text-xl mb-2">📱 텔레그램 문의</p>
            <p className="text-white text-lg">scorelivenow.com</p>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default AdBanner;

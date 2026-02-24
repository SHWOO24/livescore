import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex-shrink-0"
      >
        {/* SVG 로고: 축구공 + 펄스 라인 + LIVE SCORE */}
        <svg
          width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          viewBox="0 0 200 200"
          className={`${sizeClasses[size]} flex-shrink-0`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 그라데이션 정의 */}
            <linearGradient id="ballGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* 펄스 라인 (축구공 왼쪽) */}
          <motion.path
            d="M 20 100 L 40 100 L 50 80 L 60 120 L 70 90 L 80 110 L 90 100 L 100 100"
            stroke="url(#pulseGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* 축구공 (중앙) */}
          <g transform="translate(100, 100)">
            {/* 축구공 배경 (원) */}
            <circle
              cx="0"
              cy="0"
              r="45"
              fill="url(#ballGradient)"
            />
            
            {/* 축구공 패턴 (육각형 + 오각형) */}
            {/* 중심 오각형 */}
            <polygon
              points="0,-20 19,-6 12,16 -12,16 -19,-6"
              fill="white"
              fillOpacity="0.9"
            />
            
            {/* 주변 육각형들 */}
            <polygon
              points="0,-35 17,-28 17,-8 0,-1 -17,-8 -17,-28"
              fill="white"
              fillOpacity="0.7"
            />
            <polygon
              points="30,-10 35,8 25,20 10,20 5,8 10,-10"
              fill="white"
              fillOpacity="0.7"
            />
            <polygon
              points="30,10 25,28 10,28 5,20 10,2 25,2"
              fill="white"
              fillOpacity="0.7"
            />
            <polygon
              points="0,35 -17,28 -17,8 0,1 17,8 17,28"
              fill="white"
              fillOpacity="0.7"
            />
            <polygon
              points="-30,10 -25,28 -10,28 -5,20 -10,2 -25,2"
              fill="white"
              fillOpacity="0.7"
            />
            <polygon
              points="-30,-10 -35,8 -25,20 -10,20 -5,8 -10,-10"
              fill="white"
              fillOpacity="0.7"
            />
          </g>

          {/* 속도 라인 (축구공 아래) */}
          <motion.path
            d="M 60 150 L 80 145 L 100 150 L 120 145 L 140 150"
            stroke="url(#speedGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* LIVE SCORE 텍스트 */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`font-bold ${textSizes[size]} bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent whitespace-nowrap`}
        >
          LIVE SCORE
        </motion.div>
      )}
    </Link>
  );
};

export default Logo;

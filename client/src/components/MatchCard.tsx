import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

interface Match {
  _id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  matchDate: string;
  venue?: string;
}

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { t } = useTranslation();
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isScheduled = match.status === 'scheduled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-lg p-6 card-hover ${
        isLive ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-primary-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {match.sport}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
            {match.league}
          </span>
        </div>
        {isLive && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center space-x-1 text-red-600"
          >
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            <span className="text-sm font-semibold">{t('match.live')}</span>
          </motion.div>
        )}
        {isScheduled && (
          <span className="text-sm text-gray-500">
            {format(new Date(match.matchDate), 'MM월 dd일 HH:mm', { locale: ko })}
          </span>
        )}
        {isFinished && (
          <span className="text-sm text-gray-500">{t('match.finished')}</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{match.homeTeam}</p>
            {match.venue && (
              <p className="text-xs text-gray-500 mt-1">{match.venue}</p>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mx-4">
            {isScheduled ? '-' : match.homeScore}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{match.awayTeam}</p>
          </div>
          <div className="text-2xl font-bold text-gray-900 mx-4">
            {isScheduled ? '-' : match.awayScore}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import api from '../utils/api';
import MatchCard from '../components/MatchCard';
import LiveChat from '../components/LiveChat';
import AdBanner from '../components/AdBanner';
import toast from 'react-hot-toast';

// 정규화된 이벤트 타입 (백엔드와 동일)
interface NormalizedEvent {
  sport: string;
  eventId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  startTime: string;
  lastUpdated: string;
  venue?: string;
}

// 스포츠 목록 (우선순위 순서)
const DEFAULT_SPORTS = [
  'Soccer',
  'Basketball',
  'American Football',
  'Baseball',
  'Ice Hockey',
  'Cricket',
  'Tennis',
  'Fighting',
  'Motorsport',
  'Volleyball',
];

// 연결 모드 타입
type ConnectionMode = 'socket' | 'rest';

const Home: React.FC = () => {
  const [sports, setSports] = useState<string[]>(DEFAULT_SPORTS);
  const [selectedSport, setSelectedSport] = useState<string>(DEFAULT_SPORTS[0]);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('rest');
  const { socket, connected } = useSocket();

  // 스포츠 목록 로드
  useEffect(() => {
    loadSports();
  }, []);

  // 선택된 스포츠의 스코어 로드
  useEffect(() => {
    if (selectedSport) {
      loadScores(selectedSport);
    }
  }, [selectedSport]);

  // Socket.io 실시간 업데이트 구독
  useEffect(() => {
    if (!socket || !selectedSport) return;

    // 연결 모드 업데이트
    if (connected) {
      setConnectionMode('socket');
    }

    // 스코어 업데이트 구독
    const today = new Date().toISOString().split('T')[0];
    socket.emit('subscribe', { sport: selectedSport, date: today });

    // livescore:update 이벤트 수신
    const handleLivescoreUpdate = (data: { 
      sport: string; 
      date: string; 
      events: Array<{
        sport: string;
        eventId: string;
        league: string;
        home: { name: string; score: number };
        away: { name: string; score: number };
        status: 'scheduled' | 'live' | 'finished';
        date: string;
        time: string;
      }>; 
      timestamp: string;
    }) => {
      if (data.sport === selectedSport) {
        // 프론트엔드 형식에서 NormalizedEvent로 변환
        const normalizedEvents: NormalizedEvent[] = data.events.map((e) => ({
          sport: e.sport,
          eventId: e.eventId,
          league: e.league,
          homeTeam: e.home.name,
          awayTeam: e.away.name,
          homeScore: e.home.score,
          awayScore: e.away.score,
          status: e.status,
          startTime: new Date(`${e.date}T${e.time}`).toISOString(),
          lastUpdated: data.timestamp,
        }));

        // 기존 이벤트와 병합
        setEvents((prev) => {
          const eventMap = new Map(prev.map(e => [e.eventId, e]));
          
          // 업데이트된 이벤트로 교체
          for (const event of normalizedEvents) {
            eventMap.set(event.eventId, event);
          }
          
          return Array.from(eventMap.values());
        });
        setLastUpdated(data.timestamp);
      }
    };

    socket.on('livescore:update', handleLivescoreUpdate);

    return () => {
      socket.off('livescore:update', handleLivescoreUpdate);
      socket.emit('unsubscribe', { sport: selectedSport, date: today });
    };
  }, [socket, selectedSport, connected]);

  const loadSports = async () => {
    try {
      const response = await api.get('/api/sports');
      if (response.data.sports && response.data.sports.length > 0) {
        setSports(response.data.sports);
        if (!selectedSport || !response.data.sports.includes(selectedSport)) {
          setSelectedSport(response.data.sports[0]);
        }
      }
    } catch (error: any) {
      console.error('스포츠 목록 로드 실패:', error);
      // 기본값 사용
    }
  };

  const loadScores = useCallback(async (sport: string, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // /api/livescore?sport=Soccer 엔드포인트 사용
      const response = await api.get(`/api/livescore`, {
        params: { sport },
      });
      
      if (response.data.events) {
        // 프론트엔드 형식에서 NormalizedEvent로 변환
        const normalizedEvents: NormalizedEvent[] = response.data.events.map((e: any) => ({
          sport: e.sport,
          eventId: e.eventId,
          league: e.league,
          homeTeam: e.home.name,
          awayTeam: e.away.name,
          homeScore: e.home.score,
          awayScore: e.away.score,
          status: e.status,
          startTime: new Date(`${e.date}T${e.time}`).toISOString(),
          lastUpdated: response.data.timestamp || new Date().toISOString(),
        }));
        
        setEvents(normalizedEvents);
        setLastUpdated(response.data.timestamp || new Date().toISOString());
      }
    } catch (error: any) {
      console.error('스코어 로드 실패:', error);
      
      if (!silent) {
        const errorKey = 'backend-connection-error';
        if (!sessionStorage.getItem(errorKey)) {
          toast.error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.', {
            duration: 5000,
          });
          sessionStorage.setItem(errorKey, 'true');
          setTimeout(() => sessionStorage.removeItem(errorKey), 30000);
        }
      }
      
      if (!silent) {
        setEvents([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Socket.io가 연결되지 않은 경우 REST 폴링 fallback (30초 주기)
  useEffect(() => {
    if (connected || !selectedSport) {
      // Socket 연결 시 REST 폴링 중지
      if (connected) {
        setConnectionMode('socket');
      }
      return;
    }

    // REST 모드로 전환
    setConnectionMode('rest');

    // 즉시 한 번 로드
    loadScores(selectedSport, true);

    // 30초마다 REST 폴링
    const interval = setInterval(() => {
      loadScores(selectedSport, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [connected, selectedSport, loadScores]);

  // 이벤트를 MatchCard 형식으로 변환
  const convertToMatch = (event: NormalizedEvent) => ({
    _id: event.eventId,
    sport: event.sport,
    league: event.league,
    homeTeam: event.homeTeam,
    awayTeam: event.awayTeam,
    homeScore: event.homeScore,
    awayScore: event.awayScore,
    status: event.status,
    matchDate: event.startTime,
    venue: event.venue,
  });

  const liveEvents = events.filter((e) => e.status === 'live');
  const scheduledEvents = events.filter((e) => e.status === 'scheduled');
  const finishedEvents = events.filter((e) => e.status === 'finished');

  return (
    <div className="min-h-screen">
      {/* 협찬사 배너 광고 */}
      <AdBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            실시간 라이브스코어
          </h1>
          <p className="text-gray-600">
            모든 스포츠 경기의 실시간 스코어와 정보를 확인하세요
          </p>
          <div className="flex items-center gap-4 mt-2">
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
              </p>
            )}
            {/* 연결 모드 표시 */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                connectionMode === 'socket' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {connectionMode === 'socket' ? '🔴 실시간 (Socket)' : '🟡 폴링 (REST)'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 스포츠 탭 메뉴 */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${
                selectedSport === sport
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {sport}
              {selectedSport === sport && (
                <motion.div
                  layoutId="activeSportTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                />
              )}
            </button>
          ))}
        </div>

        {/* 상태별 탭 */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'all', label: '전체', count: events.length },
            { id: 'live', label: '라이브', count: liveEvents.length },
            { id: 'scheduled', label: '예정', count: scheduledEvents.length },
            { id: 'finished', label: '종료', count: finishedEvents.length },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab.id === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 경기 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{selectedSport} 경기 정보가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">
              {connected ? '실시간 업데이트 대기 중...' : '백엔드 서버가 실행 중인지 확인해주세요.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.eventId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchCard match={convertToMatch(event)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 실시간 채팅 */}
      <LiveChat />
    </div>
  );
};

export default Home;

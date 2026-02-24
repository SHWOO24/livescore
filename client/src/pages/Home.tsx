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

type StatusFilter = 'all' | 'live' | 'scheduled' | 'finished';

const Home: React.FC = () => {
  const [sports, setSports] = useState<string[]>(DEFAULT_SPORTS);
  const [selectedSport, setSelectedSport] = useState<string>(DEFAULT_SPORTS[0]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('rest');
  const { socket, connected } = useSocket();

  // 스포츠 목록 및 라이브스코어 로드 (인증과 완전히 독립적으로 실행)
  useEffect(() => {
    // 인증 상태와 관계없이 즉시 로드
    const loadData = async () => {
      // 병렬로 로드하여 인증 실패가 라이브스코어 로딩을 방해하지 않도록 함
      await Promise.allSettled([
        loadSports(),
        loadScores(selectedSport, false),
      ]);
    };
    
    loadData();
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
      // 에러 로깅 강화 (상태 코드, 메시지 포함)
      console.warn('[Home] 스포츠 목록 로드 실패 (기본값 사용):', {
        status: error.response?.status,
        message: error.message,
        code: error.code,
      });
      // 기본값 사용 - 페이지는 계속 렌더링됨
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
      
      // 응답 데이터 로깅 (디버깅용)
      const rawCount = Array.isArray(response.data.events) ? response.data.events.length : 0;
      console.log(`[Home] Livescore 응답 수신:`, {
        sport,
        rawCount,
        hasEvents: Array.isArray(response.data.events),
        ok: response.data.ok,
        error: response.data.error,
        debug: response.data._debug,
        timestamp: response.data.timestamp,
      });
      
      // events가 배열인지 확인 (빈 배열도 처리)
      if (Array.isArray(response.data.events)) {
        // 프론트엔드 형식에서 NormalizedEvent로 변환
        const normalizedEvents: NormalizedEvent[] = response.data.events.map((e: {
          sport?: string;
          eventId?: string;
          league?: string;
          home?: { name?: string; score?: number };
          away?: { name?: string; score?: number };
          homeTeam?: string;
          awayTeam?: string;
          homeScore?: number;
          awayScore?: number;
          status?: 'scheduled' | 'live' | 'finished';
          date?: string;
          time?: string;
          startTime?: string;
          venue?: string;
        }) => {
          try {
            return {
              sport: e.sport || sport,
              eventId: e.eventId || `unknown-${Date.now()}-${Math.random()}`,
              league: e.league || 'Unknown League',
              homeTeam: e.home?.name || e.homeTeam || 'Home Team',
              awayTeam: e.away?.name || e.awayTeam || 'Away Team',
              homeScore: typeof e.home?.score === 'number' ? e.home.score : (typeof e.homeScore === 'number' ? e.homeScore : 0),
              awayScore: typeof e.away?.score === 'number' ? e.away.score : (typeof e.awayScore === 'number' ? e.awayScore : 0),
              status: e.status || 'scheduled',
              startTime: e.date && e.time ? new Date(`${e.date}T${e.time}`).toISOString() : (e.startTime || new Date().toISOString()),
              lastUpdated: response.data.timestamp || new Date().toISOString(),
              venue: e.venue,
            };
          } catch (parseError) {
            console.warn('[Home] 이벤트 파싱 실패:', e, parseError);
            return null;
          }
        }).filter((e: NormalizedEvent | null): e is NormalizedEvent => e !== null);
        
        // 필터링 전 카운트 로깅
        const countBeforeFilter = normalizedEvents.length;
        console.log(`[Home] 이벤트 변환 완료:`, {
          sport,
          countBeforeFilter,
          normalizedCount: normalizedEvents.length,
        });
        
        setEvents(normalizedEvents);
        setLastUpdated(response.data.timestamp || new Date().toISOString());
        
        // 필터별 카운트 로깅
        const liveCount = normalizedEvents.filter(e => e.status === 'live').length;
        const scheduledCount = normalizedEvents.filter(e => e.status === 'scheduled').length;
        const finishedCount = normalizedEvents.filter(e => e.status === 'finished').length;
        
        console.log(`[Home] 필터별 카운트:`, {
          sport,
          total: normalizedEvents.length,
          live: liveCount,
          scheduled: scheduledCount,
          finished: finishedCount,
          currentFilter: statusFilter,
        });
      } else {
        // events가 배열이 아닌 경우
        console.warn(`[Home] events가 배열이 아님:`, {
          sport,
          eventsType: typeof response.data.events,
          eventsValue: response.data.events,
          fullResponse: response.data,
        });
        setEvents([]);
        setLastUpdated(new Date().toISOString());
      }
    } catch (error: any) {
      // 에러 로깅 강화
      console.warn('[Home] 스코어 로드 실패:', {
        status: error.response?.status,
        message: error.message,
        code: error.code,
        url: error.config?.url,
      });
      
      if (!silent) {
        const errorKey = 'backend-connection-error';
        if (!sessionStorage.getItem(errorKey)) {
          // 네트워크 오류가 아닌 경우에만 토스트 표시 (401 등은 정상)
          if (error.code !== 'ERR_NETWORK' && error.response?.status !== 401) {
            toast.error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.', {
              duration: 5000,
            });
            sessionStorage.setItem(errorKey, 'true');
            setTimeout(() => sessionStorage.removeItem(errorKey), 30000);
          }
        }
      }
      
      // 빈 배열로 설정하여 "경기 정보가 없습니다" 메시지 표시
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

  // 상태별 필터링
  const liveEvents = React.useMemo(() => 
    events.filter((e) => e.status === 'live'), 
    [events]
  );
  const scheduledEvents = React.useMemo(() => 
    events.filter((e) => e.status === 'scheduled'), 
    [events]
  );
  const finishedEvents = React.useMemo(() => 
    events.filter((e) => e.status === 'finished'), 
    [events]
  );

  // 선택된 필터에 따라 이벤트 필터링
  const filteredEvents = React.useMemo(() => {
    let result: NormalizedEvent[];
    switch (statusFilter) {
      case 'live':
        result = liveEvents;
        break;
      case 'scheduled':
        result = scheduledEvents;
        break;
      case 'finished':
        result = finishedEvents;
        break;
      default:
        result = events;
    }
    
    // 필터링 결과 로깅 (디버깅용)
    if (result.length === 0 && events.length > 0) {
      console.log(`[Home] 필터링 결과:`, {
        sport: selectedSport,
        statusFilter,
        totalEvents: events.length,
        liveCount: liveEvents.length,
        scheduledCount: scheduledEvents.length,
        finishedCount: finishedEvents.length,
        filteredCount: result.length,
      });
    }
    
    return result;
  }, [events, statusFilter, liveEvents, scheduledEvents, finishedEvents, selectedSport]);

  return (
    <div className="min-h-screen">
      {/* 텔레그램 문의 배너 */}
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
            { id: 'all' as StatusFilter, label: '전체', count: events.length },
            { id: 'live' as StatusFilter, label: '라이브', count: liveEvents.length },
            { id: 'scheduled' as StatusFilter, label: '예정', count: scheduledEvents.length },
            { id: 'finished' as StatusFilter, label: '종료', count: finishedEvents.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  statusFilter === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {statusFilter === 'all' 
                ? `${selectedSport} 경기 정보가 없습니다`
                : `${selectedSport} ${statusFilter === 'live' ? '라이브' : statusFilter === 'scheduled' ? '예정' : '종료'} 경기가 없습니다`}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {events.length === 0 
                ? (connected 
                  ? '실시간 업데이트 대기 중... (데이터 소스에서 경기를 가져오는 중일 수 있습니다)'
                  : '백엔드 서버가 실행 중인지 확인해주세요.')
                : `전체 ${events.length}개 경기 중 ${statusFilter === 'live' ? '라이브' : statusFilter === 'scheduled' ? '예정' : '종료'} 경기가 없습니다.`}
            </p>
            {events.length === 0 && (
              <button
                onClick={() => loadScores(selectedSport, false)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                다시 시도
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
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

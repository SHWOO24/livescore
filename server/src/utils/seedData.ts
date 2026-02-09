import Match from '../models/Match.js';
import ChatRoom from '../models/ChatRoom.js';

// 샘플 경기 데이터 생성 (개발용)
export const seedMatches = async () => {
  try {
    const count = await Match.countDocuments();
    if (count > 0) {
      console.log('✅ 경기 데이터가 이미 존재합니다');
      return;
    }

    const sampleMatches = [
      {
        sport: '축구',
        league: 'K리그1',
        homeTeam: 'FC 서울',
        awayTeam: '수원 삼성',
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        matchDate: new Date(),
        venue: '서울월드컵경기장',
      },
      {
        sport: '축구',
        league: '프리미어리그',
        homeTeam: '맨체스터 유나이티드',
        awayTeam: '리버풀',
        homeScore: 0,
        awayScore: 0,
        status: 'live',
        matchDate: new Date(),
        venue: '올드 트래퍼드',
      },
      {
        sport: '야구',
        league: 'KBO',
        homeTeam: 'LG 트윈스',
        awayTeam: 'KT 위즈',
        homeScore: 5,
        awayScore: 3,
        status: 'finished',
        matchDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        venue: '잠실야구장',
      },
      {
        sport: '축구',
        league: '라리가',
        homeTeam: '레알 마드리드',
        awayTeam: '바르셀로나',
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled',
        matchDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        venue: '산티아고 베르나베우',
      },
      {
        sport: '농구',
        league: 'KBL',
        homeTeam: '서울 SK',
        awayTeam: '원주 DB',
        homeScore: 78,
        awayScore: 82,
        status: 'finished',
        matchDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        venue: '잠실체육관',
      },
    ];

    await Match.insertMany(sampleMatches);
    console.log('✅ 샘플 경기 데이터가 생성되었습니다');
  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
  }
};

// 샘플 채팅룸 데이터 생성 (개발용)
export const seedChatRooms = async () => {
  try {
    const count = await ChatRoom.countDocuments();
    if (count > 0) {
      console.log('✅ 채팅룸 데이터가 이미 존재합니다');
      return;
    }

    // 시스템 생성 채팅룸 (createdBy 없이 생성)
    const sampleRooms = [
      {
        name: '전체 채팅',
        description: '모든 회원이 참여할 수 있는 공개 채팅룸',
        isPublic: true,
        members: [],
      },
      {
        name: '축구 토론방',
        description: '축구 경기와 관련된 이야기를 나누는 채팅룸',
        isPublic: true,
        members: [],
      },
      {
        name: '야구 토론방',
        description: '야구 경기와 관련된 이야기를 나누는 채팅룸',
        isPublic: true,
        members: [],
      },
    ];

    await ChatRoom.insertMany(sampleRooms);
    console.log('✅ 샘플 채팅룸 데이터가 생성되었습니다');
  } catch (error) {
    console.error('❌ 채팅룸 데이터 생성 실패:', error);
  }
};

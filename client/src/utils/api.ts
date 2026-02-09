/**
 * API 클라이언트 설정
 * 
 * 백엔드 서버 URL 우선순위:
 * 1. VITE_API_BASE_URL 환경변수 (명시적 설정)
 * 2. 현재 도메인 기반 자동 감지 (프로덕션)
 * 3. localhost:5000 (개발 환경)
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 백엔드 서버 URL 결정
function getApiBaseURL(): string {
  // 1. 환경변수가 명시적으로 설정된 경우 (최우선)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. 프로덕션 환경에서는 환경변수가 필수
  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    console.error(
      '❌ [API] VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.\n' +
      '프로덕션 환경에서는 백엔드 서버 URL을 환경변수로 설정해야 합니다.\n' +
      '예: VITE_API_BASE_URL=https://api.scorelivenow.com'
    );
    // 프로덕션에서 환경변수가 없으면 빈 문자열 반환하여 명확한 에러 발생
    return '';
  }

  // 3. 개발 환경 기본값
  return 'http://localhost:5000';
}

const apiBaseURL = getApiBaseURL();

// 프로덕션 환경에서 환경변수가 없으면 에러 표시
if ((import.meta.env.MODE === 'production' || import.meta.env.PROD) && !apiBaseURL) {
  console.error(
    '❌ [API] 백엔드 서버 URL이 설정되지 않았습니다.\n' +
    '프로덕션 환경에서는 VITE_API_BASE_URL 환경변수를 설정하고 재빌드해야 합니다.\n' +
    '자세한 내용은 client/.env.production.example 파일을 참조하세요.'
  );
}

const api = axios.create({
  baseURL: apiBaseURL || '/api', // 폴백: 상대 경로 (프로덕션에서 환경변수 없을 때)
  withCredentials: true,
  timeout: 15000, // 15초 타임아웃 (프로덕션 네트워크 지연 고려)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 로깅
api.interceptors.request.use(
  (config) => {
    // 개발 환경에서만 로깅
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 재시도 로직 및 에러 처리
let retryCount = 0;
const MAX_RETRIES = 3;

api.interceptors.response.use(
  (response) => {
    retryCount = 0; // 성공 시 재시도 카운트 리셋
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 404 오류는 재시도하지 않음 (백엔드 서버가 없는 경우)
    if (error.response?.status === 404) {
      console.warn('[API] 404 오류: 백엔드 서버를 찾을 수 없습니다.');
      retryCount = 0;
      return Promise.reject(error);
    }
    
    // 네트워크 오류 또는 타임아웃인 경우에만 재시도
    if (
      (error.code === 'ERR_NETWORK' || 
       error.code === 'ECONNABORTED' || 
       error.code === 'ERR_INTERNET_DISCONNECTED') &&
      !config._retry &&
      retryCount < MAX_RETRIES
    ) {
      retryCount++;
      config._retry = true;
      
      // 지수 백오프: 1초, 2초, 3초
      const delay = retryCount * 1000;
      
      if (import.meta.env.DEV) {
        console.log(`[API] 재시도 ${retryCount}/${MAX_RETRIES} (${delay}ms 후)`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      return api(config);
    }
    
    retryCount = 0;
    return Promise.reject(error);
  }
);

export default api;

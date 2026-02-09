/**
 * API 클라이언트 설정
 * 
 * 백엔드 서버 URL:
 * - VITE_API_BASE_URL 환경변수 사용 (필수)
 * - 프로덕션: .env.production 파일에서 설정
 * - 개발: .env.development 파일에서 설정 (선택사항, 없으면 Vite proxy 사용)
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 백엔드 서버 URL 결정
function getApiBaseURL(): string {
  // 환경변수가 설정된 경우 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 프로덕션 환경에서는 환경변수가 필수
  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    console.error(
      '❌ [API] VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.\n' +
      '프로덕션 환경에서는 백엔드 서버 URL을 환경변수로 설정해야 합니다.\n' +
      '예: VITE_API_BASE_URL=https://acceptable-determination-production-a4db.up.railway.app\n' +
      '\n' +
      '해결 방법:\n' +
      '1. client/.env.production 파일 확인\n' +
      '2. VITE_API_BASE_URL=https://your-backend-url.com 설정\n' +
      '3. npm run build 실행\n' +
      '4. 재배포'
    );
    return '';
  }

  // 개발 환경: 환경변수가 없으면 빈 문자열 반환 (Vite proxy 사용)
  // Vite proxy는 vite.config.ts에서 설정됨
  return '';
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
  baseURL: apiBaseURL, // 환경변수에서 가져온 URL 사용
  withCredentials: true,
  timeout: 15000, // 15초 타임아웃 (프로덕션 네트워크 지연 고려)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 로깅 및 디버깅
api.interceptors.request.use(
  (config) => {
    // API 호출 정보 로깅 (프로덕션에서도 디버깅용)
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log(`[API] ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log(`[API] Base URL: ${config.baseURL || '(없음)'}`);
    return config;
  },
  (error) => {
    console.error('[API] 요청 오류:', error);
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
    
    // 에러 상세 정보 로깅
    console.error('[API] 응답 오류:', {
      url: config?.url,
      baseURL: config?.baseURL,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });
    
    // 404 오류는 재시도하지 않음 (백엔드 서버가 없는 경우)
    if (error.response?.status === 404) {
      console.warn('[API] 404 오류: 백엔드 서버를 찾을 수 없습니다.');
      console.warn(`[API] 요청 URL: ${config?.baseURL}${config?.url}`);
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

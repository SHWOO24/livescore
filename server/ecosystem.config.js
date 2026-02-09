/**
 * PM2 Ecosystem 설정 파일
 * 
 * 사용법:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'livescore-api',
      script: './dist/index.js',
      instances: 1, // 단일 인스턴스 (Socket.io는 단일 인스턴스 권장)
      exec_mode: 'fork', // cluster 모드는 Socket.io와 호환성 문제 가능
      
      // 환경변수 (개발)
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      
      // 환경변수 (프로덕션)
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // .env 파일에서 로드되므로 여기서는 기본값만 설정
        // 실제 값은 .env 파일 또는 시스템 환경변수에서 설정
      },
      
      // 로그 설정
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 자동 재시작 설정
      autorestart: true,
      watch: false, // 프로덕션에서는 false
      max_memory_restart: '500M',
      
      // 재시작 지연
      min_uptime: '10s',
      max_restarts: 10,
      
      // 기타 설정
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
    },
  ],
};

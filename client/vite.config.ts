import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 프로덕션 빌드 시 환경변수 체크 플러그인
const envCheckPlugin = () => {
  return {
    name: 'env-check',
    buildStart() {
      if (process.env.NODE_ENV === 'production' || process.env.MODE === 'production') {
        if (!process.env.VITE_API_BASE_URL) {
          console.warn(
            '\n⚠️  경고: VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.\n' +
            '프로덕션 빌드에서는 백엔드 서버 URL을 환경변수로 설정해야 합니다.\n' +
            '예: VITE_API_BASE_URL=https://api.scorelivenow.com\n' +
            '자세한 내용은 client/.env.production.example 파일을 참조하세요.\n'
          );
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), envCheckPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    // 빌드 결과물에 해시 포함 (캐싱 최적화)
    rollupOptions: {
      output: {
        // 파일명에 해시 포함
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 코드 스플리팅 최적화
        manualChunks: (id) => {
          // node_modules를 별도 청크로 분리
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            return 'vendor';
          }
        }
      }
    },
    // 청크 크기 경고 임계값 (500KB)
    chunkSizeWarningLimit: 500,
    // 소스맵 생성 (프로덕션에서는 false 권장)
    sourcemap: false,
    // 미사용 코드 제거 (esbuild 사용, 더 빠름)
    minify: 'esbuild',
    // 압축 최적화
    cssCodeSplit: true,
    // 타겟 브라우저 (최신 브라우저 지원)
    target: 'es2015',
    // 빌드 크기 최적화
    reportCompressedSize: true
  }
})

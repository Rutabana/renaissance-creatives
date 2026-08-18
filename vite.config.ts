import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Heavy media is served from CloudFront but proxied under the same origin at
// `/cdn/*` so three.js / canvas loads don't trip CORS. Production does this via
// the rewrite in `vercel.json`; dev + preview use this proxy. Keep the two in sync.
const cdnProxy = {
  '/cdn': {
    target: 'https://d3s90ejqky0l1n.cloudfront.net',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/cdn/, '/rennaissance-creatives'),
  },
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: cdnProxy,
    },
    preview: {
      proxy: cdnProxy,
    },
  };
});

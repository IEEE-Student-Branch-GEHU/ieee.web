import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // server/ has its own Jest suite (npm run test:server).
    exclude: [...configDefaults.exclude, 'server/**', 'responsive-audit.spec.js'],
  },
});

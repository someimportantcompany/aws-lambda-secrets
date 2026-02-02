import ms from 'ms';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: __dirname,
    include: ['*.test.ts'],
    testTimeout: ms('5m'),
  },
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist/',
  bundle: true,
  clean: true,
  format: 'cjs',
  minify: false,
  platform: 'node',
  sourcemap: false,
  splitting: false,
  target: 'node22',
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist/',
  bundle: true,
  clean: true,
  format: 'cjs',
  minify: true,
  platform: 'node',
  sourcemap: true,
  splitting: false,
  target: 'node22',
});

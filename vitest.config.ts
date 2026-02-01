import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: __dirname,
    include: ['src/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
    },
    env: {
      AWS_ACCESS_KEY_ID: 'ExampleAccessKey',
      AWS_SECRET_ACCESS_KEY: 'ExampleSecretAccessKey',
      AWS_SESSION_TOKEN: 'ExampleSessionToken',
      AWS_REGION: 'local',
      TZ: 'UTC',
    },
  },
});

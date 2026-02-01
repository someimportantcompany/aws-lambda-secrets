import { describe, beforeAll, afterAll, afterEach, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
// import type { GetParameterCommandOutput } from '@aws-sdk/client-ssm';

import { getSecretValueFromExtension } from './extension';

const key = 'key';
const value = 'value';

describe('#getSecretValueFromExtension', () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should fetch a string from Secrets Manager', async () => {
    server.use(
      http.get('http://localhost:2773/secretsmanager/get', () => {
        return HttpResponse.json({
          SecretString: value,
          $metadata: {},
        } satisfies GetSecretValueCommandOutput);
      }),
    );

    const result = await getSecretValueFromExtension(key, { timeout: 1000 });
    expect(result).toEqual({
      string: value,
      binary: undefined,
    });
  });

  it('should fetch a binary from Secrets Manager', async () => {
    server.use(
      http.get('http://localhost:2773/secretsmanager/get', () => {
        return HttpResponse.json({
          SecretBinary: Buffer.from(value),
          $metadata: {},
        } satisfies GetSecretValueCommandOutput);
      }),
    );

    const result = await getSecretValueFromExtension(key, { timeout: 1000 });
    expect(result).toEqual({
      string: undefined,
      binary: Buffer.from(value),
    });
  });
});

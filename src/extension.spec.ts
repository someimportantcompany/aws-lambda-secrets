import assert from 'node:assert';
import { describe, beforeAll, afterAll, afterEach, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import type { GetParameterCommandOutput } from '@aws-sdk/client-ssm';

import { getSecretValueFromExtension, getParameterValueFromExtension } from './extension';

const key = 'key';
const value = 'value';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('#getSecretValueFromExtension', () => {
  const url = 'http://localhost:2773/secretsmanager/get';

  it('should fetch a string from Secrets Manager', async () => {
    server.use(
      http.get(url, () => {
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
      http.get(url, () => {
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

  it('should handle a timeout', async () => {
    server.use(
      http.get(url, async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.text('Nope');
      }),
    );

    try {
      await getSecretValueFromExtension(key, { timeout: 3 });
      assert.fail('Should have thrown an error');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toEqual('E_TIMEOUT');
    }
  });
});

describe('#getParameterValueFromExtension', () => {
  const url = 'http://localhost:2773/systemsmanager/parameters/get';

  it('should fetch a string from Secrets Manager', async () => {
    server.use(
      http.get(url, () => {
        return HttpResponse.json({
          Parameter: {
            Name: key,
            Type: 'String',
            Value: value,
          },
          $metadata: {},
        } satisfies GetParameterCommandOutput);
      }),
    );

    const result = await getParameterValueFromExtension(key, { timeout: 1000 });
    expect(result).toEqual(value);
  });

  it('should handle a timeout', async () => {
    server.use(
      http.get(url, async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.text('Nope');
      }),
    );

    try {
      await getParameterValueFromExtension(key, { timeout: 3 });
      assert.fail('Should have thrown an error');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toEqual('E_TIMEOUT');
    }
  });
});

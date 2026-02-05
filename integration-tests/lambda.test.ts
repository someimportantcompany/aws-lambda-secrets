import { test, expect } from 'vitest';
import { inspect } from 'util';

import { invokeLambdaFunction } from './utils';

test.sequential('should successfully invoke: try1', async () => {
  const res = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-try1');
  console.log(inspect(res, { colors: true, depth: 3 }));
  expect(res).toEqual({
    name: 'aws-lambda-secrets-integration-tests-lambda-try1',
    status: 200,
    data: {
      getSecretString: {
        id: 'aws-lambda-secrets-integration-tests-test-secret-string',
        result: 'correct-horse-battery-staple',
        timeTaken: expect.any(Number),
      },
      getSecretBinary: {
        id: 'aws-lambda-secrets-integration-tests-test-secret-binary',
        result: { type: 'Buffer', data: expect.any(Array) },
        timeTaken: expect.any(Number),
      },
      getParameterString: {
        id: '/test-aws-lambda-secrets-integration-tests/test-param-string',
        result: 'correct-horse-battery-staple',
        timeTaken: expect.any(Number),
      },
      getParameterStringList: {
        id: '/test-aws-lambda-secrets-integration-tests/test-param-string-list',
        result: ['correct', 'horse', 'battery', 'staple'],
        timeTaken: expect.any(Number),
      },
    },
    error: undefined,
    timeTaken: expect.any(Number),
  });
});

test.sequential('should successfully invoke: try2', async () => {
  const res = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-try2');
  console.log(inspect(res, { colors: true, depth: 3 }));
  expect(res).toEqual({
    name: 'aws-lambda-secrets-integration-tests-lambda-try2',
    status: 200,
    data: {
      getSecretString: {
        id: 'aws-lambda-secrets-integration-tests-test-secret-string',
        result: 'correct-horse-battery-staple',
        timeTaken: expect.any(Number),
      },
      getSecretBinary: {
        id: 'aws-lambda-secrets-integration-tests-test-secret-binary',
        result: { type: 'Buffer', data: expect.any(Array) },
        timeTaken: expect.any(Number),
      },
      getParameterString: {
        id: '/test-aws-lambda-secrets-integration-tests/test-param-string',
        result: 'correct-horse-battery-staple',
        timeTaken: expect.any(Number),
      },
      getParameterStringList: {
        id: '/test-aws-lambda-secrets-integration-tests/test-param-string-list',
        result: ['correct', 'horse', 'battery', 'staple'],
        timeTaken: expect.any(Number),
      },
    },
    error: undefined,
    timeTaken: expect.any(Number),
  });
});

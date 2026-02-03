import { describe, it } from 'vitest';

import { invokeLambdaFunction } from './utils';

describe.sequential('lambda', () => {
  it('should successfully invoke: try1', async () => {
    const res = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-try1');
    console.log(res);
  });

  it('should successfully invoke: try2', async () => {
    const res = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-try2');
    console.log(res);
  });

  it('should successfully invoke: bench1', async () => {
    const res = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-bench1');
    console.log(res);
  });

  it('should successfully invoke: bench2', async () => {
    const res = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-bench2');
    console.log(res);
  });
});

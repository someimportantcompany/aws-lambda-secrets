import { it } from 'vitest';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient();

async function invokeLambda(
  name: string,
  payload: object = { hello: 'world' },
  clientContext: object = { client: 'context' },
) {
  const startedAt = Date.now();
  let status: number = 500;
  let data: unknown = undefined;
  let error: string | undefined = undefined;

  try {
    const res = await lambda.send(
      new InvokeCommand({
        FunctionName: name,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(payload),
        ClientContext: Buffer.from(JSON.stringify(clientContext), 'utf8').toString('base64'),
      }),
    );

    status = res.StatusCode ?? (res.FunctionError === undefined ? 200 : 500);
    data = res.Payload ? JSON.parse(Buffer.from(res.Payload).toString('utf8')) : undefined;
    error = res.FunctionError;
  } catch (err) {
    status = 500;
    data = undefined;
    error = err instanceof Error ? err.message : `${err}`;
  }

  return {
    name,
    status,
    data,
    error,
    timeTaken: Date.now() - startedAt,
  };
}

it('should invoke the Lambda function', async () => {
  const res1 = await invokeLambda('aws-lambda-secrets-integration-tests-lambda-fn1');
  console.log(res1);

  const res2 = await invokeLambda('aws-lambda-secrets-integration-tests-lambda-fn2');
  console.log(res2);
});

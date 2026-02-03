import { Bench } from 'tinybench';

import { getSecretString, getSecretBinary, getParameterString, getParameterStringList } from '../../src';

async function attempt(id: string, fn: (id: string) => unknown | Promise<unknown>) {
  const startAt = Date.now();
  let result: unknown;

  try {
    result = await fn(id);
  } catch (err) {
    result = `ERR: ${err instanceof Error ? err.message : `${err}`}`;
  }

  return {
    id,
    result,
    timeTaken: Date.now() - startAt,
  };
}

export async function handler(event: unknown, context: unknown) {
  const sortedEnv = Object.fromEntries(Object.entries(process.env).sort(([a], [b]) => a.localeCompare(b)));

  console.log(
    JSON.stringify({
      env: sortedEnv,
      event,
      context,
    }),
  );

  const bench = new Bench({
    name: 'aws-lambda-secrets',
    time: 1000,
  });

  if (process.env.TEST_SECRET_STRING_ID) {
    bench.add('getSecretString', () => attempt(process.env.TEST_SECRET_STRING_ID!, getSecretString), { async: true });
  }
  if (process.env.TEST_SECRET_BINARY_ID) {
    bench.add('getSecretBinary', () => attempt(process.env.TEST_SECRET_BINARY_ID!, getSecretBinary), { async: true });
  }
  if (process.env.TEST_PARAMETER_STRING_NAME) {
    bench.add('getParameterString', () => attempt(process.env.TEST_PARAMETER_STRING_NAME!, getParameterString), {
      async: true,
    });
  }
  if (process.env.TEST_PARAMETER_STRING_LIST_NAME) {
    bench.add(
      'getParameterStringList',
      () => attempt(process.env.TEST_PARAMETER_STRING_LIST_NAME!, getParameterStringList),
      {
        async: true,
      },
    );
  }

  const tasks = await bench.run();

  const results = tasks.map((task) => ({
    name: task.name,
    ...task.result,
  }));

  console.log(
    JSON.stringify({
      env: sortedEnv,
      event,
      context,
      results,
    }),
  );

  return {
    results,
  };
}

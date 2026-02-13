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
  console.log(
    JSON.stringify({
      env: process.env,
      event,
      context,
    }),
  );

  return {
    getSecretString: process.env.TEST_SECRET_STRING_ID
      ? await attempt(process.env.TEST_SECRET_STRING_ID, getSecretString)
      : 'ERR: Missing env { TEST_SECRET_STRING_ID }',
    getSecretBinary: process.env.TEST_SECRET_BINARY_ID
      ? await attempt(process.env.TEST_SECRET_BINARY_ID, getSecretBinary)
      : 'ERR: Missing env { TEST_SECRET_BINARY_ID }',
    getParameterString: process.env.TEST_PARAMETER_STRING_NAME
      ? await attempt(process.env.TEST_PARAMETER_STRING_NAME, getParameterString)
      : 'ERR: Missing env { TEST_PARAMETER_STRING_NAME }',
    getParameterStringList: process.env.TEST_PARAMETER_STRING_LIST_NAME
      ? await attempt(process.env.TEST_PARAMETER_STRING_LIST_NAME, getParameterStringList)
      : 'ERR: Missing env { TEST_PARAMETER_STRING_LIST_NAME }',
  };
}

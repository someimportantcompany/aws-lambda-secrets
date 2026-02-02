import type { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import type { GetParameterCommandOutput } from '@aws-sdk/client-ssm';

async function fetchData<T>(url: URL, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      // Required: the extension uses your Lambda creds via this header
      'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN ?? '',
    },
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Extension error ${res.status}: ${body.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}

export async function getSecretValueFromExtension(
  id: string,
  { timeout }: { timeout: number },
): Promise<{ string?: string; binary?: Buffer } | undefined> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  try {
    const url = new URL('http://localhost:2773/secretsmanager/get');
    url.searchParams.set('secretId', id);

    const res = await fetchData<GetSecretValueCommandOutput>(url, ctrl.signal);
    return {
      string: res?.SecretString,
      binary: res?.SecretBinary ? Buffer.from(res?.SecretBinary) : undefined,
    };
  } finally {
    clearTimeout(t);
  }
}

export async function getParameterValueFromExtension(
  id: string,
  { timeout }: { timeout: number },
): Promise<string | undefined> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  try {
    const url = new URL('http://localhost:2773/systemsmanager/parameters/get');
    url.searchParams.set('name', id);

    const res = await fetchData<GetParameterCommandOutput>(url, ctrl.signal);
    return res?.Parameter?.Value;
  } finally {
    clearTimeout(t);
  }
}

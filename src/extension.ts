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

  if (res.ok) {
    return (await res.json()) as T;
  } else {
    const body = await res.text().catch(() => '');
    throw new Error(`Extension error ${res.status}: ${body.slice(0, 200)}`);
  }
}

export async function getSecretValueFromExtension(
  id: string,
  { timeout }: { timeout: number },
): Promise<{ string?: string; binary?: Buffer } | undefined> {
  const { PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: port = '2773' } = process.env;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  try {
    const url = new URL(`http://localhost:${port}/secretsmanager/get`);
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
  { timeout, withDecryption }: { timeout: number; withDecryption?: boolean },
): Promise<string | undefined> {
  const { PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: port = '2773' } = process.env;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  try {
    const url = new URL(`http://localhost:${port}/systemsmanager/parameters/get`);
    url.searchParams.set('name', id);
    if (typeof withDecryption === 'boolean') {
      url.searchParams.set('withDecryption', withDecryption ? 'true' : 'false');
    }

    const res = await fetchData<GetParameterCommandOutput>(url, ctrl.signal);
    return res?.Parameter?.Value;
  } finally {
    clearTimeout(t);
  }
}

import type { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import type { GetParameterCommandOutput } from '@aws-sdk/client-ssm';

import { parseNum } from './utils';

const PARAMETERS_SECRETS_EXTENSION_HTTP_PORT = parseNum(process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT) ?? 2773;
const PARAMETERS_SECRETS_EXTENSION_HOSTNAME = `http://localhost:${PARAMETERS_SECRETS_EXTENSION_HTTP_PORT}`;

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
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  try {
    const url = new URL('/secretsmanager/get', PARAMETERS_SECRETS_EXTENSION_HOSTNAME);
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
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  try {
    const url = new URL('/systemsmanager/parameters/get', PARAMETERS_SECRETS_EXTENSION_HOSTNAME);
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

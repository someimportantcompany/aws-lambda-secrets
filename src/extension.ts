import type { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import type { GetParameterCommandOutput } from '@aws-sdk/client-ssm';

export async function getSecretValueFromExtension(
  id: string,
  { timeout }: { timeout: number },
): Promise<{ string?: string; binary?: Buffer } | undefined> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error('E_TIMEOUT')), timeout);

  const url = new URL('http://localhost:2773/secretsmanager/get');
  url.searchParams.set('secretId', id);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        // Required: the extension uses your Lambda creds via this header
        'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN ?? '',
      },
      signal: ctrl.signal,
    });

    if (!res.ok) {
      // Extension is up but this request failed; surface a helpful error
      const body = await res.text().catch(() => '');
      throw new Error(`Extension error ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as GetSecretValueCommandOutput;
    return {
      string: json?.SecretString,
      binary: json?.SecretBinary ? Buffer.from(json?.SecretBinary) : undefined,
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

  const url = new URL('http://localhost:2773/systemsmanager/parameters/get');
  url.searchParams.set('name', id);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        // Required: the extension uses your Lambda creds via this header
        'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN ?? '',
      },
      signal: ctrl.signal,
    });

    if (!res.ok) {
      // Extension is up but this request failed; surface a helpful error
      const body = await res.text().catch(() => '');
      throw new Error(`Extension error ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as GetParameterCommandOutput;
    return json?.Parameter?.Value;
  } finally {
    clearTimeout(t);
  }
}

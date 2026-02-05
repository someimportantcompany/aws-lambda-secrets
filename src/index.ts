import { getSecretValueFromExtension, getParameterValueFromExtension } from './extension';
import { getSecretValue, getParameterValue } from './sdk';
import { parseNum, logMessage } from './utils';

const EXT_DEFAULT_TIMEOUT = parseNum(process.env.AWS_LAMBDA_SECRETS_TIMEOUT) ?? 10 * 1000; // 10s

export async function getSecretString(id: string): Promise<string | undefined> {
  if (EXT_DEFAULT_TIMEOUT > 0) {
    try {
      const res = await getSecretValueFromExtension(id, {
        timeout: EXT_DEFAULT_TIMEOUT,
      });

      if (typeof res?.string === 'string') {
        logMessage?.('Secret retrieved from Extension: %s', id);
        return res.string;
      }
    } catch {
      // Do nothing with this error - fail fast
    }
  }

  const res = await getSecretValue({
    SecretId: id,
  });

  if (typeof res?.string === 'string') {
    logMessage?.('Secret retrieved from Secrets Manager: %s', id);
    return res.string;
  }

  logMessage?.('Secret not found in Secrets Manager: %s', id);
  return undefined;
}

export async function getSecretBinary(id: string): Promise<Buffer | undefined> {
  if (EXT_DEFAULT_TIMEOUT > 0) {
    try {
      const res = await getSecretValueFromExtension(id, {
        timeout: EXT_DEFAULT_TIMEOUT,
      });

      if (res?.binary instanceof Buffer) {
        logMessage?.('Secret retrieved from Extension: %s', id);
        return res.binary;
      }
    } catch {
      // Do nothing with this error - fail fast
    }
  }

  const res = await getSecretValue({
    SecretId: id,
  });

  if (res?.binary instanceof Buffer) {
    logMessage?.('Secret retrieved from Secrets Manager: %s', id);
    return res.binary;
  }

  logMessage?.('Secret not found in Secrets Manager: %s', id);
  return undefined;
}

export async function getSecretJSON<T = unknown>(id: string): Promise<T | undefined> {
  const value = await getSecretString(id);
  return value ? (JSON.parse(value) as T) : undefined;
}

export async function getParameterString(
  id: string,
  opts?: {
    withDecryption?: boolean;
  },
): Promise<string | undefined> {
  if (EXT_DEFAULT_TIMEOUT > 0) {
    try {
      const res = await getParameterValueFromExtension(id, {
        timeout: EXT_DEFAULT_TIMEOUT,
        withDecryption: opts?.withDecryption,
      });

      if (typeof res === 'string') {
        logMessage?.('Parameter retrieved from Extension: %s', id);
        return res;
      }
    } catch {
      // Do nothing with this error - fail fast
    }
  }

  const res = await getParameterValue({
    Name: id,
    WithDecryption: opts?.withDecryption,
  });

  if (typeof res === 'string') {
    logMessage?.('Parameter retrieved from Systems Manager: %s', id);
    return res;
  }

  logMessage?.('Parameter not found in Systems Manager: %s', id);
  return undefined;
}

export async function getParameterStringList(
  id: string,
  opts?: {
    withDecryption?: boolean;
  },
): Promise<string[] | undefined> {
  if (EXT_DEFAULT_TIMEOUT > 0) {
    try {
      const res = await getParameterValueFromExtension(id, {
        timeout: EXT_DEFAULT_TIMEOUT,
        withDecryption: opts?.withDecryption,
      });

      if (typeof res === 'string') {
        logMessage?.('Parameter retrieved from Extension: %s', id);
        return res.split(',');
      }
    } catch {
      // Do nothing with this error - fail fast
    }
  }

  const res = await getParameterValue({
    Name: id,
    WithDecryption: opts?.withDecryption,
  });

  if (typeof res === 'string') {
    logMessage?.('Parameter retrieved from Systems Manager: %s', id);
    return res.split(',');
  }

  logMessage?.('Parameter not found in Systems Manager: %s', id);
  return undefined;
}

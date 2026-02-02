import { getSecretValueFromExtension, getParameterValueFromExtension } from './extension';
import { getSecretValue, getParameterValue } from './sdk';

// const EXT_DEFAULT_TIMEOUT = 75; // ms
const EXT_DEFAULT_TIMEOUT = 500; // ms

export async function getSecretString(
  id: string,
  opts?: {
    timeout?: number;
  },
): Promise<string | undefined> {
  try {
    const res = await getSecretValueFromExtension(id, {
      timeout: opts?.timeout || EXT_DEFAULT_TIMEOUT,
    });

    if (typeof res?.string === 'string') {
      return res.string;
    }
  } catch {
    // Do nothing with this error - fail fast
  }

  const res = await getSecretValue({
    SecretId: id,
  });

  if (typeof res?.string === 'string') {
    return res.string;
  }

  return undefined;
}

export async function getSecretBinary(
  id: string,
  opts?: {
    timeout?: number;
  },
): Promise<Buffer | undefined> {
  try {
    const res = await getSecretValueFromExtension(id, {
      timeout: opts?.timeout || EXT_DEFAULT_TIMEOUT,
    });

    if (res?.binary instanceof Buffer) {
      return res.binary;
    }
  } catch {
    // Do nothing with this error - fail fast
  }

  const res = await getSecretValue({
    SecretId: id,
  });

  if (res?.binary instanceof Buffer) {
    return res.binary;
  }

  return undefined;
}

export async function getSecretJSON<T = unknown>(
  id: string,
  opts?: {
    timeout?: number;
  },
): Promise<T | undefined> {
  const value = await getSecretString(id, opts);
  return value ? (JSON.parse(value) as T) : undefined;
}

export async function getParameterString(
  id: string,
  opts?: {
    timeout?: number;
    withDecryption?: boolean;
  },
): Promise<string | undefined> {
  try {
    const res = await getParameterValueFromExtension(id, {
      timeout: opts?.timeout || EXT_DEFAULT_TIMEOUT,
      withDecryption: opts?.withDecryption,
    });

    if (typeof res === 'string') {
      return res;
    }
  } catch {
    // Do nothing with this error - fail fast
  }

  const res = await getParameterValue({
    Name: id,
    WithDecryption: opts?.withDecryption,
  });

  if (typeof res === 'string') {
    return res;
  }

  return undefined;
}

export async function getParameterStringList(
  id: string,
  opts?: {
    timeout?: number;
    withDecryption?: boolean;
  },
): Promise<string[] | undefined> {
  try {
    const res = await getParameterValueFromExtension(id, {
      timeout: opts?.timeout || EXT_DEFAULT_TIMEOUT,
      withDecryption: opts?.withDecryption,
    });

    if (typeof res === 'string') {
      return res.split(',');
    }
  } catch {
    // Do nothing with this error - fail fast
  }

  const res = await getParameterValue({
    Name: id,
    WithDecryption: opts?.withDecryption,
  });

  if (typeof res === 'string') {
    return res.split(',');
  }

  return undefined;
}

import { getSecretValueFromExtension, getParameterValueFromExtension } from './extension';
import { getSecretValue, getParameterValue } from './sdk';

const EXT_DEFAULT_TIMEOUT = 75; // ms

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
    const res = await getSecretValue(id);

    if (typeof res?.string === 'string') {
      return res.string;
    }
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
    const res = await getSecretValue(id);

    if (res?.binary instanceof Buffer) {
      return res.binary;
    }
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
  },
): Promise<string | undefined> {
  try {
    const res = await getParameterValueFromExtension(id, {
      timeout: opts?.timeout || EXT_DEFAULT_TIMEOUT,
    });

    if (typeof res === 'string') {
      return res;
    }
  } catch {
    const res = await getParameterValue(id);

    if (typeof res === 'string') {
      return res;
    }
  }

  return undefined;
}

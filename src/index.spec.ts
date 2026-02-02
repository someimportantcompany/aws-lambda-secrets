import { describe, it, expect, vi } from 'vitest';

import * as idx from './index';
import * as ext from './extension';
import * as sdk from './sdk';

const key = 'key';
const value = 'value';

describe('#getSecretString', () => {
  const { getSecretString } = idx;

  it('should fetch a string from the Secrets Manager extension', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockResolvedValue({ string: value });
    vi.spyOn(sdk, 'getSecretValue').mockRejectedValue('Should not have been called');

    const result = await getSecretString(key);
    expect(result).toEqual(value);
  });

  it('should fetch a string from the Secrets Manager SDK', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockRejectedValue('Did not work or was not setup');
    vi.spyOn(sdk, 'getSecretValue').mockResolvedValue({ string: value });

    const result = await getSecretString(key);
    expect(result).toEqual(value);
  });

  it('should fail to fetch a string from Secrets Manager', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockResolvedValue(undefined);
    vi.spyOn(sdk, 'getSecretValue').mockResolvedValue(undefined);

    const result = await getSecretString(key);
    expect(result).toEqual(undefined);
  });
});

describe('#getSecretBinary', () => {
  const { getSecretBinary } = idx;

  it('should fetch a binary from the Secrets Manager extension', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockResolvedValue({ binary: Buffer.from(value) });
    vi.spyOn(sdk, 'getSecretValue').mockRejectedValue('Should not have been called');

    const result = await getSecretBinary(key);
    expect(result).toEqual(Buffer.from(value));
  });

  it('should fetch a binary from the Secrets Manager SDK', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockRejectedValue('Did not work or was not setup');
    vi.spyOn(sdk, 'getSecretValue').mockResolvedValue({ binary: Buffer.from(value) });

    const result = await getSecretBinary(key);
    expect(result).toEqual(Buffer.from(value));
  });

  it('should fail to fetch a binary from Secrets Manager', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockResolvedValue(undefined);
    vi.spyOn(sdk, 'getSecretValue').mockResolvedValue(undefined);

    const result = await getSecretBinary(key);
    expect(result).toEqual(undefined);
  });
});

describe('#getSecretJSON', () => {
  const { getSecretJSON } = idx;

  it('should fetch a JSON value from the Secrets Manager extension', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockResolvedValue({ string: `{"key":"${value}"}` });
    vi.spyOn(sdk, 'getSecretValue').mockRejectedValue('Should not have been called');

    const result = await getSecretJSON(key);
    expect(result).toEqual({ key: value });
  });

  it('should fetch a JSON string from the Secrets Manager SDK', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockRejectedValue('Did not work or was not setup');
    vi.spyOn(sdk, 'getSecretValue').mockResolvedValue({ string: `{"key":"${value}"}` });

    const result = await getSecretJSON(key);
    expect(result).toEqual({ key: value });
  });

  it('should fail to fetch a JSON string from Secrets Manager', async () => {
    vi.spyOn(ext, 'getSecretValueFromExtension').mockResolvedValue(undefined);
    vi.spyOn(sdk, 'getSecretValue').mockResolvedValue(undefined);

    const result = await getSecretJSON(key);
    expect(result).toEqual(undefined);
  });
});

describe('#getParameterString', () => {
  const { getParameterString } = idx;

  it('should fetch a string from the Parameter Store extension', async () => {
    vi.spyOn(ext, 'getParameterValueFromExtension').mockResolvedValue(value);
    vi.spyOn(sdk, 'getParameterValue').mockRejectedValue('Should not have been called');

    const result = await getParameterString(key);
    expect(result).toEqual(value);
  });

  it('should fetch a binary from the Parameter Store SDK', async () => {
    vi.spyOn(ext, 'getParameterValueFromExtension').mockRejectedValue('Did not work or was not setup');
    vi.spyOn(sdk, 'getParameterValue').mockResolvedValue(value);

    const result = await getParameterString(key);
    expect(result).toEqual(value);
  });

  it('should fail to fetch a binary from Parameter Store', async () => {
    vi.spyOn(ext, 'getParameterValueFromExtension').mockResolvedValue(undefined);
    vi.spyOn(sdk, 'getParameterValue').mockResolvedValue(undefined);

    const result = await getParameterString(key);
    expect(result).toEqual(undefined);
  });
});

describe('#getParameterStringList', () => {
  const { getParameterStringList } = idx;

  it('should fetch a string from the Parameter Store extension', async () => {
    vi.spyOn(ext, 'getParameterValueFromExtension').mockResolvedValue(`${value},${value}`);
    vi.spyOn(sdk, 'getParameterValue').mockRejectedValue('Should not have been called');

    const result = await getParameterStringList(key);
    expect(result).toEqual([value, value]);
  });

  it('should fetch a binary from the Parameter Store SDK', async () => {
    vi.spyOn(ext, 'getParameterValueFromExtension').mockRejectedValue('Did not work or was not setup');
    vi.spyOn(sdk, 'getParameterValue').mockResolvedValue(`${value},${value}`);

    const result = await getParameterStringList(key);
    expect(result).toEqual([value, value]);
  });

  it('should fail to fetch a binary from Parameter Store', async () => {
    vi.spyOn(ext, 'getParameterValueFromExtension').mockResolvedValue(undefined);
    vi.spyOn(sdk, 'getParameterValue').mockResolvedValue(undefined);

    const result = await getParameterStringList(key);
    expect(result).toEqual(undefined);
  });
});

import { describe, it, expect } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

import { getSecretValue, getParameterValue } from './sdk';

const key = 'key';
const value = 'value';

describe('#getSecretValue', () => {
  const secretsMock = mockClient(SecretsManagerClient);

  it('should fetch a string from Secrets Manager', async () => {
    secretsMock.on(GetSecretValueCommand).resolves({
      SecretString: value,
    });

    const result = await getSecretValue({
      SecretId: key,
    });
    expect(result).toEqual({
      string: value,
      binary: undefined,
    });
  });

  it('should fetch a binary from Secrets Manager', async () => {
    secretsMock.on(GetSecretValueCommand).resolves({
      SecretBinary: Buffer.from(value),
    });

    const result = await getSecretValue({
      SecretId: key,
    });
    expect(result).toEqual({
      string: undefined,
      binary: Buffer.from(value),
    });
  });
});

describe('#getParameterValue', () => {
  const ssmMock = mockClient(SSMClient);

  it('should fetch a value from Parameter Store', async () => {
    ssmMock.on(GetParameterCommand).resolves({
      Parameter: {
        Name: key,
        Type: 'String',
        Value: value,
      },
    });

    const result = await getParameterValue({
      Name: key,
    });
    expect(result).toEqual(value);
  });
});

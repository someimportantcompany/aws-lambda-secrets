import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const secrets = new SecretsManagerClient();
const ssm = new SSMClient();

export async function getSecretValue(id: string): Promise<{ string?: string; binary?: Buffer } | undefined> {
  const res = await secrets.send(
    new GetSecretValueCommand({
      SecretId: id,
    }),
  );

  return {
    string: res?.SecretString,
    binary: res?.SecretBinary ? Buffer.from(res?.SecretBinary) : undefined,
  };
}

export async function getParameterValue(id: string): Promise<string | undefined> {
  const res = await ssm.send(
    new GetParameterCommand({
      Name: id,
    }),
  );

  return res?.Parameter?.Value;
}

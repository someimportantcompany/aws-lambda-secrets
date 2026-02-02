import {
  SecretsManagerClient,
  GetSecretValueCommand,
  type GetSecretValueCommandInput,
} from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand, type GetParameterCommandInput } from '@aws-sdk/client-ssm';

const secrets = new SecretsManagerClient();
const ssm = new SSMClient();

export async function getSecretValue(
  opts: GetSecretValueCommandInput,
): Promise<{ string?: string; binary?: Buffer } | undefined> {
  const res = await secrets.send(new GetSecretValueCommand(opts));
  return {
    string: res?.SecretString,
    binary: res?.SecretBinary ? Buffer.from(res?.SecretBinary) : undefined,
  };
}

export async function getParameterValue(opts: GetParameterCommandInput): Promise<string | undefined> {
  const res = await ssm.send(new GetParameterCommand(opts));
  return res?.Parameter?.Value;
}

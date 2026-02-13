# aws-lambda-secrets

Fetch secrets/parameters from AWS Secrets/System Manager during Lambda's runtime.

This library offers a universal typed set of functions to either hit the Parameters & Secrets Lambda extension (if configured) & fall back to Secrets/Systems Manager, or just hit Secrets/Systems Manager directly for values.

```ts
import { getSecretString } from 'aws-lambda-secrets'

export async function handler(event, context) {
  // Fetch a secret string from Secrets Manager
  const apiKey = await getSecretString('my-project-api-key')
  // If the Lambda has the Secrets Extension enabled, then the extension will be hit, cached & returned
  // Otherwise, if the Lambda does not have the Secrets Extension enabled, this'll hit AWS Secrets Manager directly
}
```

## Install

```sh
# If using NPM:
$ npm install --save aws-lambda-secrets
# Or, if using Yarn:
$ yarn add aws-lambda-secrets
# Or, if using PNPM:
$ pnpm add aws-lambda-secrets
```

## Setup

Technically, adding the Parameters & Secrets Lambda extension _is entirely optional_ - if you do nothing, this library will hit AWS Secrets Manager or Systems Manager directly.

If you want to use the Parameters & Secrets Lambda extension, add the layer to your function ([either via Console or IaC](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html#ps-integration-lambda-extensions-add))

Optionally, set the environment variables to [configure the Parameters & Secrets Lambda extension](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html#ps-integration-lambda-extensions-config):

- `SECRETS_MANAGER_TIMEOUT_MILLIS=9000` 9 seconds timeout from extension to Secrets Manager
- `SSM_PARAMETER_STORE_TIMEOUT_MILLIS=9000` 9 seconds timeout from extension to Parameter Store

Regardless if you add the Parameters & Secrets Lambda extension - you need to enure your Lambda execution role has permissions to read your secrets/parameters.

**Further reading:**

- [Using the AWS Parameter and Secrets Lambda extension to cache parameters and secrets](https://aws.amazon.com/blogs/compute/using-the-aws-parameter-and-secrets-lambda-extension-to-cache-parameters-and-secrets/)
- [Use Secrets Manager secrets in Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/with-secrets-manager.html)
- [Using Parameter Store parameters in AWS Lambda functions](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)

## Configuration

Along with the Parameters & Secrets Lambda extension environment variables, this library can also been configured with:

| Argument | Description |
| ---- | ---- |
| `AWS_LAMBDA_SECRETS_TIMEOUT` | Timeout for request to extension (in milliseconds) (defaults to 10s) |
| `AWS_LAMBDA_SECRETS_LOG_MESSAGES` | Set to `TRUE` to enable log messages for this library |

If you choose to skip the Lambda extension:

- Set `AWS_LAMBDA_SECRETS_TIMEOUT=0` to bypass the extension entirely, save on that (now unused) network request!

## API

### `getSecretString`

```ts
export async function getSecretString(id: string): Promise<string | undefined>
```

Fetch a secret string from either the Parameters & Secrets Lambda extension or AWS Secrets Manager directly.

| Argument | Description |
| ---- | ---- |
| `id` | The secret ID or ARN you want to fetch |

### `getSecretBinary`

```ts
export async function getSecretBinary(id: string): Promise<Buffer | undefined>
```

Fetch a secret binary from either the Parameters & Secrets Lambda extension or AWS Secrets Manager directly.

| Argument | Description |
| ---- | ---- |
| `id` | The secret ID or ARN you want to fetch |

### `getSecretJSON`

```ts
export async function getSecretJSON<T = unknown>(id: string): Promise<T | undefined>;
```

Fetch a secret JSON structure from either the Parameters & Secrets Lambda extension or AWS Secrets Manager directly. This expects the data to be a Secret String, and will be parsed with `JSON.parse`. Set the `<T>` type in order to have your result typed.

| Argument | Description |
| ---- | ---- |
| `id` | The secret ID or ARN you want to fetch |

### `getParameterString`

```ts
export async function getParameterString(
  id: string,
  opts?: {
    withDecryption?: boolean;
  },
): Promise<string | undefined>;
```

Fetch a parameter string from either the Parameters & Secrets Lambda extension or AWS Systems Manager directly.

| Argument | Description |
| ---- | ---- |
| `id` | The parameter name or ARN you want to fetch |
| `withDecryption` | Optional boolean to decrypt the parameter |

### `getParameterStringList`

```ts
export async function getParameterStringList(
  id: string,
  opts?: {
    withDecryption?: boolean;
  },
): Promise<string[] | undefined>;
```

Fetch a parameter string list from either the Parameters & Secrets Lambda extension or AWS Systems Manager directly.

| Argument | Description |
| ---- | ---- |
| `id` | The parameter name or ARN you want to fetch |
| `withDecryption` | Optional boolean to decrypt the parameter |

## Benchmarks

```
Invoking: Lambda, library, with extension
Task name                : getSecretString
Latency avg (ns)         : 28415727 ± 14.78%
Latency med (ns)         : 20058044 ± 493481
Throughput avg (ops/s)   : 76 ± 51.58%
Throughput med (ops/s)   : 50 ± 1
Samples                  : 64

Task name                : getSecretBinary
Latency avg (ns)         : 28108704 ± 13.84%
Latency med (ns)         : 20047930 ± 329776
Throughput avg (ops/s)   : 110 ± 58.96%
Throughput med (ops/s)   : 50 ± 1
Samples                  : 64

Task name                : getParameterString
Latency avg (ns)         : 27792213 ± 15.62%
Latency med (ns)         : 20088321 ± 240360
Throughput avg (ops/s)   : 79 ± 57.93%
Throughput med (ops/s)   : 50 ± 1
Samples                  : 64

Task name                : getParameterStringList
Latency avg (ns)         : 25931679 ± 21.94%
Latency med (ns)         : 20016115 ± 18265661
Throughput avg (ops/s)   : 247 ± 43.76%
Throughput med (ops/s)   : 50 ± 24
Samples                  : 64


Invoking: Lambda, library, no extension
Task name                : getSecretString
Latency avg (ns)         : 50298795 ± 13.26%
Latency med (ns)         : 40000827 ± 690960
Throughput avg (ops/s)   : 25 ± 11.63%
Throughput med (ops/s)   : 25 ± 0
Samples                  : 64

Task name                : getSecretBinary
Latency avg (ns)         : 50912228 ± 16.68%
Latency med (ns)         : 39965126 ± 862988
Throughput avg (ops/s)   : 26 ± 11.88%
Throughput med (ops/s)   : 25 ± 1
Samples                  : 64

Task name                : getParameterString
Latency avg (ns)         : 34052097 ± 8.82%
Latency med (ns)         : 39934688 ± 237167
Throughput avg (ops/s)   : 33 ± 9.24%
Throughput med (ops/s)   : 25 ± 0
Samples                  : 64

Task name                : getParameterStringList
Latency avg (ns)         : 33737330 ± 10.14%
Latency med (ns)         : 39897139 ± 215998
Throughput avg (ops/s)   : 34 ± 9.36%
Throughput med (ops/s)   : 25 ± 0
Samples                  : 64
```

- At scale, the Parameters & Secrets Lambda extension can improve performance
- However at low scale, it really does not - but it still reduces the direct calls to (& costs of) AWS Secrets/Systems Manager

## Contributing

### Run unit tests

```sh
# Install dependencies
$ pnpm install
# Run unit tests
$ pnpm test:unit
```

### Running integration tests

```sh
# Install dependencies
$ pnpm install
# Deploy to your AWS account
$ pnpm test:integration:deploy
# Run integration tests
$ pnpm test:integration
```

### Running benchmarks

```sh
# Install dependencies
$ pnpm install
# Deploy to your AWS account
$ pnpm test:integration:deploy
# Run benchmarks
$ pnpm test:integration:benchmarks
```

## Notes

- With thanks to [**@LeeCheneler**](http://github.com/LeeCheneler) for getting me to benchmark this library

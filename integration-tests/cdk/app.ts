import path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as custom from 'aws-cdk-lib/custom-resources';

export class IntegrationTestsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create new secrets/parameters
    const data = this.createData();

    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    // Grab the Secrets extension layer
    // @link https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
    const secretsExtensionLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'SecretsExtensionLayer',
      'arn:aws:lambda:us-east-1:177933569100:layer:AWS-Parameters-and-Secrets-Lambda-Extension-Arm64:21',
    );
    const secretsExtensionEnvs = {
      AWS_LAMBDA_SECRETS_TIMEOUT: '10000',
      AWS_LAMBDA_SECRETS_LOG_MESSAGES: 'TRUE',

      // @link https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
      PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'DEBUG',
      PARAMETERS_SECRETS_EXTENSION_CACHE_ENABLED: 'TRUE',
      SECRETS_MANAGER_TIMEOUT_MILLIS: '9000',
      SSM_PARAMETER_STORE_TIMEOUT_MILLIS: '9000',
    };

    // First function, no layer so expect a direct call to Secrets Manager
    const try1 = new nodejs.NodejsFunction(this, 'LambdaTry1', {
      functionName: `${this.stackName}-lambda-try1`,
      runtime: lambda.Runtime.NODEJS_24_X,
      role,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../lambda/handler.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(5),
      environment: {
        ...data.environment,
        AWS_LAMBDA_SECRETS_TIMEOUT: '0',
      },
    });
    // Second function, include layer so expect a faster call to Secrets Manager
    const try2 = new nodejs.NodejsFunction(this, 'LambdaTry2', {
      functionName: `${this.stackName}-lambda-try2`,
      runtime: lambda.Runtime.NODEJS_24_X,
      role,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../lambda/handler.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(5),
      environment: {
        ...data.environment,
        ...secretsExtensionEnvs,
      },
      layers: [secretsExtensionLayer],
    });

    // First function, no layer so expect a direct call to Secrets Manager
    const bench1 = new nodejs.NodejsFunction(this, 'LambdaBench1', {
      functionName: `${this.stackName}-lambda-bench1`,
      runtime: lambda.Runtime.NODEJS_24_X,
      role,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../lambda/benchmarks.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(5),
      environment: {
        ...data.environment,
        AWS_LAMBDA_SECRETS_TIMEOUT: '0',
      },
    });
    // Second function, include layer so expect a faster call to Secrets Manager
    const bench2 = new nodejs.NodejsFunction(this, 'LambdaBench2', {
      functionName: `${this.stackName}-lambda-bench2`,
      runtime: lambda.Runtime.NODEJS_24_X,
      role,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../lambda/benchmarks.ts'),
      handler: 'handler',
      timeout: cdk.Duration.minutes(5),
      environment: {
        ...data.environment,
        ...secretsExtensionEnvs,
        // For bench2, reduce the log-level to Info, the Debug logs are noisy
        PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'INFO',
      },
      layers: [secretsExtensionLayer],
    });

    // Allow the functions (and thus the extension) to read the secrets & parameters
    data.grantRead([try1, try2, bench1, bench2]);
  }

  private createData() {
    const value = 'correct-horse-battery-staple';

    // Secrets Manager - secret string
    const secretString = new secretsmanager.Secret(this, 'SecretString', {
      secretName: `${this.stackName}-test-secret-string`,
      secretStringValue: cdk.SecretValue.unsafePlainText(value),
    });

    // Secrets Manager - secret binary
    const secretBinary = new secretsmanager.Secret(this, 'SecretBinary', {
      secretName: `${this.stackName}-test-secret-binary`,
    });
    // Setting the secret value in CDK
    new custom.AwsCustomResource(this, 'PutBinarySecretValue', {
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [secretBinary.secretArn],
      }),
      onCreate: {
        service: 'SecretsManager',
        action: 'putSecretValue',
        parameters: {
          SecretId: secretBinary.secretArn,
          SecretBinary: Buffer.from(value, 'utf-8').toString('base64'),
        },
        physicalResourceId: custom.PhysicalResourceId.of(`${secretBinary.secretArn}-binary-v1`),
      },
      onUpdate: {
        service: 'SecretsManager',
        action: 'putSecretValue',
        parameters: {
          SecretId: secretBinary.secretArn,
          SecretBinary: Buffer.from(value, 'utf-8').toString('base64'),
        },
        physicalResourceId: custom.PhysicalResourceId.of(`${secretBinary.secretArn}-binary-v1`),
      },
    });

    // Parameter - plain string
    const parameterString = new ssm.StringParameter(this, 'ParameterString', {
      parameterName: `/test-${this.stackName}/test-param-string`,
      stringValue: value,
    });

    // // Parameter - string list
    const parameterStringList = new ssm.StringListParameter(this, 'ParameterStringList', {
      parameterName: `/test-${this.stackName}/test-param-string-list`,
      stringListValue: value.split('-'),
    });

    return {
      environment: {
        TEST_SECRET_STRING_ID: secretString.secretName,
        TEST_SECRET_STRING_ARN: secretString.secretArn,
        TEST_SECRET_BINARY_ID: secretBinary.secretName,
        TEST_SECRET_BINARY_ARN: secretBinary.secretArn,
        TEST_PARAMETER_STRING_NAME: parameterString.parameterName,
        TEST_PARAMETER_STRING_ARN: parameterString.parameterArn,
        TEST_PARAMETER_STRING_LIST_NAME: parameterStringList.parameterName,
        TEST_PARAMETER_STRING_LIST_ARN: parameterStringList.parameterArn,
      },
      grantRead(grantees: cdk.aws_iam.IGrantable[]) {
        for (const grantee of grantees) {
          secretString.grantRead(grantee);
          secretBinary.grantRead(grantee);
          parameterString.grantRead(grantee);
          parameterStringList.grantRead(grantee);
        }
      },
    };
  }
}

import * as cdk from 'aws-cdk-lib/core';

import { IntegrationTestsStack } from './app';

new IntegrationTestsStack(new cdk.App(), 'IntegrationTestsStack', {
  stackName: 'aws-lambda-secrets-integration-tests',
});

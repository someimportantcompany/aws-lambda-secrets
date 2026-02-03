export const logMessage =
  process.env.AWS_LAMBDA_SECRETS_LOG_MESSAGES === 'TRUE'
    ? function logMessage(message: string, ...rest: unknown[]) {
        if (process.env.AWS_LAMBDA_SECRETS_LOG_MESSAGES === 'TRUE') {
          console.log(`[aws-lambda-secrets] ${message}`, ...rest);
        }
      }
    : undefined;

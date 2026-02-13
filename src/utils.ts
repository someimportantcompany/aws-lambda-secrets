export function parseNum(value: string | undefined): number | undefined {
  if (value !== undefined) {
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  } else {
    return undefined;
  }
}

export const logMessage =
  process.env.AWS_LAMBDA_SECRETS_LOG_MESSAGES === 'TRUE'
    ? function logMessage(message: string, ...rest: unknown[]) {
        if (process.env.AWS_LAMBDA_SECRETS_LOG_MESSAGES === 'TRUE') {
          console.log(`[aws-lambda-secrets] ${message}`, ...rest);
        }
      }
    : undefined;

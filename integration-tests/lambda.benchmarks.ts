import { invokeLambdaFunction } from './utils';

(async () => {
  try {
    console.log('Invoking: Lambda, library, with extension');
    const bench2 = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-bench2');
    // console.log(bench2);
    if (bench2.data && Array.isArray(bench2.data.table)) {
      for (const item of bench2.data.table) {
        for (const [label, value] of Object.entries(item)) {
          console.log('%s: %s', label.padEnd(25, ' '), value);
        }
        process.stdout.write('\n');
      }
    }

    process.stdout.write('\n');

    console.log('Invoking: Lambda, library, no extension');
    const bench1 = await invokeLambdaFunction('aws-lambda-secrets-integration-tests-lambda-bench1');
    // console.log(bench1);
    if (bench1.data && Array.isArray(bench1.data.table)) {
      for (const item of bench1.data.table) {
        for (const [label, value] of Object.entries(item)) {
          console.log('%s: %s', label.padEnd(25, ' '), value);
        }
        process.stdout.write('\n');
      }
    }
  } catch (err) {
    console.error(err);
  }
})();

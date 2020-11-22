import { Serverless } from 'serverless/aws';

import config from './config';

const productServiceStackName = config.aws.productService.stackName;

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: config.aws.region,
    profile: 'nodejs-in-aws',
    endpointType: 'regional',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: [`arn:aws:s3:::${config.aws.s3.bucket}/*`]
      },
      {
        Effect: 'Allow',
        Action: ['sqs:SendMessage'],
        Resource: [`\$\{cf:${productServiceStackName}.SQSArn\}`]
      }
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: `\$\{cf:${productServiceStackName}.SQSUrl\}`
    },
  },
  functions: {
    'import-products-file': {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
          },
        },
      ],
    },
    'import-file-parser': {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: config.aws.s3.bucket,
            existing: true,
            event: 's3:ObjectCreated:*',
            rules: [{
              prefix: `${config.aws.s3.uploadFolderName}/`,
              suffix: '.csv',
            }],
          }
        }
      ]
    }
  },
};

module.exports = serverlessConfiguration;

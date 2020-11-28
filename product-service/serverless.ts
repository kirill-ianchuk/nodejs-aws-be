import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    profile: 'nodejs-in-aws',
    endpointType: 'regional',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE: process.env.PG_DATABASE,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
      SNS_TOPIC_ARN: { Ref: 'SNSTopic' }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:Publish'],
        Resource: [{ Ref: 'SNSTopic' }]
      }
    ],
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue',
          ReceiveMessageWaitTimeSeconds: 20,
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'create-product-topic',
        },
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: process.env.SNS_SUBSCRIBER,
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
        }
      },
      SNSSubscriptionVIP: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: process.env.SNS_SUBSCRIBER_VIP,
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
          FilterPolicy: JSON.stringify({
            minPrice: [{ numeric: ['>=', 1500] }]
          })
        }
      },
    },
    Outputs: {
      SQSUrl: {
        Value: { Ref: 'SQSQueue' }
      },
      SQSArn: {
        Value: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
      },
    }
  },
  functions: {
    'get-products-list': {
      handler: 'handler.getProductsList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
          }
        }
      ]
    },
    'get-product-by-id': {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{id}',
          }
        }
      ]
    },
    'create-product': {
      handler: 'handler.createProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          }
        }
      ]
    },
    'catalog-batch-process': {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
          }
        }
      ]
    }
  }
};

module.exports = serverlessConfiguration;

import sinon from 'sinon';
import AWS from 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda';

import { importProductsFile } from '../../../src/handlers/importProductsFile';
import config from '../../../config';

const sandbox = sinon.createSandbox();

describe('importProductsFile handler unit tests', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('success scenario', () => {
        it('should return 200 status code and signed URL for uploading a file', async () => {
            const awsConfig = {
                region: 'fake-region',
                s3: {
                    bucket: 'fake-bucket',
                    uploadFolderName: 'fake-upload-folder',
                }
            };

            sandbox.stub(config, 'aws').value(awsConfig);
            const getSignedUrlPromiseStub = sandbox.stub().resolves('https://upload-me-to-aws.com');

            const s3Stub = sandbox.stub(AWS, 'S3').returns({
                getSignedUrlPromise: getSignedUrlPromiseStub,
            });

            // @ts-ignore
            const result = await importProductsFile({
                queryStringParameters: {
                    name: 'products.csv',
                }
            }, undefined, undefined) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(200);
            expect(JSON.parse(result.body).url).toEqual('https://upload-me-to-aws.com');
            sinon.assert.calledOnceWithExactly(s3Stub, { region: awsConfig.region });
            sinon.assert.calledOnceWithExactly(
                getSignedUrlPromiseStub,
                'putObject',
                {
                    Bucket: awsConfig.s3.bucket,
                    Key: `${awsConfig.s3.uploadFolderName}/products.csv`,
                    Expires: 60,
                    ContentType: 'text/csv',
                }
            );
        });
    });

    describe('error handling', () => {
        it('should return 400 status code and proper error message, ' +
            'if name query param was not provided', async () => {
            // @ts-ignore
            const result = await importProductsFile({
                queryStringParameters: null
            }, undefined, undefined) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(400);
            expect(JSON.parse(result.body).message).toContain('"name" is required')
        });

        it('should return 500 status code and proper error message, ' +
            'if some unexpected error occurred during event processing', async () => {
            sandbox.stub(AWS, 'S3').returns({
                getSignedUrlPromise: () => Promise.reject(Error('unexpected error')),
            });

            // @ts-ignore
            const result = await importProductsFile({
                queryStringParameters: { name: 'products.csv' }
            }, undefined, undefined) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(500);
            expect(JSON.parse(result.body).message).toEqual('unexpected error');
        });
    });
});


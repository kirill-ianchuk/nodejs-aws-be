import sinon from 'sinon';
import AWS from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { stdout } from 'stdout-stderr';

import { catalogBatchProcess } from '../../../src/handlers/catalogBatchProcess';
import * as productModel from '../../../src/models/product';

const sandbox = sinon.createSandbox();

const products = [
    {
        title: 'Product One',
        description: 'Product One description',
        price: 1000,
        count: 1,
    },
    {
        title: 'Product Two',
        description: 'Product Two description',
        price: 2000,
        count: 2,
    },
];

const event = {
    Records: [
        { body: JSON.stringify(products[0]) },
        { body: JSON.stringify(products[1]) },
    ]
};

describe('catalogBatchProcess handler unit tests', () => {
    beforeEach(() => {
        stdout.start();
    });

    afterEach(() => {
        sandbox.restore();
        stdout.stop();
    });

    describe('success scenario', () => {
        it('should call createProductsBatch function ' +
            'and send email notification', async () => {
            const createProductsBatchStub = sandbox.stub(productModel, 'createProductsBatch').resolves();
            const snsPublishStub = sandbox.stub().returns({
                promise: () => Promise.resolve(),
            });
            sandbox.stub(AWS, 'SNS').returns({
                publish: snsPublishStub,
            });
            sandbox.stub(process, 'env').value({
                ...process.env,
                SNS_TOPIC_ARN: 'test-sns-topic-arn',
            });

            await catalogBatchProcess(event as SQSEvent, undefined, undefined);
            sinon.assert.calledOnceWithExactly(createProductsBatchStub, products);
            sinon.assert.calledOnceWithExactly(snsPublishStub, {
                Subject: 'New products in the catalog!',
                Message: '1. Product One (price: 1000$, count: 1)\n' +
                    '2. Product Two (price: 2000$, count: 2)',
                TopicArn: 'test-sns-topic-arn',
                MessageAttributes: {
                    minPrice: {
                        DataType: 'Number',
                        StringValue: '1000',
                    }
                }
            });
            expect(stdout.output).toContain('Sent an email notification');
        });
    });

    describe('error handling', () => {
        it('should log error to the console and not send email notification, ' +
            'if error occurred during products creation', async () => {
            const createProductsBatchStub = sandbox.stub(productModel, 'createProductsBatch')
                .rejects(Error('Ouch'));

            const snsPublishStub = sandbox.stub().returns({
                promise: () => Promise.resolve(),
            });
            sandbox.stub(AWS, 'SNS').returns({
                publish: snsPublishStub,
            });

            await catalogBatchProcess(event as SQSEvent, undefined, undefined);
            sinon.assert.calledOnceWithExactly(createProductsBatchStub, products);
            sinon.assert.notCalled(snsPublishStub);
            expect(stdout.output).toContain('Ouch');
        });
    });
});

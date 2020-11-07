import { APIGatewayProxyResult } from 'aws-lambda';
import sinon from 'sinon';

import { getProductById } from '../../../handler';
import * as utils from '../../../utils';

const sandbox = sinon.createSandbox();

describe('getProductById handler unit tests', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('success scenario', () => {
        it('should return 200 status code and a product, if provided with existing product id', async () => {
            const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';

            const result = await getProductById(
                // @ts-ignore
                { pathParameters: { id: productId } },
                undefined,
                undefined,
            ) as APIGatewayProxyResult;
            expect(result.statusCode).toEqual(200);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');

            const product = JSON.parse(result.body);
            expect(product).toSatisfySchemaInApiSpec('Product');
            expect(product.id).toEqual(productId)
        });
    });

    describe('error handling', () => {
        it('should return 404 status code, if provided with non-existing product id', async () => {
            const result = await getProductById(
                // @ts-ignore
                { pathParameters: { id: 'non-existing' } },
                undefined,
                undefined,
            ) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(404);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
            expect(JSON.parse(result.body)).toEqual({ message: 'Product was not found' });
        });

        it('should return 500 status code, if error occurred during network request', async () => {
            const requestError = new Error('something went wrong');

            sandbox.stub(utils, 'simulateNetworkRequest').rejects(requestError);
            const result = await getProductById(undefined, undefined, undefined) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(500);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
            expect(JSON.parse(result.body)).toEqual({ message: requestError.message });
        });
    });
});

import { APIGatewayProxyResult } from 'aws-lambda';
import sinon from 'sinon';

import { getProductById } from '../../../handler';
import * as productModel from '../../../src/models/product';

const sandbox = sinon.createSandbox();

describe('getProductById handler unit tests', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('success scenario', () => {
        it('should return 200 status code and a product, if provided with existing product id', async () => {
            const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';

            const productModelStub = sandbox.stub(productModel, 'getProductById').resolves({
                id: productId,
                title: 'Ibanez GRG170DX Black Night',
                description: 'Electric guitar with maple wizard-neck, inhouse Infinity R pickups and Fat-10 tremolo',
                price: 230,
                count: 15
            });

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
            expect(product.id).toEqual(productId);
            sinon.assert.calledOnceWithExactly(productModelStub, productId);
        });
    });

    describe('error handling', () => {
        it('should return 404 status code, if no data was found for provided product id', async () => {
            const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';

            const productModelStub = sandbox.stub(productModel, 'getProductById').resolves(undefined);

            const result = await getProductById(
                // @ts-ignore
                { pathParameters: { id: productId } },
                undefined,
                undefined,
            ) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(404);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
            expect(JSON.parse(result.body)).toEqual({ message: 'Product was not found' });
            sinon.assert.calledOnceWithExactly(productModelStub, productId);
        });

        it('should return 500 status code, if error occurred during network request', async () => {
            const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';
            const requestError = new Error('something went wrong');

            const productModelStub = sandbox.stub(productModel, 'getProductById').rejects(requestError);
            const result = await getProductById(// @ts-ignore
                { pathParameters: { id: productId } },
                undefined,
                undefined,
            ) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(500);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
            expect(JSON.parse(result.body)).toEqual({ message: requestError.message });
            sinon.assert.calledOnceWithExactly(productModelStub, productId);
        });
    });
});

import { APIGatewayProxyResult } from 'aws-lambda';
import sinon from 'sinon';

import { getProductsList } from '../../../handler';
import * as productModel from '../../../src/models/product';

const sandbox = sinon.createSandbox();

describe('getProductsList handler unit tests', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('success scenario', () => {
        it('should return 200 status code and a list of products', async () => {
            const productsList = [
                {
                    id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
                    title: 'Product 1',
                    description: 'Description 1',
                    price: 222,
                    count: 1
                },
                {
                    id: '7567ec4b-b10c-48c5-9345-fc73c48a80bb',
                    title: 'Product 2',
                    description: 'Description 2',
                    price: 333,
                    count: 2
                }
            ];

            const productModelStub = sandbox.stub(productModel, 'getProductsList').resolves(productsList);
            const result = await getProductsList(undefined, undefined, undefined) as APIGatewayProxyResult;
            expect(result.statusCode).toEqual(200);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');

            const products = JSON.parse(result.body);
            expect(products).toSatisfySchemaInApiSpec('ProductsList');
            expect(products).toEqual(productsList);
            expect(products.length).toBeGreaterThan(0);
            sinon.assert.calledOnce(productModelStub);
        });
    });

    describe('error handling', () => {
        it('should return 500 status code, if error occurred during network request', async () => {
            const requestError = new Error('something went wrong');

            const productModelStub = sandbox.stub(productModel, 'getProductsList').rejects(requestError);
            const result = await getProductsList(undefined, undefined, undefined) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(500);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
            expect(JSON.parse(result.body)).toEqual({ message: requestError.message });
            sinon.assert.calledOnce(productModelStub);
        });
    })
});

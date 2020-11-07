import { APIGatewayProxyResult } from 'aws-lambda';
import sinon from 'sinon';

import { getProductsList } from '../../../handler';
import * as utils from '../../../utils';

const sandbox = sinon.createSandbox();

describe('getProductsList handler unit tests', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('success scenario', () => {
        it('should return 200 status code and a list of products', async () => {
            const result = await getProductsList(undefined, undefined, undefined) as APIGatewayProxyResult;
            expect(result.statusCode).toEqual(200);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');

            const products = JSON.parse(result.body);
            expect(products).toSatisfySchemaInApiSpec('ProductsList');
            expect(products.length).toBeGreaterThan(0);
        });
    });

    describe('error handling', () => {
        it('should return 500 status code, if error occurred during network request', async () => {
            const requestError = new Error('something went wrong');

            sandbox.stub(utils, 'simulateNetworkRequest').rejects(requestError);
            const result = await getProductsList(undefined, undefined, undefined) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(500);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
            expect(JSON.parse(result.body)).toEqual({ message: requestError.message });
        });
    })
});

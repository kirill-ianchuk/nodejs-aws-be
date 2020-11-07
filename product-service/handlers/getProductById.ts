import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import * as utils from '../utils';

export const getProductById: APIGatewayProxyHandler = async (event) => {
    let result: APIGatewayProxyResult;

    try {
        await utils.simulateNetworkRequest();

        const productsList = require('../data/productsList.json');
        const product = productsList.find(product => product.id === event.pathParameters.id);

        if (!product) {
            result = {
                statusCode: 404,
                body: JSON.stringify({ message: 'Product was not found' }),
            }
        } else {
            result = {
                statusCode: 200,
                body: JSON.stringify(product, null, 2),
            };
        }
    } catch (err) {
        result = {
            statusCode: 500,
            body: JSON.stringify({ message: err.message }),
        };
    }

    return utils.addCors(result);
};

import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import * as utils from '../utils';

export const getProductsList: APIGatewayProxyHandler = async () => {
    let result: APIGatewayProxyResult;

    try {
        await utils.simulateNetworkRequest();

        const productsList = require('../data/productsList.json');

        result = {
            statusCode: 200,
            body: JSON.stringify(productsList, null, 2),
        };
    } catch (err) {
        result = {
            statusCode: 500,
            body: JSON.stringify({ message: err.message }),
        };
    }

    return utils.addCors(result);
};

import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import * as utils from '../utils';
import * as productModel from '../models/product';

export const getProductsList: APIGatewayProxyHandler = async (event) => {
    let result: APIGatewayProxyResult;

    console.log(`Received event ${event.httpMethod} ${event.path}`);

    try {
        const productsList = await productModel.getProductsList();

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

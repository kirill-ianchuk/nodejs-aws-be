import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import * as utils from '../utils';
import * as productModel from '../models/product';

export const createProduct: APIGatewayProxyHandler = async (event) => {
    let result: APIGatewayProxyResult;

    const payload = JSON.parse(event.body);

    try {
        const product = await productModel.createProduct(payload);

        result = {
            statusCode: 201,
            body: JSON.stringify(product, null, 2),
        }
    } catch (err) {
        result = {
            statusCode: 500,
            body: JSON.stringify({ message: err.message }),
        };
    }

    return utils.addCors(result);
};

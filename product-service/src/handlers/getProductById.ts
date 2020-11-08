import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import * as utils from '../utils';
import * as productModel from '../models/product';

export const getProductById: APIGatewayProxyHandler = async (event) => {
    let result: APIGatewayProxyResult;

    console.log(`Received event ${event.httpMethod} ${event.path} ${event.pathParameters}`);

    try {
        const product = await productModel.getProductById(event.pathParameters.id);

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

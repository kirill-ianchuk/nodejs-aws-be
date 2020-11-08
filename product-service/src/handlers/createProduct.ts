import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';

import * as utils from '../utils';
import * as productModel from '../models/product';

const requestBodySchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().integer().min(1).required(),
    count: Joi.number().integer().min(1).required(),
});

export const createProduct: APIGatewayProxyHandler = async (event) => {
    let result: APIGatewayProxyResult;

    console.log(`Received event ${event.httpMethod} ${event.path} ${event.body}`);

    const payload = JSON.parse(event.body);

    try {
        Joi.assert(payload, requestBodySchema, { abortEarly: false });

        const product = await productModel.createProduct(payload);

        result = {
            statusCode: 201,
            body: JSON.stringify(product, null, 2),
        }
    } catch (err) {
        result = {
            body: JSON.stringify({ message: err.message }),
            statusCode: err.name === 'ValidationError' ? 400 : 500
        };
    }

    return utils.addCors(result);
};

import AWS from 'aws-sdk';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as path from 'path';
import Joi from 'joi';

import config from '../../config';
import * as utils from '../utils';

const queryParamsSchema = Joi.object({
    name: Joi.string().required(),
});

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
    const s3 = new AWS.S3({ region: config.aws.region });

    let result: APIGatewayProxyResult;

    try {
        Joi.assert(event.queryStringParameters || {}, queryParamsSchema);

        const { name } = event.queryStringParameters;

        const params = {
            Bucket: config.aws.s3.bucket,
            Key: path.join(config.aws.s3.uploadFolderName, name),
            Expires: 60,
            ContentType: 'text/csv',
        };

        const signedUrl = await s3.getSignedUrlPromise('putObject', params);

        result = {
            statusCode: 200,
            body: JSON.stringify({
                url: signedUrl,
            })
        };
    } catch (err) {
        result = {
            body: JSON.stringify({ message: err.message }),
            statusCode: err.name === 'ValidationError' ? 400 : 500
        }
    }

    return utils.addCors(result);
};

import { APIGatewayProxyResult } from 'aws-lambda';

export const addCors = (obj: APIGatewayProxyResult) => ({
    ...obj,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
});

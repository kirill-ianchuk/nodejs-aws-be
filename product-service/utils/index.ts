import { APIGatewayProxyResult } from 'aws-lambda';

export const simulateNetworkRequest = () => new Promise((resolve) => setTimeout(resolve, 0));

export const addCors = (obj: APIGatewayProxyResult) => ({
    ...obj,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
});

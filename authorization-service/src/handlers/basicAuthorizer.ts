import {
    APIGatewayAuthorizerHandler,
    APIGatewayTokenAuthorizerEvent,
    PolicyDocument,
} from 'aws-lambda';

interface UserCredentials {
    username?: string;
    password?: string;
}

enum Effect {
    Allow = 'Allow',
    Deny = 'Deny'
}

enum ErrorMessage {
    Unauthorized = 'Unauthorized'
}

const isValidBasicAuth = (tokenParts: string[]) => (tokenParts.length === 2) && (tokenParts[0].toLowerCase() === 'basic');

const decodeUserCredentials = (encodedCredentials: string): UserCredentials => {
    const [username, password] = Buffer.from(encodedCredentials, 'base64')
        .toString('utf-8')
        .split(':');

    return ({ username, password });
};

const isValidUserCredentials = (userCredentials: UserCredentials): boolean => {
    if (!userCredentials.username || !userCredentials.password) {
        return false;
    }

    const storedPassword = process.env[userCredentials.username];

    return storedPassword && userCredentials.password === storedPassword;
};

const generatePolicyDocument = (effect: keyof typeof Effect, resourceArn: string): PolicyDocument => ({
    Version: '2012-10-17',
    Statement: [
        {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resourceArn,
        }
    ]
});

export const basicAuthorizer: APIGatewayAuthorizerHandler = (event: APIGatewayTokenAuthorizerEvent, _context, callback) => {
    if (!event.authorizationToken) {
        return callback(ErrorMessage.Unauthorized);
    }

    try {
        const tokenParts = event.authorizationToken.split(' ');

        if (!isValidBasicAuth(tokenParts)) {
            return callback(ErrorMessage.Unauthorized);
        }

        const userCredentials = decodeUserCredentials(tokenParts[1]);

        const effect = isValidUserCredentials(userCredentials) ? Effect.Allow : Effect.Deny;

        const policyDocument = generatePolicyDocument(effect, event.methodArn);

        return callback(null, {
            principalId: userCredentials.username,
            policyDocument,
        });
    } catch (err) {
        return callback(ErrorMessage.Unauthorized);
    }
};

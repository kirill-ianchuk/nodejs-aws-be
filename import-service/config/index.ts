export default {
    aws: {
        region: 'eu-west-1',
        s3: {
            bucket: 'nodejs-in-aws-product-import',
            uploadFolderName: 'uploaded',
            parsedFolderName: 'parsed',
        },
        productService: {
            stackName: 'product-service-dev',
        },
    },
};

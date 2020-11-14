import AWS from 'aws-sdk';
import { S3Handler } from 'aws-lambda';
import csv from 'csv-parser';
import * as path from 'path';

import config from '../../config';

const importAndParseFileFromS3 = (
    objectKey: string,
    s3: AWS.S3,
): Promise<{[key: string]: string}[]> => new Promise((resolve, reject) => {
    const params = {
        Bucket: config.aws.s3.bucket,
        Key: objectKey
    };

    const results = [];

    s3.getObject(params)
        .createReadStream()
        .on('error', reject)
        .pipe(csv())
        .on('error', reject)
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
});

const moveFileInS3 = async (
    bucket: string,
    sourceKey: string,
    destKey: string,
    s3: AWS.S3,
): Promise<void> => {
    await s3.copyObject({
        Bucket: bucket,
        CopySource: path.join(bucket, sourceKey),
        Key: destKey,
    }).promise();

    await s3.deleteObject({
        Bucket: bucket,
        Key: sourceKey,
    }).promise();

    console.log(`Moved ${sourceKey} to ${destKey}`);
};

export const importFileParser: S3Handler = async (event) => {
    const s3 = new AWS.S3({ region: config.aws.region });

    for (const record of event.Records) {
        const products = await importAndParseFileFromS3(record.s3.object.key, s3);

        products.forEach(product => console.log(JSON.stringify(product, null, 2)));

        await moveFileInS3(
            config.aws.s3.bucket,
            record.s3.object.key,
            record.s3.object.key.replace(
                config.aws.s3.uploadFolderName,
                config.aws.s3.parsedFolderName,
            ),
            s3,
        );
    }
};

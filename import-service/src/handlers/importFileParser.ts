import AWS from 'aws-sdk';
import { S3Handler } from 'aws-lambda';
import csv from 'csv-parser';

import config from '../../config';

const s3 = new AWS.S3({ region: config.aws.region });

const importAndParseFileFromS3 = (s3objectKey: string): Promise<{[key: string]: string}[]> => new Promise((resolve, reject) => {
    const params = {
        Bucket: config.aws.s3.bucket,
        Key: s3objectKey
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

export const importFileParser: S3Handler = async (event) => {
    for (const record of event.Records) {
        console.log(record.s3.object.key);
        const products = await importAndParseFileFromS3(record.s3.object.key);

        products.forEach(product => console.log(JSON.stringify(product, null, 2)))
    }
};

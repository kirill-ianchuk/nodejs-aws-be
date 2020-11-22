import AWS from 'aws-sdk';
import { S3Handler } from 'aws-lambda';
import csv from 'csv-parser';
import * as path from 'path';
import { Transform } from 'stream';
import config from '../../config';

class ToSQSStream extends Transform {
    sqs: AWS.SQS;

    constructor(sqs: AWS.SQS) {
        super({ writableObjectMode: true });
        this.sqs = sqs
    }

    _transform(chunk: any, _encoding: string, callback: (error?: Error, data?: any) => void): void {
        this.sqs.sendMessage({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(chunk),
        }, (err) => {
            if (err) {
                return callback(err);
            }

            console.log(`${chunk.title} is sent to SQS queue`);

            return callback();
        })
    }
}

const importAndParseFileFromS3 = (
    bucket: string,
    objectKey: string,
    s3: AWS.S3,
): Promise<void> => new Promise((resolve, reject) => {
    const sqs = new AWS.SQS({ region: config.aws.region });

    const toSqsStream = new ToSQSStream(sqs);
    const csvStream = csv({
        mapValues: ({ value }) => {
            return isNaN(value) ? value : Number(value);
        }
    });

    const params = {
        Bucket: bucket,
        Key: objectKey
    };

    s3.getObject(params)
        .createReadStream()
        .on('error', reject)
        .pipe(csvStream)
        .on('error', reject)
        .pipe(toSqsStream)
        .on('error', reject)
        .on('end', resolve)
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

    try {
        for (const record of event.Records) {
            await importAndParseFileFromS3(
                config.aws.s3.bucket,
                record.s3.object.key,
                s3,
            );

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
    } catch (err) {
        console.log(err);
    }
};

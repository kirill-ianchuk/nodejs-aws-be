import { SQSHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

import * as productModel from '../models/product';
import config from '../../config';

const findMinProductPrice = (products) => Math.min.apply(null, products.map(({price}) => price));

const sendEmailNotification = async (products) => {
    const sns = new AWS.SNS({ region: config.aws.region });

    const message = products
        .map((product, index) => `${index + 1}. ${product.title} (price: ${product.price}$, count: ${product.count})`)
        .join('\n');

    await sns.publish({
        Subject: 'New products in the catalog!',
        Message: message,
        TopicArn: process.env.SNS_TOPIC_ARN,
        MessageAttributes: {
            minPrice: {
                DataType: 'Number',
                StringValue: String(findMinProductPrice(products)),
            }
        }
    }).promise();

    console.log('Sent an email notification');
};

export const catalogBatchProcess: SQSHandler = async (event) => {
    try {
        const products = event.Records.map(({ body }) => JSON.parse(body));

        await productModel.createProductsBatch(products);
        await sendEmailNotification(products);
    } catch (err) {
        console.log(err);
    }
};

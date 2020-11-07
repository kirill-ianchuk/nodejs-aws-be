import { Client } from 'pg';
import knex from 'knex';

import config from '../../config';

const queryBuilder = knex({ client: 'pg' });

const productsListQuery = queryBuilder
    .select([
        'product.id',
        'title',
        'description',
        'price',
        'count'
    ])
    .from('product')
    .innerJoin('stock', 'product.id', 'stock.product_id');

export const getProductsList = async () => {
    const client = new Client(config.db);

    await client.connect();

    try {
        const result = await client.query(productsListQuery.toString());

        return result.rows
    } finally {
        await client.end();
    }
};

export const getProductById = async (productId) => {
    const client = new Client(config.db);

    await client.connect();

    try {
        const result = await client.query(productsListQuery
            .clone()
            .where({ 'product.id': productId })
            .toString()
        );

        return result.rows[0];
    } finally {
        await client.end();
    }
};

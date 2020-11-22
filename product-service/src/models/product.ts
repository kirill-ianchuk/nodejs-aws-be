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

export const createProduct = async (payload) => {
    const client = new Client(config.db);

    await client.connect();

    try {
        await client.query('BEGIN');

        const productInsertQueryString = queryBuilder
            .insert({
                title: payload.title,
                description: payload.description,
                price: payload.price
            })
            .into('product')
            .returning('id')
            .toString();

        const productInsertResult = await client.query(productInsertQueryString);
        const createdProduct = productInsertResult.rows[0];

        const stockInsertQueryString = queryBuilder
            .insert({
                product_id: createdProduct.id,
                count: payload.count,
            })
            .into('stock')
            .toString();

        await client.query(stockInsertQueryString);

        await client.query('COMMIT');

        return productInsertResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');

        throw err;
    } finally {
        await client.end();
    }
};

export const createProductsBatch = async (payload) => {
    const client = new Client(config.db);

    await client.connect();

    try {
        await client.query('BEGIN');

        const productInsertQueryString = queryBuilder
            .insert(payload.map(({ title, description, price }) => ({ title, description, price })))
            .into('product')
            .returning('id')
            .toString();

        const productInsertResult = await client.query(productInsertQueryString);

        const createdProducts = productInsertResult.rows;

        const stockInsertQueryString = queryBuilder
            .insert(payload.map((product, index) => ({
                product_id: createdProducts[index].id,
                count: product.count,
            })))
            .into('stock')
            .toString();

        await client.query(stockInsertQueryString);

        await client.query('COMMIT');

        console.log(`Created products: ${productInsertResult.rows}`);

        return createdProducts;
    } catch (err) {
        await client.query('ROLLBACK');

        throw err;
    } finally {
        await client.end();
    }
};

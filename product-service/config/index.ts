export default {
    db: {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        database: process.env.PG_DATABASE,
        user: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        ssl: {
            rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 5000,
    },
    aws: {
        region: 'eu-west-1',
    }
}

require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT || 5432,
        dialect:  process.env.DB_DIALECT,
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE + '_test',
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT || 5432,
        dialect:  process.env.DB_DIALECT,
    },
    production: {
        use_env_variable: 'DB_URL',
        dialect: process.env.DB_DIALECT,
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    },
};

require('dotenv').config();

module.exports = {
  development: {
    username: "root",
    password: "0000",
    database: "petdb",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    url: process.env.MYSQL_URL,
    dialect: "mysql"
  }
};

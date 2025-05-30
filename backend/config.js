require('dotenv').config();

const mysql = require('mysql2');

const db_url = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT}/${process.env.MYSQLDATABASE}`;

const connection = mysql.createConnection(db_url);

module.exports = connection;
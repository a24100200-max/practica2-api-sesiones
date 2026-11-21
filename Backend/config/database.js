// Conexion a la base de datos MySQL (XAMPP)
const mysql = require('mysql2/promise');

require('dotenv').config();

// Usamos un POOL y no una sola conexion: el pool reparte varias
// conexiones entre las peticiones y se reconecta solo.
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;

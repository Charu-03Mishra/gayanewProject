import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    // password: 'GayaConnect123##',
    password:'@Dev25#charu',
    database: 'gayanew',
    waitForConnections: true
})

export default pool
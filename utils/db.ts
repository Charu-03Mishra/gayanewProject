import mysql from 'mysql2';

let pool: any;

export function connect() {
  // Initialize the pool if it doesn't exist
  if (!pool) {
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      // password: 'GayaConnect123##',
      password:'@Dev25#charu',
      // password: 'Yash@1212888',
      database: 'gayanew',
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10, // Adjust this based on your requirements
      queueLimit: 0,
    });

    console.log('Database pool created successfully');
  }
  // Return the pool's promise interface to use with async/await
  return pool.promise();
}

export default connect;

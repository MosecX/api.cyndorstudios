import mysql from "mysql2/promise";

let pool: mysql.Pool;

export async function connectDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10, // límite de conexiones
      queueLimit: 0,
    });
  }
  return pool;
}

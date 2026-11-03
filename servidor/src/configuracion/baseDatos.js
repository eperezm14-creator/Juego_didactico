import 'dotenv/config';
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const certificado = readFileSync(
  new URL('../../certificados/ca.pem', import.meta.url),
  'utf8'
);

const baseDatos = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: certificado,
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 5
});

export default baseDatos;
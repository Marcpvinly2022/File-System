import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'user_db',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

export default pool;

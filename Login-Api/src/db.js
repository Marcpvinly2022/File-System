
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
    // Use process.env variables so Docker can "inject" the correct host
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost', 
    database: process.env.DB_NAME || 'user_db',
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Professional Tip: Add a connection log to help the intern debug
pool.on('connect', () => {
    console.log('🐘 Connected to the PostgreSQL database successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;

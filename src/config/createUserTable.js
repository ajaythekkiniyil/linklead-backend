import pool from "./connection.js";

const createUserTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        user_name VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        phone VARCHAR(10) NOT NULL UNIQUE,
        otp VARCHAR(6),
        otp_expiry TIMESTAMPTZ,
        phone_verified BOOLEAN DEFAULT FALSE,
        user_image VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

    try {
        pool.query(queryText)
        console.log('User table created if not exists');
    }
    catch (err) {
        console.log('Error creating users table', err);
    }
}

export default createUserTable;
import pool from "./connection.js";

const createTables = async () => {
    const userTable = `
    CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        user_name VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        phone VARCHAR(10) NOT NULL UNIQUE,
        otp VARCHAR(6),
        otp_expiry TIMESTAMPTZ,
        phone_verified BOOLEAN DEFAULT FALSE,
        user_image VARCHAR(100),
        service_ids UUID[] DEFAULT ARRAY[]::UUID[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

    const serviceTable = `
        CREATE TABLE IF NOT EXISTS services (
            service_id UUID PRIMARY KEY,
            business_name TEXT NOT NULL,
            address TEXT NOT NULL,
            pincode VARCHAR(6) NOT NULL,
            city VARCHAR(20) NOT NULL,
            state VARCHAR(20) NOT NULL,
            description TEXT,
            social_media TEXT[] DEFAULT ARRAY[]::TEXT[],
            photos TEXT[] DEFAULT ARRAY[]::TEXT[],
            phone VARCHAR(10) NOT NULL,
            reviews JSONB DEFAULT '[]'::JSONB
        )
    `;

    try {
        await pool.query(userTable)
        await pool.query(serviceTable)
        console.log('Table created if not exists');
    }
    catch (err) {
        console.log('Error creating users table', err);
    }
}

export default createTables;
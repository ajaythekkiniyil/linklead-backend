import pool from "./connection.js";

const createUserTable = async ()=>{
    const queryText = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100),
        password VARCHAR(100),
        phone VARCHAR(10) NOT NULL,
        otp VARCHAR(6),
        otp_expiry TIMESTAMPTZ,
        created_at TIMESTAMP DEFAULT NOW()
    )
    `;

    try{
        pool.query(queryText)
        console.log('User table created if not exists');
    }
    catch(err){
        console.log('Error creating users table', err);
    }
}

export default createUserTable;
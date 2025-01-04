import pool from '../config/connection.js';
import { sendOtpHelper } from '../helper/helper.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const sendOtp = async (req, res) => {
    const { phone } = req.body;

    try {
        // Check phone number and phone_verified = true
        const { rowCount: userExists } = await pool.query('SELECT 1 FROM users WHERE phone = $1 AND phone_verified=true;', [phone]);
        if (userExists) {
            return res.status(409).json({ message: 'User already exists with this phone number' });
        }

        // Generate a 6-digit OTP and expiry time (10 minute from now)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 600000); // 10 minute

        // generate random user id
        const user_id = randomUUID();

        // Store user_id, phone, OTP, and expiry in the database
        // for resend otp update entry from db
        const { rows } = await pool.query(
            `INSERT INTO users (user_id, phone, otp, otp_expiry) VALUES ($1, $2, $3, $4)
            ON CONFLICT (phone)
            DO UPDATE SET
            user_id = EXCLUDED.user_id,
            otp = EXCLUDED.otp,
            otp_expiry = EXCLUDED.otp_expiry
            RETURNING user_id;
            `,
            [user_id, phone, otp, otpExpiry]
        );

        // Send opt to user phone number
        const response = await sendOtpHelper(`+91${phone}`, otp)

        return res.status(200).json({ message: 'OTP sent successfully', response, userId: rows[0].user_id });
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while sending otp', err })
    }
}

// this function also used for resetting username or password
export const verifyOtp = async (req, res) => {
    const { phone, otp, userId, userName, password } = req.body;

    const sanitizedName = userName && userName.trim() !== '' ? userName : null;
    const sanitizedPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

    try {
        // verify otp
        const { rows, rowCount } = await pool.query('SELECT * FROM users WHERE user_id=$1 AND phone=$2 AND otp=$3 AND otp_expiry > NOW();', [userId, phone, otp])

        if (rowCount === 0) {
            return res.status(400).json({ message: 'OTP not verified' })
        }

        // updating phone_verified status 
        await pool.query('UPDATE users SET user_name = COALESCE($1, user_name), password = COALESCE($2, password), phone_verified = true WHERE user_id=$3;', [sanitizedName, sanitizedPassword, userId])

        return res.status(200).json({ message: 'OTP verified data based values updated' })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while verifing otp', err })
    }
}

// save username and password
export const createProfile = async (req, res) => {
    const { userName, password, userId } = req.body;

    try {
        var { rowCount } = await pool.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);

        if (!rowCount) {
            return res.status(404).json({ message: 'Profile updating error' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query('UPDATE users SET user_name=$1, password=$2 WHERE user_id=$3 AND phone_verified=true;', [userName, hashedPassword, userId])

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Profile not verified' })
        }

        return res.status(201).json({ message: 'User profile created' })
    }
    catch (err) {
        return res.status(500).json({ message: 'Profile updating error', err })
    }
}

// login
export const login = async (req, res) => {
    const { userName, password } = req.body;

    try {
        const { rows, rowCount } = await pool.query('SELECT * FROM users WHERE user_name=$1;', [userName])
        const username = rows[0]?.user_name
        const userId = rows[0]?.id
        const hashedPassword = rows[0]?.password

        if (rowCount === 0 || !(await bcrypt.compare(password, hashedPassword))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // generate token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login success', userId, token: token })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while login', err })
    }
}

// update username, photo
export const updateProfile = async (req, res) => {
    const { userName, userId } = req.body;
    const fileName = req.file?.location

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        const sanitizedName = userName && userName.trim() !== '' ? userName : null;
        const sanitizedFileName = fileName && fileName.trim() !== '' ? fileName : null;

        const { rowCount, rows } = await pool.query('UPDATE users SET user_name=COALESCE($1, user_name), user_image=COALESCE($2, user_image) WHERE user_id=$3 RETURNING *;', [sanitizedName, sanitizedFileName, userId])

        if (rowCount === 0) {
            return res.status(500).json({ message: 'User not found!. For updating profile' })
        }
        return res.status(200).json({ message: 'User profile updated' })
    }
    catch (err) {
        return res.status(500).json({ message: 'User not found!. For updating profile' })
    }

}

// reset username or password
export const forgotPassword = async (req, res) => {
    const { userName, password, userId, phone } = req.body

    if (!userId || !phone) {
        return res.status(400).json({ message: 'userId and phone is required' });
    }

    try {
        // send otp and verify phone number
        // Generate a 6-digit OTP and expiry time (10 minute from now)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 600000); // 10 minute

        const { rowCount } = await pool.query(`UPDATE users SET otp_expiry = $1, otp = $2 WHERE user_id = $3 AND phone = $4 RETURNING *;`, [otpExpiry, otp, userId, phone]);

        if (rowCount === 0) {
            return res.status(500).json({ message: 'Error while resetting password, incorrect userId or phone' })
        }

        // Send opt to user phone number
        const response = await sendOtpHelper(`+91${phone}`, otp)
        return res.status(200).json({ message: 'Reset OTP sent successfully', response });
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while resetting password' })
    }

}

export const createService = async (req, res) => {
    const { userId, business_name, address, pincode, city, state,
        description, social_media = [], photos = [], phone, reviews = [] } = req.body;

    // Generate random service ID
    const serviceId = randomUUID();

    try {
        // Insert into the services table
        const { rowCount: serviceInsertCount, rows: serviceRows } = await pool.query(`
            INSERT INTO services (
                service_id, 
                business_name, 
                address, 
                pincode, 
                city, 
                state, 
                description, 
                social_media, 
                photos, 
                phone, 
                reviews
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *;
        `, [
            serviceId,
            business_name,
            address,
            pincode,
            city,
            state,
            description,
            social_media,
            photos,
            phone,
            JSON.stringify(reviews)
        ]);

        if (serviceInsertCount === 0) {
            return res.status(400).json({ message: 'Failed to insert service' });
        }

        // Update the users table to append the new service ID to the service_ids column
        const { rowCount: userUpdateCount, rows: updatedUserRows } = await pool.query(`
            UPDATE users 
            SET service_ids = array_append(service_ids, $1) 
            WHERE user_id = $2 
            RETURNING *;
        `, [serviceId, userId]);

        if (userUpdateCount === 0) {
            return res.status(404).json({ message: 'User not found or failed to update' });
        }

        return res.status(201).json({ message: 'Service created and user updated successfully' });
    } catch (err) {
        console.error('Error while creating service:', err);
        return res.status(500).json({ message: 'Error while creating service', error: err.message });
    }
};

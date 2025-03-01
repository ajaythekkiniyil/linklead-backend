import pool from '../config/connection.js';
import { sendOtpHelper } from '../helper/helper.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const sendOtp = async (req, res) => {
    const { phone } = req.body;

    try {
        // Check if the phone number is already verified
        const { rowCount: isPhoneVerified } = await pool.query(
            'SELECT 1 FROM users WHERE phone = $1 AND phone_verified = true;',
            [phone]
        );

        if (isPhoneVerified) {
            return res.status(409).json({ message: 'User already exists with this phone number' });
        }

        // Generate a 6-digit OTP and expiry time (5 minutes from now)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 300000); // 5 minutes

        // Send OTP to the user
        const response = await sendOtpHelper(`+91${phone}`, otp);

        // If a user with the same phone does not exist, a new record is inserted.
        // If the phone already exists, the otp and otp_expiry are updated.
        await pool.query(
            `insert into users (user_id, phone, otp, otp_expiry)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (phone)  
            DO UPDATE SET otp = EXCLUDED.otp, otp_expiry = EXCLUDED.otp_expiry;`,
            [randomUUID(), phone, otp, otpExpiry]
        );

        return res.status(200).json({ message: 'OTP sent successfully', response });
    } catch (err) {
        return res.status(500).json({ message: 'Error while sending OTP', error: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        const { rows, rowCount } = await pool.query('SELECT * FROM users WHERE phone=$1 AND otp=$2 AND otp_expiry > NOW();', [phone, otp])

        if (rowCount === 0) {
            return res.status(400).json({ message: 'OTP not verified' })
        }

        // updating phone_verified status 
        await pool.query('UPDATE users SET phone_verified = true WHERE phone=$1;', [phone])

        return res.status(200).json({ message: 'OTP verified data based values updated', rows })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while verifing otp', err })
    }
}

// creating a username and password for login
export const createProfile = async (req, res) => {
    const { username, password, phone, otp } = req.body;

    try {
        var { rowCount } = await pool.query('SELECT 1 FROM users WHERE phone = $1 AND otp = $2;', [phone, otp]);

        if (!rowCount) {
            return res.status(404).json({ message: 'No user found' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        var { rowCount } = await pool.query('UPDATE users SET user_name=$1, password=$2 WHERE phone=$3 AND otp = $4 AND phone_verified=true;', [username, hashedPassword, phone, otp])

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Profile not created' })
        }

        return res.status(201).json({ message: 'User profile created' })
    }
    catch (err) {
        return res.status(500).json({ message: 'Profile updating error', err })
    }
}

// login
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const { rows, rowCount } = await pool.query('SELECT * FROM users WHERE user_name=$1;', [username])

        const username = rows[0]?.user_name
        const userId = rows[0]?.user_id
        const phone = rows[0]?.phone
        const hashedPassword = rows[0]?.password

        if (rowCount === 0 || !(await bcrypt.compare(password, hashedPassword))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // generate token
        const token = jwt.sign({ username, userId, phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login success', userId, token: token })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while login', err })
    }
}

// update username, photo
export const updateProfile = async (req, res) => {
    const { username, userId } = req.user;

    // const { newUserName } = req.body;
    // const fileName = req.file?.location

    // if (!userId) {
    //     return res.status(400).json({ message: 'userId is required' });
    // }

    // try {
    //     const sanitizedName = userName && userName.trim() !== '' ? userName : null;
    //     const sanitizedFileName = fileName && fileName.trim() !== '' ? fileName : null;

    //     const { rowCount, rows } = await pool.query('UPDATE users SET user_name=COALESCE($1, user_name), user_image=COALESCE($2, user_image) WHERE user_id=$3 RETURNING *;', [sanitizedName, sanitizedFileName, userId])

    //     if (rowCount === 0) {
    //         return res.status(500).json({ message: 'User not found!. For updating profile' })
    //     }
    //     return res.status(200).json({ message: 'User profile updated' })
    // }
    // catch (err) {
    //     return res.status(500).json({ message: 'User not found!. For updating profile' })
    // }

}

export const forgotPassword = async (req, res) => {
    const { phone } = req.body

    if (!phone) {
        return res.status(400).json({ message: 'Phone is required' });
    }

    try {
        // send otp and verify phone number
        // Generate a 6-digit OTP and expiry time (5 minute from now)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 300000); //5 minute

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
        const { rowCount: serviceInsertCount } = await pool.query(`
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
        const { rowCount: userUpdateCount } = await pool.query(`
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
        return res.status(500).json({ message: 'Error while creating service', error: err.message });
    }
};

export const getServices = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId required' })
    }

    try {
        const { rows } = await pool.query(
            `
                SELECT * FROM services
                WHERE service_id = ANY (
                    SELECT unnest(service_ids) FROM users WHERE user_id = $1
                );
            `, [userId])

        return res.status(200).json({ services: rows })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while get services', error: err.message });
    }
};
import pool from '../config/connection.js';
import { sendOtpHelper } from '../helper/helper.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const sendOtp = async (req, res) => {
    const { phone } = req.body;

    try {
        // Check phone already exists
        const user = await pool.query('SELECT * FROM users WHERE phone=$1;', [phone])
        if (user.rowCount > 0) {
            return res.status(409).json({ message: 'User alredy exist with this phone number' })
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        const otpExpiry = new Date(Date.now() + 600000); // 10 minutes from now

        // Store phone, otp, expiry time in data base
        await pool.query('INSERT INTO users (phone, otp, otp_expiry) VALUES ($1, $2, $3);', [phone, otp, otpExpiry])

        // Send opt to user phone number
        const response = await sendOtpHelper(`+91${phone}`, otp)

        return res.status(200).json({ message: 'OTP sent successfully', response });
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while sending otp', err })
    }
}

export const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE phone=$1;', [phone])

        if (user.rowCount > 0) {
            // verify otp
            const result = await pool.query('SELECT * FROM users WHERE phone=$1 AND otp=$2 AND otp_expiry > NOW();', [phone, otp])

            if (result.rowCount > 0) {
                return res.status(200).json({ message: 'OTP verified successfully' })
            }

            return res.status(400).json({ message: 'OTP not verified successfully' })
        }

        return res.status(400).json({ message: 'Invalid phone number or otp' })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while verifing otp', err })
    }
}

// save username and password
export const createProfile = async (req, res) => {
    const { userName, password, phone } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE phone=$1;', [phone])

        if (user.rowCount > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);

            await pool.query('UPDATE users SET user_name=$1, password=$2 WHERE phone=$3;', [userName, hashedPassword, phone])

            return res.status(201).json({ message: 'User profile created' })
        }

        return res.status(404).json({ message: 'User not found!. For updating profile' })
    }
    catch (err) {
        return res.status(500).json({ message: 'Profile updating error', err })
    }
}

// login
export const login = async (req, res) => {
    const { userName, password } = req.body;

    try {
        const user = await pool.query('SELECT user_name, password FROM users WHERE user_name=$1;', [userName])
        const username = user.rows[0]?.user_name
        const hashedPassword = user.rows[0].password

        if (user.rowCount === 0 || !(await bcrypt.compare(password, hashedPassword))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // generate token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login success', token: token })
    }
    catch (err) {
        return res.status(500).json({ message: 'Error while login', err })
    }
}


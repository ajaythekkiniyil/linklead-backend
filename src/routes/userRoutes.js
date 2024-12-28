import express from 'express';
import { sendOtp, verifyOtp, createProfile, login } from '../controllers/userController.js';
import { validatePhone, validateOtp, validateProfileDetails, validateLogin } from '../middlewares/inputValidators.js';
import { verifyToken } from '../helper/verifyToken.js';

const router = express.Router();

router.post('/send-otp', validatePhone, sendOtp);
router.post('/verify-otp', validateOtp, verifyOtp);
router.post('/create-profile', validateProfileDetails, createProfile);
router.post('/login', validateLogin, login);

// router.get('/', verifyToken, protectedRoute)

export default router;
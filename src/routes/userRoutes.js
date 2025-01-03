import express from 'express';
import { sendOtp, verifyOtp, createProfile, login, updateProfile, createService, forgotPassword } from '../controllers/userController.js';
import { validatePhone, validateOtp, validateProfileDetails, validateLogin, validateReset } from '../middlewares/inputValidators.js';
import { upload, verifyToken } from '../helper/helper.js';

const router = express.Router();

// login using phone number
router.post('/send-otp', validatePhone, sendOtp);
router.post('/verify-otp', validateOtp, verifyOtp);
router.post('/create-profile', validateProfileDetails, createProfile);
router.post('/login', validateLogin, login);
router.put('/update-profile', verifyToken, upload.single('image'), updateProfile)
// forgot username or password
router.post('/forgot-password', verifyToken, forgotPassword)

// router.post('/create-service', verifyToken, , createService)

export default router;
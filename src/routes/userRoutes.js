import express from 'express';
import { sendOtp, verifyOtp, createProfile, login, updateProfile } from '../controllers/userController.js';
import { validatePhone, validateOtp, validateProfileDetails, validateLogin } from '../middlewares/inputValidators.js';
import { upload, verifyToken } from '../helper/helper.js';

const router = express.Router();

// login using phone number
router.post('/send-otp', validatePhone, sendOtp);
router.post('/verify-otp', validateOtp, verifyOtp);
router.post('/create-profile', validateProfileDetails, createProfile);
router.post('/login', validateLogin, login);
router.put('/update-profile', verifyToken, upload.single('image'), updateProfile)

export default router;
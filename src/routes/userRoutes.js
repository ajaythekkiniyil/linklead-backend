import express from 'express';
import { sendOtp, verifyOtp, createProfile, login, updateProfile, createService, forgotPassword, getServices } from '../controllers/userController.js';
import { validatePhone, validateOtp, validateProfileDetails, validateLogin, validateService } from '../middlewares/inputValidators.js';
import { upload, verifyToken } from '../helper/helper.js';

const router = express.Router();

// this end-point using for both sending otp and re-sending.
router.post('/send-otp', validatePhone, sendOtp);

router.post('/verify-otp', validateOtp, verifyOtp);
router.post('/create-profile', validateProfileDetails, createProfile);
router.post('/login', validateLogin, login);
router.put('/update-profile', verifyToken, upload.single('image'), updateProfile)
// forgot username or password
router.post('/forgot-password', validatePhone, forgotPassword)

router.post('/create-service', verifyToken, validateService, createService)
router.get('/get-services', verifyToken, getServices)

export default router;
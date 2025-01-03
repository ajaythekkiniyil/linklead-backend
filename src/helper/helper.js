import twilio from 'twilio';
import jwt from 'jsonwebtoken';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

export const sendOtpHelper = async (phone, otp) => {    
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const createMessage = async (phone, otp) => {
        try {
            // const message = await client.messages.create({
            //     body: `opt is : ${otp}`,
            //     from: "+13097409459",
            //     to: phone,
            // });
            
            return { status: true, sid: 'message.sid'}
        }
        catch (err) {
            return { message: 'otp sending error', error: err, status: false }
        }
    }

    return await createMessage(phone, otp);
}

// Middleware to Protect Routes
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
     
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; 
        next();
    } catch (err) {
        res.status(403).json({ message: 'Unauthorized' });
    }
};


// Configure S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Configure Multer-S3 for direct uploads
export const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileExtension = path.extname(file.originalname); // Extract the file extension
            const randomName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${fileExtension}`;

            const folderName = 'users'; // Specify folder here
            cb(null, `${folderName}/${randomName}`);
        },
    }),
});

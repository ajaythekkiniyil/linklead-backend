import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import createTables from './config/createTables.js';
import rateLimit from 'express-rate-limit';

const app = express();

// rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `windowMs`
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Middleware
app.use(express.json())
app.use(cors())
// Apply rate limiting to all requests
app.use(limiter);

// Creating tables
createTables()

// Routes
app.get('/', (req, res) => res.send('welcome to api'))
app.use('/api', userRoutes)

const port = process.env.PORT || 3001;

app.listen(port, console.log(`Server listening on port: ${port}`));
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import createTables from './config/createTables.js';

const app = express();

// Middleware
app.use(express.json())
app.use(cors())

// Creating tables
createTables()

// Routes
app.use('/api', userRoutes)

const port = process.env.PORT || 3000;

app.listen(port, console.log(`Server listening on port: ${port}`));
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import createUserTable from './config/createUserTable.js';

const app = express();

// Middleware
app.use(express.json())
app.use(cors())

// Creating tables
createUserTable()

// Routes
app.use('/api', userRoutes)

const port = process.env.PORT || 3000;

app.listen(port, console.log(`Server listening on port: ${port}`));
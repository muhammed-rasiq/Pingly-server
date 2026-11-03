import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './config/db'

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
await db();

// Test route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Pingly Backend Server is Running!'
    });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(` Pingly server running on http://localhost:${PORT}`);
});
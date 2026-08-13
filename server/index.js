import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';

const app = express();

app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));

const startServer = async () => {
    try {
        await connectDB();

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port: http://127.0.0.1:${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
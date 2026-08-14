import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import profileRoutes from "./routes/profiles.js";
import eventRoutes from "./routes/events.js";
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));

app.use("/api/profiles", profileRoutes);
app.use("/api/events", eventRoutes);

app.use("/api", notFound)
app.use(errorHandler);

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
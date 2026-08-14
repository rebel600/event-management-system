import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import profileRoutes from "./routes/profiles.js";
import eventRoutes from "./routes/events.js";
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Comma-separated list so preview deploys and localhost can share one variable.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(express.json());

app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
}));

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/profiles", profileRoutes);
app.use("/api/events", eventRoutes);

app.use("/api", notFound)

// In production the client is built into client/dist and served from here, so
// the whole app runs on a single origin. Skipped in development, where the
// Vite dev server hosts the client and proxies /api back to this process.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../client/dist");

if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));

    // Client-side routing: anything not matched above returns the SPA shell.
    app.use((req, res) => {
        res.sendFile(path.join(clientDist, "index.html"));
    });
} else {
    console.warn(`No client build found at ${clientDist} — serving API only.`);
}

app.use(errorHandler);

// Railway injects PORT at runtime; fall back for local development.
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        // Bind 0.0.0.0 so the platform's proxy can reach the container.
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
import express, { urlencoded } from "express";
import { createServer } from "node:http";  // standard Node.js module 
import mongoose from "mongoose";
import cors from "cors";
import 'dotenv/config';
import { connectToSocket } from "./src/controller/socketManager.js";
import userRouter from "./src/routes/user_routes.js";

const port = 8000;

const app = express(); // it's fundamentally a middleware for HTTP
const server = createServer(app); // it need direct access to the low-lvl HTTP server 
const io = connectToSocket(server);// creates a single server that handle both express route and Socket.io REAL-TIME event on the same port

app.set("port", (process.env.PORT || port));

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "40kb" }));
app.use(urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
    return res.send("Hello,world");
});



// global error handling route

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // log the error in the terminal
    console.error("ERROR", err.message);
    if (process.env.NODE_ENV === "development") console.error(err.stack);

    // sends a clean JSON response to the frontend
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        status: "error",
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined // if I'm in development environment then show the error stack
    });
});


const start = async () => {
    const dbUrl = process.env.DB_URL;
    try {
        const connectDb = await mongoose.connect(dbUrl);
        console.log(`MONGODB connected DB Host: ${connectDb.connection.host}`);
    } catch (e) {
        console.log("DB connection failed", e);
    }
    server.listen(app.get("port"), () => {
        console.log(`server is running at ${app.get("port")}`)
    });
}

start();
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import interestRoutes from './routes/interestRoutes.js';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app); //wrap express in HTTP server

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Test route
app.post('/test', (req, res) => {
  console.log("Test route hit", req.body);
  res.json({ message: "Test route works!" });
});

// API routes
app.use('/v1/auth', authRoutes);
app.use('/v1/interest', interestRoutes);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // later replace with frontend URL
    methods: ["GET", "POST"]
  }
});
global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    console.log(`User ${userId} joined`);
    socket.join(userId); // user joins their own "room"
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// DB connect + start server
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting DB:", err);
  });

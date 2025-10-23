import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors'
import { Server } from 'socket.io';

import connectDB from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import interestRoutes from './routes/interestRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app); 

app.use(cors({
  origin:'https://interest-sharing.netlify.app',
  credentials: true,
}))

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
app.use('/v1/user', userRoutes);
app.use('/v1/categories', categoryRoutes);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: 'https://interest-sharing.netlify.app',
    methods: ["GET", "POST"],
    credentials: true
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

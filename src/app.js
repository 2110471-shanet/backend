// src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connect from './config/mongodb.js';
import authenticationRoute from './router/authentication.routes.js';
import apiRoute from './router/api.routes.js';
import http from 'http';
import socketHandler from './socket.js';
import authMiddleware from './authMiddleware.js';
import chatroomsRoute from './router/chatrooms.routes.js';
import chatsRoute from './router/chats.routes.js'

const createApp = () => {
  const app = express();
  const corsOption = {
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  };

  app.use(cors(corsOption));
  app.options('*', cors(corsOption));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/auth', authenticationRoute);
  app.use('/api', authMiddleware, apiRoute);
  app.use('/api/chatrooms', authMiddleware, chatroomsRoute);
  app.use('/api/chats', authMiddleware, chatsRoute);


  return app;
};

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT || 5000;
  try {
    await connect();
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
    socketHandler(server)
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

export default startServer;

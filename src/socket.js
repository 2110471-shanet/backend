import { Server } from 'socket.io';
import socketController from './controller/socketController.js';
import socketMiddleware from './middleware/socketMiddleware.js';

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            // origin: 'http://localhost:3000',
            origin: 'https://chat.shanet.space',
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        },
    });

    io.use(socketMiddleware) ;

    io.on('connection', (socket) => {
        socketController(socket, io);
    });
};
export default socketHandler;

import { Server } from 'socket.io';
import socketController from './controller/socketController.js';
import socketMiddleware from './middleware/socketMiddleware.js';

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://34.87.27.80:3000',
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
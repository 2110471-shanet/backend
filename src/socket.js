import { Server } from 'socket.io';
import socketController from './controller/socketController.js';
import socketMiddleware from './middleware/socketMiddleware.js';

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
            credentials: true,
        
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type']
        },
    });

    io.use(socketMiddleware) ;

    io.on('connection', (socket) => {
        socketController(socket, io);
    });
};
export default socketHandler;
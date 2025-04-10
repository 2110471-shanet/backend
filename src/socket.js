import { Server } from 'socket.io';
import socketController from './controller/socketController.js';

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        },
    });

    io.on('connection', (socket) => {
        socketController(io, socket); // 👈 ส่ง socket และ io เข้า controller
    });
};
export default socketHandler;
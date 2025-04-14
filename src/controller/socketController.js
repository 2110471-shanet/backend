import User from '../model/user.js';   
import Chat from '../model/message.js';
import mongoose from 'mongoose';

const users = {} ;

const socketController = (socket) => {
    console.log(`user is connected ${socket.id}`)
    socket.emit('user-connected', `user is connected with id: ${socket.id}`) ;

    users[socket.id] = true ;

    socket.emit('retrieve-user', users) ;
    socket.broadcast.emit('active', { [socket.id]: true })

    socket.on('ping', () => {
        console.log('pinged') ;
        socket.emit('ack', 'acknowledge') ;

        console.log(users) ;
    });

    socket.on('disconnect', () => {
        console.log('user disconnected') ;
        socket.broadcast.emit('inactive', socket.id) ;
        delete users[socket.id]
    });
}

export default socketController;


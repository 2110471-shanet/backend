import User from '../model/user.js';   
import Chat from '../model/message.js';
import ChatRoom from '../model/chatroom.js';
import mongoose from 'mongoose';
import Message from '../model/message.js';

const socketController = (socket, io) => {
    console.log(`user is connected ${socket.id}`) ;

    // mock fetching
    socket.emit('retrieve-users', socket.users) ;
    socket.emit('retrieve-chatrooms', socket.chatrooms) ;

    // maybe we want to join all rooms in user.chatrooms

    socket.on('send-message', async (message, chatroomId, sendMessageCallback) => {
        if (chatroomId === '')
            socket.broadcast.emit('receive-message', message, socket.user.username) ;
        else
            socket.to(chatroomId).emit('receive-message', message, socket.user.username, chatroomId, (isRead) => {
                // do something with read logic (ask shane ขี้เกียจคิดแล้วว)
            }) ;

        // actually achieves the message
        const newMessage = new Message({
            message: message,
            chatRoomId: chatroomId,
            sender: senderId,
        })

        await newMessage.save() ;
        await ChatRoom.findByIdAndUpdate(chatroomId, {
            lastMessage: newMessage._id,
        });

        // for debugging purposes
        console.log(`the message: ${message} is sent to chatroom: ${chatroomId}`)
        sendMessageCallback(`the message: ${message} is sent to chatroom: ${chatroomId}`) ;
    });

    // maybe we don't even need this
    socket.on('select-chatroom', (previousChatroomId, chatroomId) => {
        // chatroomId can be either userId or chatroomId
        socket.leave(previousChatroomId) ; // maybe we don't need this
        socket.join(chatroomId) ;
    });

    socket.on('join-chatroom', async (chatroomId, joinRoomCallback) => {
        // check if user is already in chatroom
        if (socket.user.chatrooms.some(chatroom => (chatroom.toString() === chatroomId.toString()))) {
            socket.emit('errors', `user ${socket.user.username} is already in chatroom ${chatroomId}`) ;
            return ;
        }

        // maybe we should just socket.join() here
        
        // notify others in room
        io.to(chatroomId).emit('notify-join', `${socket.user.username} has joined the chat`)
        joinRoomCallback(`${socket.user.username} has joined the chat`) ;

        // update user's chatrooms
        await User.findByIdAndUpdate(
            socket.user._id,
            { $push: { chatrooms: chatroomId } },
        );

        // update chatroom's members
        await ChatRoom.findByIdAndUpdate(
            chatroomId,
            { $push: { members: socket.user._id } },
        )
    });

    socket.on('typing', (username, chatroomId) => {
        socket.to(chatroomId).emit('others-typing', username) ;
    });

    // for read
    socket.on('read-message', () => {
        // do something with read logic (ask shane ขี้เกียจคิดแล้วว)
    }) ;

    // for testing
    socket.on('update-user', async (username, updateCallback) => {
        socket.user = await User.findOneAndUpdate(
            { username: username },
            { status: 'online' },
            { new: true }
        );

        if (!socket.user) {
            socket.emit('errors', 'user not found') ;

            return ;
        }

        const connectionInfo = `user is connected with\nsocket id: ${socket.id}\nuser id: ${socket.user._id}` ;
        socket.users  = await User.find({ _id: { $ne: socket.user._id } }).select('_id username status') ;
        
        updateCallback(connectionInfo, socket.users) ;
    });

    socket.on('user-disconnect', async () => {
        console.log('user disconnected') ;
        await User.findOneAndUpdate(
            { _id: socket.user._id },
            { status: 'offline' },
        );
    });

    socket.on('disconnect', async () => {
        console.log(`user disconnected`) ;

        await User.findOneAndUpdate(
            { _id: socket.user._id },
            { status: 'offline' },
        );
    });
}

export default socketController;


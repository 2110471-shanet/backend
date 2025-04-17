import User from '../model/user.js';   
import Chat from '../model/message.js';
import ChatRoom from '../model/chatroom.js';
import mongoose from 'mongoose';
import Message from '../model/message.js';
import DirectMessage from '../model/directmessage.js';

const socketController = (socket, io) => {
    console.log(`user is connected ${socket.user.username}`) ;

    // maybe we want to join all rooms in user.chatrooms
    // socket.users       = await User.find({ _id: { $ne: socket.user._id } }).select('_id username status') ;
    // socket.chatrooms   = await ChatRoom.find().select("chatName") ;
    
    socket.broadcast.emit('active', socket.user, 'online') ;

    socket.on('join-rooms', (rooms) => {
        socket.join(socket.user._id.toString()) ;
        for (const room of rooms) {
            socket.join(room._id) ;
        }
    });

    socket.on('send-direct-message', async (message, chatId, sendMessageCallback) => {
        socket.to(chatId).emit('receive-direct-message', message, socket.user) ;

        // actually achieves the message
        const newMessage = new DirectMessage({
            message: message,
            senderId: socket.user._id,
            receiverId: chatId,
        })

        await newMessage.save() ;
        await ChatRoom.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id,
        });

        // for debugging purposes
        // console.log(`the message: ${message} is sent to chatroom: ${chatId}`)
        sendMessageCallback(`the message: ${message} is sent to chatroom: ${chatId}`) ;
    });

    socket.on('send-message', async (message, chatId, sendMessageCallback) => {
        socket.to(chatId).emit('receive-message', message, socket.user.username, chatId, (isRead) => {
            // do something with read logic (ask shane ขี้เกียจคิดแล้วว)
        }) ;

        // actually achieves the message
        const newMessage = new Message({
            message: message,
            chatRoomId: chatId,
            senderId: socket.user._id,
        })

        await newMessage.save() ;
        await ChatRoom.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id,
        });

        // for debugging purposes
        console.log(`the message: ${message} is sent to chatroom: ${chatroomId}`)
        sendMessageCallback(`the message: ${message} is sent to chatroom: ${chatroomId}`) ;
    });

    // maybe we don't even need this
    socket.on('select-chatroom', (previousChatroomId, chatroomId) => {
        // chatroomId can be either userId or chatroomId
        // socket.leave(previousChatroomId) ;
        socket.join(chatroomId) ;
    });

    socket.on('create-room', async (roomName) => {
        const existedRoom = await ChatRoom.findOne({ chatName: roomName });
        if (existedRoom) {
            socket.emit('errors', `${roomName} is already exists`) ;
            return ;
        }

        const newRoom = ChatRoom({
            chatName: roomName,
            members: [ socket.user._id ],
        });

        await newRoom.save() ;

        io.emit('room-created', newRoom) ;
    });

    socket.on('join-chatroom', async (chatroomId, joinRoomCallback) => {
        // check if user is already in chatroom
        if (socket.user.chatrooms.some(chatroom => (chatroom.toString() === chatroomId.toString()))) {
            socket.emit('errors', `user ${socket.user.username} is already in chatroom ${chatroomId}`) ;
            return ;
        }

        // maybe we should just socket.join() here
        socket.join(chatroomId) ;
        
        // notify others in room
        io.in(chatroomId).emit('user-joined-chatroom', socket.user, chatroomId) ;
        io.to(chatroomId).emit('notify-join', `${socket.user.username} has joined the chat`)
        // joinRoomCallback(`${socket.user.username} has joined the chat`) ;
        joinRoomCallback(true) ;

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
        socket.to(chatroomId).emit('others-typing', username, chatroomId) ;
    });

    // for read
    socket.on('read-message', () => {
        // do something with read logic (ask shane ขี้เกียจคิดแล้วว)
    }) ;

    socket.on('disconnect', async () => {
        console.log(`user disconnected`) ;
        
        socket.broadcast.emit('active', socket.user, 'offline') ;

        await User.findOneAndUpdate(
            { _id: socket.user._id },
            { status: 'offline' },
        );
    });
}

export default socketController;


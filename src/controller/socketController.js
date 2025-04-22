import User from '../model/user.js';   
import Chat from '../model/message.js';
import ChatRoom from '../model/chatroom.js';
import mongoose from 'mongoose';
import Message from '../model/message.js';
import DirectMessage from '../model/directmessage.js';
import DirectReadStatus from '../model/directreadstatus.js';
import ChatRoomReadStatus from '../model/chatroomreadstatus.js';

const socketController = async (socket, io) => {
    try {
        console.log(`user is connected ${socket.user.username}`) ;
    
        socket.broadcast.emit('active', socket.user, 'online') ;
        
        socket.on('join-rooms', () => {
            socket.join(socket.user._id.toString()) ;
            for (const room of socket.user.chatrooms) {
                socket.join(room._id.toString()) ;
            }
        });
        
        socket.on('send-direct-message', async (message, chatId, sendMessageCallback) => {
            const userId = socket.user._id;
            
            // actually achieves the message
            const newDirectMessage = new DirectMessage({
                message: message,
                senderId: userId,
                receiverId: chatId,
            })
            
            await newDirectMessage.save() ;
            await ChatRoom.findByIdAndUpdate(chatId, {
                lastMessage: newDirectMessage._id,
            });

            await DirectReadStatus.updateOne(
                { receiverId: chatId, senderId: userId },
                { $inc: { unreadCount: 1 } },
                { upsert: true },
            );
    
            io.to(userId.toString()).emit('receive-direct-message', newDirectMessage, socket.user) ;
            socket.to(chatId).emit('receive-direct-message', newDirectMessage, socket.user) ;
            
            // for debugging purposes
            sendMessageCallback(`the message: ${message} is sent to user: ${chatId}`) ;
        });
        
        socket.on('send-message', async (message, chatId, sendMessageCallback) => {
            const userId = socket.user._id;
            
            // actually achieves the message
            const newMessage = new Message({
                message: message,
                chatRoomId: chatId,
                senderId: userId,
            })
            
            await newMessage.save() ;
            await ChatRoom.findByIdAndUpdate(chatId, {
                lastMessage: newMessage._id,
            });
    
            const chatRoom = await ChatRoom.findById(chatId).lean();
    
            if (!chatRoom) throw new Error('Chat room not found');
    
            const otherMembers = chatRoom.members.filter(
                (memberId) => memberId.toString() !== userId.toString()
            );
    
            for (const memberId of otherMembers) {
                await ChatRoomReadStatus.updateOne(
                    { chatRoomId: chatId, userId: memberId },
                    { $inc: { unreadCount: 1 } },
                    { upsert: true },
                );
            }
    
            io.to(socket.user._id.toString()).emit('receive-message', newMessage, socket.user, async () => {});
            socket.to(chatId).emit('receive-message', newMessage, socket.user);
            
            // for debugging purposes
            sendMessageCallback(`the message: ${message} is sent to chatroom: ${chatId}`) ;
        });
        
        socket.on('create-room', async (roomName) => {
            const existingRoom = await ChatRoom.findOne({ chatName: roomName });
            if (existingRoom) {
                socket.emit('errors', `${roomName} is already exists`) ;
                return ;
            }
            
            const newRoom = ChatRoom({
                chatName: roomName,
                members: [ socket.user._id ],
            });
            
            await newRoom.save() ;

            await User.findByIdAndUpdate(
                socket.user._id,
                { $push: { chatrooms: newRoom._id } },
            );
            
            socket.join(newRoom._id.toString());
            
            const populatedRoom = {
                _id: newRoom._id,
                chatName: newRoom.chatName,
                lastMessage: null,
                members: [{
                    _id: socket.user._id,
                    username: socket.user.username,
                    status: socket.user.status,
                    unreadCount: 0,
                }],
            }

            io.emit('room-created', populatedRoom) ;
        });
        
        socket.on('join-chatroom', async (chatroomId) => {
            // check if user is already in chatroom
            if (socket.user.chatrooms.some(chatroom => (chatroom.toString() === chatroomId.toString()))) {
                socket.emit('errors', `user ${socket.user.username} is already in chatroom ${chatroomId}`) ;
                return ;
            }

            // maybe we should just socket.join() here
            socket.join(chatroomId) ;
            
            // notify others in room
            io.to(chatroomId).emit('user-joined-chatroom', socket.user, chatroomId) ;
            
            // update user's chatrooms
            await User.findByIdAndUpdate(
                socket.user._id,
                { $push: { chatrooms: chatroomId } },
            );
            
            // update chatroom's members
            await ChatRoom.findByIdAndUpdate(
                chatroomId,
                { $push: { members: socket.user } },
            )
        });
    
        socket.on('change-username', async (newUsername) => {
            const existingUser = await User.findOne({ username: newUsername });
            if (existingUser) {
                socket.emit('errors', `username ${newUsername} already existed`);
                return;
            }
    
            const updatedUser = await User.findByIdAndUpdate(
                socket.user._id,
                { username: newUsername }
            );
            if (!updatedUser) {
                socket.emit('errors', 'error trying to change username');
                return;
            }
    
            io.emit('username-changed', socket.user._id, newUsername);
        });
        
        socket.on('typing', (username, chatId) => {
            socket.to(chatId).emit('others-typing', username, socket.user._id, chatId) ;
        });
        
        socket.on('stop-typing', (username, chatId) => {
            socket.to(chatId).emit('others-stop-typing', username) ;
        });
    
        socket.on('read-direct-message', async (receiverId, senderId) => {
            const userId = socket.user._id
    
            const latestDirectMessage = await DirectMessage.findOne({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ]
                })
                .sort({ createdAt: -1 })
                .limit(1)
                .lean();
    
            await DirectReadStatus.findOneAndUpdate(
                { receiverId: receiverId, senderId: senderId },
                {
                    lastReadMessageId: latestDirectMessage ? latestDirectMessage._id : null,
                    unreadCount: 0
                },
            );
    
            io.to(userId.toString()).emit('direct-message-read', senderId); // who is being read
        }) ;
        
        socket.on('read-message', async (chatId) => {
            const userId = socket.user._id
    
            const latestMessage = await Message.findOne({ chatRoomId: chatId })
                .sort({ createdAt: -1 })
                .limit(1)
                .lean();
    
            await ChatRoomReadStatus.findOneAndUpdate(
                { chatRoomId: chatId, userId: userId },
                {
                  lastReadMessageId: latestMessage ? latestMessage._id : null,
                  unreadCount: 0
                },
            );
    
            io.to(userId.toString()).emit('message-read', chatId.toString()); // who is being read
        }) ;
    
        socket.on('signed-out', (userId) => {
            socket.to(userId).emit('on-signed-out');
        });
        
        socket.on('disconnect', async () => {
            console.log(`user disconnected`);
            
            const sockets = await io.fetchSockets();
            let connectionCount = 0;
            sockets.map(socketConnection => {
                if (socketConnection.user._id.toString() === socket.user._id.toString()) {
                    connectionCount += 1;
                }
            });
    
            socket.emit('others-stop-typing', socket.user.username);
    
            if (connectionCount > 0) {
                return;
            }
    
            socket.broadcast.emit('active', socket.user, 'offline');
            
            await User.findOneAndUpdate(
                { _id: socket.user._id },
                { status: 'offline' },
            );
        });
    } catch (err) {
        console.log(err);
    }
}

export default socketController;


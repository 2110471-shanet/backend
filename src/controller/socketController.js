import User from '../model/user.js';   
import Chat from '../model/message.js';
import mongoose from 'mongoose';

const socketController = (socket, io) => {
socket.on('join', async ({ username }) => {
    try {
        const user = await User.findOneAndUpdate(
            { username },
            { isActive: true },
            { new: true }
        ).populate('chats');

        if (!user) return;

        // Join all chat room topics
        for (const chatId of user.chats) {
            const chat = await Chat.findById(chatId).populate('chatRoomId');
            if (chat?.chatRoomId?._id) {
                const room = chat.chatRoomId._id.toString();
                socket.join(room);
            }
        }

        console.log(`${username} joined rooms.`);
    } catch (err) {
        console.error('Join error:', err);
    }
});

socket.on('typing', ({ username, chatRoomId }) => {
    socket.to(chatRoomId).emit('typing', { username });
});

socket.on('send', async ({ username, chatRoomId, message, type = 'text' }) => {
    try {
        const newMessage = await Chat.create({
            sender: username,
            message,
            type,
            chatRoomId
        });

        io.to(chatRoomId).emit('receive', {
            sender: username,
            message,
            type,
            chatRoomId,
            createdAt: newMessage.createdAt
        });

    } catch (err) {
        console.error('Send error:', err);
    }
});

socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);

    for (const username in userSockets) {
        if (userSockets[username] === socket.id) {
            await User.findOneAndUpdate(
                { username },
                { isActive: false }
            );
            delete userSockets[username];
            console.log(`${username} disconnected and left all rooms.`);
        }
    }
});

socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
});
}
export default socketController;


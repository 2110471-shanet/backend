import Message from '../model/message.js';
import ChatRoom from '../model/chatroom.js';

const createMessage = async (req, res) => {
    try {
        const { type = 'text', message, chatRoomId } = req.body;
        const sender = req.user.id;

        if (!message || !chatRoomId) {
            return res.status(400).json({ error: 'Message and chatRoomId are required.' });
        }

        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found.' });
        }

        const newMessage = await Message.create({
            type,
            message,
            chatRoomId,
            sender
        });

        return res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create message.' });
    }
};

const updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, type } = req.body;
        const userId = req.user.id;

        const existingMessage = await Message.findById(id);
        if (!existingMessage) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        if (existingMessage.sender.toString() !== userId) {
            return res.status(403).json({ error: 'You can only update your own messages.' });
        }

        existingMessage.message = message || existingMessage.message;
        existingMessage.type = type || existingMessage.type;

        await existingMessage.save();

        return res.status(200).json(existingMessage);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update message.' });
    }
};


const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        if (message.sender.toString() !== userId) {
            return res.status(403).json({ error: 'You can only delete your own messages.' });
        }

        await message.deleteOne();

        return res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete message.' });
    }
};


export {createMessage, updateMessage, deleteMessage}
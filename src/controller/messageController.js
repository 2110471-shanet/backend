import Message from '../model/message.js';
import ChatRoom from '../model/chatroom.js';
import DirectMessage from '../model/directmessage.js';

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

const getDirectMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const anotherUserId = req.params.anotherUserId; // Make sure this is set by middleware or passed in route

    if (!anotherUserId) {
      return res.status(400).json({ error: 'anotherUserId is required' });
    }

    const messages = await DirectMessage.find({
      $or: [
        { senderId: currentUserId, receiverId: anotherUserId },
        { senderId: anotherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 }) // Sort messages oldest to newest
      .populate('senderId', 'username _id')
      .populate('receiverId', 'username _id');

      const renamedMessages = messages.map(msg => ({
        _id: msg._id,
        message: msg.message,
        sender: msg.senderId,       // renamed
        receiver: msg.receiverId,   // renamed
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }));
  
    return res.status(200).json(renamedMessages);
  } catch (err) {
    console.error('Fetch direct messages error:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};


const getGroupMessages = async (req, res) => {
    try {
      const currentUserId = req.user._id.toString();
      const chatRoomId = req.params.chatRoomId;
  
      if (!chatRoomId) {
        return res.status(400).json({ error: 'chatRoomId is required' });
      }
  
      const messages = await Message.find({ chatRoomId })
        .sort({ createdAt: 1 }) // optional: sort by time
        .populate('senderId', 'username _id'); // show sender info
  
      // Rename senderId to sender
      const formattedMessages = messages.map(msg => ({
        _id: msg._id,
        message: msg.message,
        sender: msg.senderId, // populated user info
        chatRoomId: msg.chatRoomId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }));
  
      return res.status(200).json(formattedMessages);
    } catch (err) {
      console.error('Fetch group messages error:', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  };  


export {createMessage, updateMessage, deleteMessage, getDirectMessages, getGroupMessages}
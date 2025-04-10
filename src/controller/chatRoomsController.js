import User from "../model/user.js";
import ChatRoom from "../model/chatroom.js";

const getChatRooms = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get the user and their chatroom IDs
        const user = await User.findById(userId).select('chats');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // 2. Find the full ChatRoom objects by IDs
        const chatRooms = await ChatRoom.find({
            _id: { $in: user.chats }
        });

        return res.status(200).json(chatRooms);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch chat rooms.' });
    }
};


const createChatRooms = async (req, res) => {
    try {
        const { userIds } = req.body;
        const currentUserId = req.user.id;

        if (Array.isArray(userIds) && userIds.length === 1) {
            const otherUserId = userIds[0];
            const members = [currentUserId, otherUserId].sort();
            const chatName = userIds.length == 1 ? `${members[0]}_${members[1]}` : req.user.chatName;

            const existingRoom = await ChatRoom.findOne({ chatName });
            if (existingRoom) {
                return res.status(400).json({ error: 'Direct chat already exists.' });
            }

            const newRoom = await ChatRoom.create({
                chatName,
                members,
                numMembers: members.length
            });

            // Add the new chat room to both users
            await User.updateMany(
                { _id: { $in: members } },
                { $push: { chats: newRoom._id } }
            );

            return res.status(201).json(newRoom);
        }

        // Group chat creation
        if (!userIds || userIds.length > 1) {
            const members = [currentUserId, ...(userIds || [])];
            const chatName = req.body.chatName || `Group_${Date.now()}`;

            const newRoom = await ChatRoom.create({
                chatName,
                members,
                numMembers: members.length
            });

            await User.updateMany(
                { _id: { $in: members } },
                { $push: { chats: newRoom._id } }
            );

            return res.status(201).json(newRoom);
        }

        return res.status(400).json({ error: 'Invalid request format.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error creating chat room.' });
    }
};


const getChatRoom = async (req, res) => {

}

const updateChatRoom = async (req, res) => {

}

const deleteChatRoom = async (req, res) => {

}

export { getChatRooms, createChatRooms, getChatRoom, updateChatRoom, deleteChatRoom}
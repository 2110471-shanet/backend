import User from "../model/user.js";
import ChatRoom from "../model/chatroom.js";
import Message from "../model/message.js";
import ChatRoomReadStatus from "../model/chatroomreadstatus.js";

const getAllChatRooms = async (req, res) => {
  try {

    const userId = req.user._id;

    const chatrooms = await ChatRoom.find()
      .select('chatName members lastMessage')
      .populate([
        {
          path: 'members',
          select: 'username _id status',
        },
        {
          path: 'lastMessage',
          select: 'message createdAt senderId',
          populate: {
            path: 'senderId',
            select: 'username _id'
          }
        }
      ]);

    const readStatuses = await ChatRoomReadStatus.find({ userId: userId }).lean();

    const enrichedChatrooms = chatrooms.map(chatroom => {
      const unreadCount = readStatuses.find(status => {
        return status.chatRoomId.toString() === chatroom._id.toString();
      });

      return {
        ...chatroom.toObject(), 
        unreadCount: unreadCount ? unreadCount.unreadCount : 0,
      }
    });

    res.status(200).json(enrichedChatrooms);
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
        numMembers: members.length,
        isDirectChat: false
      });

      // Add the new chat room to both users
      await User.updateMany(
        { _id: { $in: members } },
        { $push: { chatrooms: newRoom._id } }
      );

      return res.status(201).json(newRoom);
    }

    // Group chat creation
    if (!userIds || userIds.length > 1) {
      const members = [...new Set([currentUserId, ...(userIds || [])])];
      const chatName = req.body.chatName || `Group_${Date.now()}`;

      const newRoom = await ChatRoom.create({
        chatName,
        members,
        numMembers: members.length,
        isDirectChat: true
      });

      await User.updateMany(
        { _id: { $in: members } },
        { $push: { chatrooms: newRoom._id } }
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
  try {
    const { id } = req.params;

    // Optionally verify ChatRoom exists
    const chatRoom = await ChatRoom.findById(id);
    if (!chatRoom) return res.status(404).json({ error: 'Chat room not found' });

    const messages = await Message.find({ chatRoomId: id }).populate('sender', 'username');

    return res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const updateChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { addMembers = [], removeMembers = [] } = req.body;

    const chatRoom = await ChatRoom.findById(id);
    if (!chatRoom) return res.status(404).json({ error: 'Chat room not found' });

    // Add members (only if not already in the room)
    addMembers.forEach((memberId) => {
      if (!chatRoom.members.includes(memberId)) {
        chatRoom.members.push(memberId);
      }
    });

    // Remove members
    chatRoom.members = chatRoom.members.filter(
      (memberId) => !removeMembers.includes(memberId.toString())
    );

    await chatRoom.save();

    return res.status(200).json({ message: 'Chat room updated', chatRoom });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update chat room' });
  }
};


const deleteChatRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const chatRoom = await ChatRoom.findById(id);
    if (!chatRoom) return res.status(404).json({ error: 'Chat room not found' });

    // Delete all messages associated with this chatRoom
    await Message.deleteMany({ chatRoomId: id });

    // Delete the chat room
    await ChatRoom.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Chat room and messages deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete chat room' });
  }
};


export { createChatRooms, getChatRoom, updateChatRoom, deleteChatRoom, getAllChatRooms }
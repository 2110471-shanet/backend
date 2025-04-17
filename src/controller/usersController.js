import User from "../model/user.js";
import ChatRoom from "../model/chatroom.js";
import ChatRoomReadStatus from "../model/chatroomreadstatus.js";

const getUsers = async (req, res) => {
    try {
      const currentUserId = req.user._id;
  
      // 1. Get all users except current
      const users = await User.find({ _id: { $ne: currentUserId } }).select('_id username status');
  
      // 2. Find all direct chatrooms (between current user and someone else)
      const directChatrooms = await ChatRoom.find({
        isDirectChat: true,
        members: currentUserId
      }).select('_id members');
  
      // 3. Map userId -> chatroomId (one per other user)
      const userChatroomMap = new Map();
  
      for (const room of directChatrooms) {
        const otherMember = room.members.find(
          member => member.toString() !== currentUserId.toString()
        );
        if (otherMember) {
          userChatroomMap.set(otherMember.toString(), room._id.toString());
        }
      }
  
      // 4. Find read statuses for current user in all relevant rooms
      const readStatuses = await ChatRoomReadStatus.find({
        userId: currentUserId,
        chatRoomId: { $in: Array.from(userChatroomMap.values()) }
      }).select('chatRoomId unreadCount');
  
      // 5. Map chatRoomId -> unreadCount
      const unreadMap = new Map();
      readStatuses.forEach(status => {
        unreadMap.set(status.chatRoomId.toString(), status.unreadCount);
      });
  
      // 6. Add unreadCount to users
      const enrichedUsers = users.map(user => {
        const chatroomId = userChatroomMap.get(user._id.toString());
        const unreadCount = unreadMap.get(chatroomId) || 0;
  
        return {
          ...user.toObject(),
          unreadCount
        };
      });
  
      return res.status(200).json(enrichedUsers);
    } catch (err) {
      console.error('Get users error:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  

export { getUsers }
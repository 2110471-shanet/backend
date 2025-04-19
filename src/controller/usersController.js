import User from "../model/user.js";
import ChatRoom from "../model/chatroom.js";
import ChatRoomReadStatus from "../model/chatroomreadstatus.js";
import DirectMessage from "../model/directmessage.js";
import DirectReadStatus from "../model/directreadstatus.js";

const getUsers = async (req, res) => {
    try {
      const currentUserId = req.user._id;
      
      const users = await User.find({ _id: { $ne: currentUserId } }).select('_id username status');

      const readStatuses = await DirectReadStatus.find({ userId: currentUserId });

      // const usersWithLatestMessage = await Promise.all(
      //   users.map(async (user) => {
      //     const latestMessage = await DirectMessage.findOne({
      //       $or: [
      //         { senderId: currentUserId, receiverId: user._id },
      //         { senderId: user._id, receiverId: currentUserId },
      //       ]
      //     })
      //     .sort({ createdAt: -1 })
      //     .limit(1)
      //     .lean();

      //     return latestMessage ? {
      //       ...user.toObject(), 
      //       lastMessage: {
      //         message: latestMessage.message,
      //         isMe: (latestMessage.senderId.toString() === currentUserId.toString()), // is currentUser a sender
      //         createdAt: latestMessage.createdAt,
      //       },
      //     } : user.toObject() ;
      //   })
      // );

      // console.log(usersWithLatestMessage);
  
      // for (const room of directChatrooms) {
      //   const otherMember = room.members.find(
      //     member => member.toString() !== currentUserId.toString()
      //   );
      //   if (otherMember) {
      //     userChatroomMap.set(otherMember.toString(), room._id.toString());
      //   }
      // }
  
      // // 4. Find read statuses for current user in all relevant rooms
      // const readStatuses = await ChatRoomReadStatus.find({
      //   userId: currentUserId,
      //   chatRoomId: { $in: Array.from(userChatroomMap.values()) }
      // }).select('chatRoomId unreadCount');
  
      // 5. Map chatRoomId -> unreadCount
      // const unreadMap = new Map();
      // readStatuses.forEach(status => {
      //   unreadMap.set(status.chatRoomId.toString(), status.unreadCount);
      // });
  
      // 6. Add unreadCount to users
      
      console.log(readStatuses);

      const enrichedUsers = users.map(user => {
        const status = readStatuses.find(status => {
          console.log(status);
          return status.anotherUserId.toString() === user._id.toString()
        });
        // console.log(status);
        const unreadCount = status ? status.unreadCount : 0;
  
        return {
          ...user.toObject(),
          unreadCount,
        };
      });

      console.log(enrichedUsers)
  
      return res.status(200).json(enrichedUsers);
    } catch (err) {
      console.error('Get users error:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  

export { getUsers }
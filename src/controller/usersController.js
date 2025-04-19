import User from "../model/user.js";
import ChatRoom from "../model/chatroom.js";
import ChatRoomReadStatus from "../model/chatroomreadstatus.js";
import DirectReadStatus from "../model/directreadstatus.js";

const getUsers = async (req, res) => {
    try {
      const currentUserId = req.user._id;

      const users = await User.find({ _id: { $ne: currentUserId } }).select('_id username status');

      const readStatuses = await DirectReadStatus.find({userId: currentUserId});

      // console.log(readStatuses)
      
      const enrichedUsers = users.map(user => {
        const unreadCount = readStatuses.map(status => {
          return status.anotherUserId.toString() === user._id.toString() ? status.unreadCount : 0;
        });

        return {
          ...user.toObject(),
          unreadCount: unreadCount[0],
        };
      });

      // console.log(enrichedUsers)

      return res.status(200).json(enrichedUsers);
    } catch (err) {
      console.error('Get users error:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  

export { getUsers }
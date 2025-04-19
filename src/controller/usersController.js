import User from "../model/user.js";
import DirectReadStatus from "../model/directreadstatus.js";
import DirectMessage from "../model/directmessage.js";

const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const users = await User.find({ _id: { $ne: currentUserId } }).select('_id username status');

    const readStatuses = await DirectReadStatus.find({receiverId: currentUserId});

    const latestDirectMessages = [];

    for (const user of users) {
      const latestDirectMessage = await DirectMessage.findOne({
        $or: [
          { senderId: currentUserId, receiverId: user._id },
          { senderId: user._id, receiverId: currentUserId },
        ]
      }).sort({ createdAt: -1 });

      latestDirectMessages.push(latestDirectMessage);
    }
    
    const enrichedUsers = users.map(user => {
      const unreadCount = readStatuses.find(status => {
        return status.senderId.toString() === user._id.toString() ? status.unreadCount : 0;
      });

      return {
        ...user.toObject(),
        unreadCount: unreadCount ? unreadCount.unreadCount : 0,
      };
    });

    return res.status(200).json({
      users: enrichedUsers,
      lastDirectMessages: latestDirectMessages,
    });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};
  

export { getUsers }
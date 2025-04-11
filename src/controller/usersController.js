import User from "../model/user.js";

const getUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id; // assuming req.user is set by auth middleware

        const users = await User.find({ _id: { $ne: currentUserId } }).select('id username');
        
        return res.status(200).json(users);
    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
}

export { getUsers }
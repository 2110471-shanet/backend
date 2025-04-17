import User from "../model/user.js";

const updateUser = async (req, res) => {
    try {
        const user = req.user; // assuming user is authenticated and `req.user` is set by middleware
        const newUsername = req.body.username;

        if (!newUsername) {
            return res.status(400).json({ error: 'New username is required.' });
        }

        user.username = newUsername;
        const updatedUser = await user.save();

        res.status(200).json({ message: 'Username updated successfully.', user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password -createdAt -updatedAt');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User fetched successfully.', user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export {updateUser, getUser};
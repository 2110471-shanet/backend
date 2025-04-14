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

export default updateUser;
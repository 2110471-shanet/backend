import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import Chat from '../model/chat.js';

const JWT_SECRET = process.env.JWT_SECRET;

const getUser = async (req, res) => {
    try{
        const user = req.user;
        return res.status(200).json({ username: user.username, chatToken: user.chatToken })
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error'})
    }
}

export { getUser }
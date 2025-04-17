// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import { logout } from '../controller/authenticationController.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if the user exists in the database
        const user = await User.findById(decoded.id).select('id username');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User does not exist' });
        }

        // Attach user information to the request object
        req.user = user;
        next(); // Move to the next middleware or route handler
    } catch (err) {
        // Handle token verification or database errors
        await logout(req, res);
    }
};


export default authMiddleware;
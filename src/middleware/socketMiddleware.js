import jwt from 'jsonwebtoken';
import User from "../model/user.js"

const decodeCookie = (rawCookie, cookieName) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const cookies = Object.fromEntries(
            rawCookie?.split('; ').map(cookie => cookie.split('=')) || []
        );

        const cookie = cookies[cookieName] ;
        if (!cookie)
            return null ;

        const decodedCookie = jwt.verify(cookie, JWT_SECRET);
        if (!decodedCookie)
            return null ;
        
        return decodedCookie ;
    } catch (err) {
        console.log(`error trying to decode cookie`);
        return null;
    }
}

const socketMiddleware = async (socket, next) => {
    try {
        const decodedCookie = decodeCookie(socket.handshake.headers.cookie, 'token') ;
        if (!decodedCookie) {
            return next(new Error('Cookie not found')) ;
        }
    
        const user = await User.findByIdAndUpdate(
            decodedCookie.id,
            { status: 'online' },
            { new: true },
        ).select('_id username status chatrooms');
    
        if (!user)
            return next(new Error('User not found')) ;
    
        socket.user = user;
    
        next();
    } catch (err) {
        console.error('Socket middleware error:', err);
        return next(new Error('Internal server error'));
        
    }
}

export default socketMiddleware ;
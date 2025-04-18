import { getUsers } from "../controller/usersController.js" ;
import ChatRoom from "../model/chatroom.js";
import jwt from 'jsonwebtoken';
import User from "../model/user.js"

const JWT_SECRET = process.env.JWT_SECRET;

const decodeCookie = (rawCookie, cookieName) => {
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
}

const socketMiddleware = async (socket, next) => {
    const decodedCookie = decodeCookie(socket.handshake.headers.cookie, 'token') ;
    if (!decodedCookie)
        next(new Error('Cookie not found')) ;

    const user = await User.findByIdAndUpdate(
        decodedCookie.id,
        { status: 'online' },
        { new: true },
    ).select('_id username status chatrooms');

    if (!user)
        next(new Error('User not found')) ;

    socket.user = user;

    // console.log(socket.user) ;

    next();

    // if (!user)
    //     next(new Error("User not found")) ;

    // socket.user        = user ;
    // socket.users       = await User.find({ _id: { $ne: socket.user._id } }).select('_id username status') ;
    // socket.chatrooms   = await ChatRoom.find().select("chatName") ;
    // socket.activeUsers = await User.find({ _id: { $ne: socket.user._id }, status: 'online' }).select('_id username') ;
}

export default socketMiddleware ;
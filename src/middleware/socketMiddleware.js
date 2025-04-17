import { getUsers } from "../controller/usersController.js" ;
import ChatRoom from "../model/chatroom.js";
import User from "../model/user.js"

const socketMiddleware = async (socket, next) => {
    if (socket.handshake.auth.token) {
        const user = await User.findOneAndUpdate(
            { username: socket.handshake.auth.token },
            { status: 'online' },
            { new: true }
        );

        console.log(user) ;

        if (!user)
            next(new Error("User not found")) ;

        socket.user        = user ;
        socket.users       = await User.find({ _id: { $ne: socket.user._id } }).select('_id username status') ;
        socket.chatrooms   = await ChatRoom.find().select("chatName") ;
        socket.activeUsers = await User.find({ _id: { $ne: socket.user._id }, status: 'online' }).select('_id username') ;

        next() ;
    } else {
        next(new Error("Please send Token")) ;
    }

}

export default socketMiddleware ;
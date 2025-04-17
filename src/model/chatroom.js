import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
    chatName: {
        type: String,
        required: true,
        unique: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    numMembers: {
        type: Number,
        required: true,
    },
    isDirectChat: {
        type: Boolean,
        required: true,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    }
}, {
    timestamps: true
});

// Automatically update numMembers based on members array
chatRoomSchema.pre('save', function (next) {
    this.numMembers = this.members.length;
    next();
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;

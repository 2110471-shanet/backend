import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
    chatName: {
        required: true,
        type: String,
        unique: true,
    },
    members: {
        type: [String],
        required: true
    },
    numMembers: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Optional: Automatically update numMembers based on members array
chatRoomSchema.pre('save', function (next) {
    this.numMembers = this.members.length;
    next();
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;

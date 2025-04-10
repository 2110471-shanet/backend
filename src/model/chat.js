import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image'], // add more types if needed
        default: 'text'
    },
    message: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    sender: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

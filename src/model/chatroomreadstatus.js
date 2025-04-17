import mongoose from 'mongoose';

const chatRoomReadStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
    index: true,
  },
  lastReadMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  unreadCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Ensure one record per user per chatRoom
readStatusSchema.index({ userId: 1, chatRoomId: 1 }, { unique: true });

const ChatRoomReadStatus = mongoose.model('ChatRoomReadStatus', chatRoomReadStatusSchema);

export default ChatRoomReadStatus;
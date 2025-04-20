import mongoose from 'mongoose';

const directReadStatusSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  lastReadMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessage',
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
directReadStatusSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const DirectReadStatus = mongoose.model('DirectReadStatus', directReadStatusSchema);

export default DirectReadStatus;
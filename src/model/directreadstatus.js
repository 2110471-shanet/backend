import mongoose from 'mongoose';

const directReadStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  anotherUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
readStatusSchema.index({ userId: 1, anotherUserId: 1 }, { unique: true });

const DirectReadStatus = mongoose.model('DirectReadStatus', directReadStatusSchema);

export default DirectReadStatus;
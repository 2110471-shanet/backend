import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;

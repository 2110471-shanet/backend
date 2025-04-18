import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);

export default DirectMessage;

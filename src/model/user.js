import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true,
    },
    password: {
        required: true,
        type: String,
    },
    chatrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
    }],
    status: {
        type: String,
        enum: ['online', 'offline'], // ✅ restrict to these two
        default: 'offline', // optional default
        required: true,
    }
}, {
    timestamps: true,
})

const User = mongoose.model("User", userSchema)

export default User ;
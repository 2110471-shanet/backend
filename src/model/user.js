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
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
    }],
}, {
    timestamps: true,
})

const User = mongoose.model("users", userSchema)

export default User
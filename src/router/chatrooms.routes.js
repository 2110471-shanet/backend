import express from "express";
import { getChatRooms, createChatRooms, getChatRoom, updateChatRoom, deleteChatRoom } from "../controller/chatRoomsController.js";
const router = express.Router()

router.get('/', getChatRooms)
router.post('/', createChatRooms)
// router.get('/chatrooms/:id',)
// router.put('/chatrooms/:id',)
// router.delete('/chatrooms/:id',)

export default router;
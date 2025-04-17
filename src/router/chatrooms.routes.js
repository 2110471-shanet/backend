import express from "express";
import { getChatRooms, createChatRooms, getChatRoom, updateChatRoom, deleteChatRoom, getAllChatRooms } from "../controller/chatRoomsController.js";
const router = express.Router()

router.get('/', getChatRooms)
router.get('/all', getAllChatRooms)
router.post('/', createChatRooms)
router.get('/:id', getChatRoom)
router.put('/:id', updateChatRoom)
router.delete('/:id', deleteChatRoom)

export default router;
import express from "express";
import {createMessage, updateMessage, deleteMessage, getDirectMessages} from "../controller/messageController.js"
const router = express.Router()

router.post('/', createMessage)
router.put('/:id', updateMessage)
router.delete('/:id', deleteMessage)
router.get('/directmessages/:anotherUserId', getDirectMessages)

export default router;
import express from "express";
import authMiddleware from "../authMiddleware.js";
import { sayHello } from "../controller/helloController.js";
import { getUser } from "../controller/userController.js"
const router = express.Router()

router.get('/hello', authMiddleware, sayHello)
router.get('/user', authMiddleware, getUser)

export default router;
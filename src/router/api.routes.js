import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { sayHello } from "../controller/helloController.js";
const router = express.Router()

router.get('/hello', sayHello)

export default router;
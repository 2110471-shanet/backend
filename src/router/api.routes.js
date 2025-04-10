import express from "express";
import authMiddleware from "../authMiddleware.js";
import { sayHello } from "../controller/helloController.js";
const router = express.Router()

router.get('/hello', sayHello)

export default router;
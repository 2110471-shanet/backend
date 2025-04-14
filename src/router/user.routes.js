import express from "express";
import updateUser from "../controller/userController.js";
const router = express.Router();

router.put('/', updateUser)

export default router;
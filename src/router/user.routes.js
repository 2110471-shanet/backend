import express from "express";
import {updateUser, getUser} from "../controller/userController.js";
const router = express.Router();

router.put('/', updateUser)
router.get('/', getUser)

export default router;
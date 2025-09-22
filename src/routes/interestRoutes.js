import express from 'express'
import { interest } from '../controllers/interestController.js';
import { authUser } from '../middleware/authMiddleware.js';
import {upload} from '../middleware/multerMiddleware.js'



const router = express.Router();


router.post("/", authUser, upload.single("image"), interest)

export default router
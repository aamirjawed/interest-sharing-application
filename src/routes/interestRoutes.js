import express from 'express'
import { addInterest, deleteInterest, editInterest, getAllInterest, getInterestById } from '../controllers/interestController.js';
import { authUser } from '../middleware/authMiddleware.js';
import {upload} from '../middleware/multerMiddleware.js'



const router = express.Router();


router.post("/", authUser, upload.single("image"), addInterest)
router.get('/', authUser, getAllInterest)
router.get('/:interestId', authUser, getInterestById)
router.put("/:interestId", authUser, upload.single("image"), editInterest)
router.delete('/:interestId', authUser, deleteInterest)


export default router
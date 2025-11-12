import express from 'express'
import { addInterest, deleteInterest, editInterest, getAllInterest, getAllUsersInterest, getInterestById, getNearByInterest, getInterestsByUserId } from '../controllers/interestController.js';
import { authUser } from '../middleware/authMiddleware.js';
import {upload} from '../middleware/multerMiddleware.js'



const router = express.Router();


router.post("/", authUser, upload.single("image"), addInterest)
router.get('/', authUser, getAllInterest)
router.get('/all', authUser, getAllUsersInterest)
router.get('/user/:userId', authUser, getInterestsByUserId)
router.get('/nearby', authUser, getNearByInterest)
router.get('/:interestId', authUser, getInterestById)
router.put("/:interestId", authUser, upload.single("image"), editInterest)
router.delete('/:interestId', authUser, deleteInterest)



export default router
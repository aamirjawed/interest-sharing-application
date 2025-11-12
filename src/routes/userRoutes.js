import express from 'express'
import { authUser } from '../middleware/authMiddleware.js'
import { updateUserProfile, getUserProfile } from '../controllers/userController.js'

const router = express.Router()

router.put('/me', authUser, updateUserProfile)
router.get('/:userId', authUser, getUserProfile)

export default router


import express from 'express'
import { authUser } from '../middleware/authMiddleware.js'
import { updateUserProfile } from '../controllers/userController.js'

const router = express.Router()

router.put('/me', authUser, updateUserProfile)

export default router


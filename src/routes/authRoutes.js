import express from 'express'
import  {registerUser, loginUser, updateUserLocation, CurrentUser } from '../controllers/authController.js';
import { authUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put("/location", authUser, updateUserLocation);
router.get('/me', authUser, CurrentUser)


export default router
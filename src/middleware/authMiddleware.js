import jwt from 'jsonwebtoken'
import {User} from '../models/userModel.js'

export const authUser = async (req, res, next) => {
    try {
        
        const {token}  = req.cookies

        if(!token){
            res.clearCookie('token')
            return res.status(401).json({
                success:false,
                message:"Please login",
                error:"Token not found"
            })
        }

        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET)

        const {id} = decodedMessage

        const user = await User.findById(id)

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            })
        }

        req.userId = user._id

        next()
    } catch (error) {
        console.log("Error in auth middleware", error.message)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}
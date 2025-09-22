import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database is connected")
    } catch (error) {
        console.log("Error in index.js in db", error)
        process.exit(1)
    }
    
}

export default connectDB
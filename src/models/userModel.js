import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "User name is required"],
        unique: true,
        lowercase: true,
        index:true,
        minlength: [4, "User name should have at least 4 characters"],
        maxlength: [12, "User name should not be greater than 12 characters"]
    },
    fullName: {
        type: String,
        required: [true, "Full Name is required" ],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
   
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    DOB:{
        type:Date,
        required:[true, "Date of Birth is required"]
    },
    
}, { timestamps: true });




userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.comparePassword = async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password)
}


export const User = mongoose.model("User", userSchema);

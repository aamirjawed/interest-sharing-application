import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// console.log("Cloud Name:", process.env.CLOUD_NAME);
// console.log("API Key:", process.env.CLOUDINARY_API_KEY);
// console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: "interest"
        })

        console.log("Cloudinary upload success", response.secure_url)

        fs.unlinkSync(localFilePath)

        return {
            secure_url: response.secure_url,
            public_id: response.public_id
        };
    } catch (error) {
        console.log("Cloudinary upload error", error)
        fs.unlinkSync(localFilePath);
        return null
    }
}

export { uploadOnCloudinary }
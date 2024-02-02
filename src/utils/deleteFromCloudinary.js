import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async(public_id)=>{
    return await cloudinary.uploader.destroy(public_id)
}

export {deleteFromCloudinary}

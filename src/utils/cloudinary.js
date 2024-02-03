import { v2 as cloudinary } from 'cloudinary';
import removeLocalFile from './removeLocalFile.js';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath,subFolderInsidePortfolioFolder) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder:`portfolio/${subFolderInsidePortfolioFolder}`,
            resource_type: 'auto',
        })
        removeLocalFile(localFilePath)
        return response;
    } catch (err) {
        removeLocalFile(localFilePath)
        return null;
    }
}

export default uploadOnCloudinary;
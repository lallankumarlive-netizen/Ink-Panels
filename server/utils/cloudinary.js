const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file, folder = 'manga') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
            resource_type: 'auto'
        });
        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file');
    }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file');
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};
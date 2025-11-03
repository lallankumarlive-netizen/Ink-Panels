const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ink_panels_db'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development'
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY
    }
};

module.exports = config;
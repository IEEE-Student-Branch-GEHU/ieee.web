const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { getEnvironmentConfig } = require('./environment');

const { cloudinary: cloudinaryConfig } = getEnvironmentConfig();

cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ieee-website',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const certificateStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ieee-website/certificates',
        resource_type: 'auto',
        type: 'authenticated',
        allowed_formats: ['pdf', 'jpg', 'png', 'jpeg', 'webp'],
    },
});

module.exports = { certificateStorage, cloudinary, storage };

// Cloud storage service using Cloudinary
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudStorageService {
  // Upload image to Cloudinary
  static async uploadImage(fileBuffer, fileName) {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            public_id: `podcasts/images/${fileName}`,
            folder: 'podstream/images',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes
              });
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload audio to Cloudinary
  static async uploadAudio(fileBuffer, fileName) {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'video', // Cloudinary uses 'video' for audio files
            public_id: `podcasts/audio/${fileName}`,
            folder: 'podstream/audio',
            format: 'mp3'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                duration: result.duration,
                format: result.format,
                size: result.bytes
              });
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      throw new Error(`Audio upload failed: ${error.message}`);
    }
  }

  // Delete file from Cloudinary
  static async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  // Get file info
  static async getFileInfo(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  // Upload file from local path
  static async uploadFromPath(filePath, fileName, resourceType = 'image') {
    try {
      const folder = resourceType === 'image' ? 'podstream/images' : 'podstream/audio';

      const uploadOptions = {
        resource_type: resourceType === 'image' ? 'image' : 'video',
        public_id: `${folder}/${fileName}`,
        folder: folder,
      };

      if (resourceType === 'image') {
        uploadOptions.transformation = [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ];
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      // Clean up local file after upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        duration: result.duration,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      // Clean up local file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  // Generate signed upload URL for direct uploads
  static generateSignedUploadUrl(folder, resourceType = 'image') {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      // Map resource types for Cloudinary API
      const cloudinaryResourceType = resourceType === 'audio' ? 'video' : resourceType;

      // For Cloudinary signature, we only sign the parameters that will be sent
      // Based on the error, it seems only folder and timestamp are being signed
      const paramsToSign = {
        folder: `podstream/${folder}`,
        timestamp: timestamp
      };

      // Create signature string manually to ensure correct format
      const sortedParams = Object.keys(paramsToSign)
        .sort()
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&');

      // Add the API secret at the end
      const stringToSign = sortedParams + process.env.CLOUDINARY_API_SECRET;

      // Create SHA1 hash
      const crypto = require('crypto');
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

      // Parameters to send with the request
      const uploadParams = {
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp: timestamp,
        folder: `podstream/${folder}`,
        signature: signature
      };

      return {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${cloudinaryResourceType}/upload`,
        params: uploadParams
      };
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  // Check if Cloudinary is properly configured
  static isConfigured() {
    return !!(process.env.CLOUDINARY_CLOUD_NAME &&
              process.env.CLOUDINARY_API_KEY &&
              process.env.CLOUDINARY_API_SECRET);
  }
}

module.exports = CloudStorageService;

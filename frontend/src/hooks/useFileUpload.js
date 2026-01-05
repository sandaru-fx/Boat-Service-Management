// Cloudinary service for file uploads
import CryptoJS from 'crypto-js';

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.REACT_APP_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.REACT_APP_CLOUDINARY_API_SECRET;

export const uploadToCloudinary = (file, options = {}) => {
  console.log('🚀 uploadToCloudinary function called!');
  return new Promise((resolve, reject) => {
    // Check if file is video (declare once) - more robust detection
    const isVideo = Boolean(
      (file.type && file.type.startsWith('video/')) || 
      file.name.toLowerCase().match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/)
    );
    
    console.log('=== CLOUDINARY UPLOAD DEBUG ===');
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    console.log('Is video detected:', isVideo);
    console.log('Cloud name:', CLOUDINARY_CLOUD_NAME);
    console.log('API key exists:', !!CLOUDINARY_API_KEY);
    console.log('API secret exists:', !!CLOUDINARY_API_SECRET);
    console.log('================================');
    
    // Generate signature for signed upload
    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    // Build signature string with parameters in alphabetical order
    // NOTE: resource_type is NOT included in signature for signed uploads
    let signatureParams = '';
    if (options.folder) {
      signatureParams += `folder=${options.folder}`;
    }
    if (options.tags) {
      if (signatureParams) signatureParams += '&';
      signatureParams += `tags=${options.tags}`;
    }
    if (signatureParams) signatureParams += '&';
    signatureParams += `timestamp=${timestamp}`;
    
    console.log('Signature string:', signatureParams);
    
    // Generate SHA1 hash of the signature string (this worked for images)
    const signature = CryptoJS.SHA1(signatureParams + CLOUDINARY_API_SECRET).toString();
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    
    // Add resource_type for videos (this is the key fix)
    if (isVideo) {
      formData.append('resource_type', 'video');
    }
    
    // Add folder if specified
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    // Add tags if specified
    if (options.tags) {
      formData.append('tags', options.tags);
    }
    
    // Debug: Log all FormData parameters
    console.log('FormData parameters:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    
    // Progress tracking
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          options.onProgress(percentComplete);
        }
      });
    }
    
    // Abort controller support
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }
    
    // Handle xhr abort event
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });
    
    // Handle successful response
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          publicId: response.public_id,
          secureUrl: response.secure_url,
          originalFilename: file.name,
          size: file.size,
          format: response.format
        });
      } else {
        console.log('Cloudinary Error Response:', xhr.responseText);
        reject(new Error(`Upload failed: ${xhr.statusText} - ${xhr.responseText}`));
      }
    });
    
    // Handle errors
    xhr.addEventListener('error', () => {
      if (xhr.readyState === 4 && xhr.status === 0) {
        reject(new Error('Upload cancelled'));
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    // Try video/upload for videos, image/upload for images
    const endpoint = isVideo ? 'video' : 'image';
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`);
    xhr.send(formData);
  });
};

export const uploadMultipleFiles = async (files, options = {}) => {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file, options)
  );
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        cloud_name: CLOUDINARY_CLOUD_NAME
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

// URL helper functions for handling both cloud storage and local file URLs
import { STATIC_BASE_URL } from '../config/api.js';

/**
 * Get the full URL for an image, handling both cloud storage URLs and relative paths
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x300/4f46e5/ffffff?text=No+Image';
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, construct URL with static base
  return `${STATIC_BASE_URL}/${imagePath}`;
};

/**
 * Get the full URL for an audio file, handling both cloud storage URLs and relative paths
 * @param {string} audioPath - The audio path from the database
 * @returns {string} - The full URL to the audio file
 */
export const getAudioUrl = (audioPath) => {
  if (!audioPath) {
    return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'; // Default audio
  }
  
  // If it's already a full URL (starts with http), return as is
  if (audioPath.startsWith('http')) {
    return audioPath;
  }
  
  // Otherwise, construct URL with static base
  return `${STATIC_BASE_URL}/${audioPath}`;
};

/**
 * Check if a URL is a valid image URL
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL appears to be an image
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('cloudinary.com') || 
         lowerUrl.includes('placeholder');
};

/**
 * Check if a URL is a valid audio URL
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL appears to be an audio file
 */
export const isValidAudioUrl = (url) => {
  if (!url) return false;
  
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
  const lowerUrl = url.toLowerCase();
  
  return audioExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('cloudinary.com');
};

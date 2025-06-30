import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FiMic, FiType, FiAlignLeft, FiList, FiSave, FiLoader, FiCheck, FiImage, FiMusic } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../../config/api.js';
import AdvancedFileUpload from '../FileUpload/AdvancedFileUpload';
import LoadingSkeleton from '../UI/LoadingSkeleton';

const InputPodcast = () => {
  const [frontImageUrl, setFrontImageUrl] = useState(null);
  const [audioFileUrl, setAudioFileUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ image: 0, audio: 0 });
  const [uploadStatus, setUploadStatus] = useState({ image: 'idle', audio: 'idle' });
  const [inputs, setInputs] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
  });
  const [previewData, setPreviewData] = useState({
    imageFile: null,
    audioFile: null,
    audioDuration: null
  });

  const handleImageUpload = (url, file) => {
    setFrontImageUrl(url);
    setUploadStatus(prev => ({ ...prev, image: 'success' }));
    setPreviewData(prev => ({ ...prev, imageFile: file }));
    toast.success('Image uploaded successfully');
  };

  const handleAudioUpload = (url, file) => {
    setAudioFileUrl(url);
    setUploadStatus(prev => ({ ...prev, audio: 'success' }));
    setPreviewData(prev => ({ ...prev, audioFile: file }));

    // Get audio duration
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      setPreviewData(prev => ({
        ...prev,
        audioDuration: Math.round(audio.duration)
      }));
    };
    audio.src = URL.createObjectURL(file);

    toast.success('Audio file uploaded successfully');
  };

  const onChangeInputs = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleSubmitPodcast = async () => {
    if (!inputs.title || !inputs.category) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!frontImageUrl || !audioFileUrl) {
      toast.error('Please upload both image and audio files');
      return;
    }

    setIsSubmitting(true);

    try {
      const podcastData = {
        title: inputs.title,
        description: inputs.description,
        category: inputs.category,
        frontImageUrl: frontImageUrl,
        audioFileUrl: audioFileUrl
      };

      // Add tags if provided
      if (inputs.tags) {
        podcastData.tags = inputs.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }

      const res = await axios.post(`${API_BASE_URL}/add-podcast`, podcastData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      toast.success(res.data.message);

      // Reset form
      setInputs({ title: '', description: '', category: '', tags: '' });
      setFrontImageUrl(null);
      setAudioFileUrl(null);
      setUploadStatus({ image: 'idle', audio: 'idle' });
      setPreviewData({ imageFile: null, audioFile: null, audioDuration: null });

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create podcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        theme="colored"
      />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}


        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          <div className="p-8 md:p-10 lg:flex gap-10">
            {/* Thumbnail Upload Section */}
            <div className="lg:w-2/5 mb-8 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiImage className="mr-2 text-indigo-500" />
                  Podcast Thumbnail <span className="text-red-500 ml-1">*</span>
                </h3>
                <AdvancedFileUpload
                  onFileUpload={handleImageUpload}
                  acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                  maxSize={10 * 1024 * 1024} // 10MB
                  uploadType="image"
                  placeholder="Drag and drop your podcast thumbnail here, or click to select"
                />
                {previewData.imageFile && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ Image uploaded: {previewData.imageFile.name}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Podcast Details Form */}
            <div className="lg:w-3/5">
              <div className="space-y-6">
                {/* Title Field */}
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiType className="mr-2 text-indigo-500" />
                    Podcast Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="The Future of Audio Storytelling"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-white/70 backdrop-blur-sm"
                    value={inputs.title}
                    onChange={onChangeInputs}
                    required
                  />
                </motion.div>

                {/* Description Field */}
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiAlignLeft className="mr-2 text-indigo-500" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Share what makes your podcast special..."
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-white/70 backdrop-blur-sm resize-none"
                    value={inputs.description}
                    onChange={onChangeInputs}
                  />
                </motion.div>

                {/* Audio & Category Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audio Upload */}
              <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiMic className="mr-2 text-indigo-500" />
        Audio File <span className="text-red-500 ml-1">*</span>
      </h3>
      <AdvancedFileUpload
        onFileUpload={handleAudioUpload}
        acceptedTypes={['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/aac']}
        maxSize={100 * 1024 * 1024} // 100MB
        uploadType="audio"
        placeholder="Drag and drop your podcast audio file here, or click to select"
      />
    </motion.div>

                  {/* Category Select */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiList className="mr-2 text-indigo-500" />
                      Category <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-white/70 backdrop-blur-sm appearance-none"
                      value={inputs.category}
                      onChange={onChangeInputs}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="education">🎓 Education</option>
                      <option value="hobbies">🎨 Hobbies</option>
                      <option value="business">💼 Business</option>
                      <option value="comedy">😂 Comedy</option>
                      <option value="government">🏛 Government</option>
                    </select>
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-6"
                >
                  <button
                    onClick={handleSubmitPodcast}
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all ${
                      isSubmitting
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    } relative overflow-hidden group`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center justify-center">
                          <FiMic className="mr-2 text-lg" />
                          Publish Podcast
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </>
                    )}
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InputPodcast;
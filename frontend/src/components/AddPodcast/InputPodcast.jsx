import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FiUpload, FiMic, FiType, FiAlignLeft, FiList, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useRef } from 'react';

const InputPodcast = () => {
  const [frontImage, setFrontImage] = useState(null);
    const fileInputRef = useRef(null);
      const triggerFileSelect = () => {
    fileInputRef.current.click();
  };
  const [audioFile, setAudioFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputs, setInputs] = useState({
    title: '',
    description: '',
    category: '',
  });

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFrontImage(file);
      toast.success('Image selected successfully');
    } else {
      toast.error('Please select a valid image file (JPEG, PNG)');
      e.target.value = '';
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFrontImage(file);
      toast.success('Image uploaded successfully');
    } else {
      toast.error('Please drop a valid image file');
    }
  };

  const handleAudioFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = [
      'audio/mpeg', // mp3
      'audio/wav',  // wav
      'audio/x-m4a', // m4a
      'audio/ogg',  // ogg
      'audio/aac',  // aac
      'audio/x-aiff' // aiff
    ];
    
    if (validTypes.includes(file.type)) {
      setAudioFile(file);
      toast.success('Audio file selected successfully');
    } else {
      toast.error('Please select a valid audio file (MP3, WAV, M4A, OGG)');
      e.target.value = '';
    }
  };

  const onChangeInputs = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleSubmitPodcast = async () => {
    if (!frontImage || !audioFile || !inputs.title || !inputs.category) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', inputs.title);
    data.append('description', inputs.description);
    data.append('category', inputs.category);
    data.append('frontImage', frontImage);
    data.append('audioFile', audioFile);

    try {
      const res = await axios.post('http://localhost:5000/api/v1/add-podcast', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      toast.success(res.data.message);
      setInputs({ title: '', description: '', category: '' });
      setFrontImage(null);
      setAudioFile(null);
      document.getElementById('audioFile').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create podcast');
    } finally {
      setIsSubmitting(false);
    }
  };
    const removeFile = () => {
    setAudioFile(null);
    fileInputRef.current.value = '';
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
                whileHover={{ scale: 1.02 }}
                className={`relative h-80 w-full rounded-xl border-3 border-dashed ${
                  dragging ? 'border-indigo-400 bg-indigo-50/50' : 'border-indigo-200/50'
                } transition-all duration-300 flex flex-col items-center justify-center overflow-hidden`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {frontImage ? (
                  <>
                    <img
                      src={URL.createObjectURL(frontImage)}
                      alt="Thumbnail Preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setFrontImage(null);
                        document.getElementById('thumbnailInput').value = '';
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
                    >
                      <FiX className="text-lg" />
                    </button>
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all flex items-center justify-center">
                      <FiUpload className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="mx-auto mb-4 p-4 bg-indigo-100/50 rounded-full w-max">
                      <FiUpload className="text-3xl text-indigo-500" />
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">
                      {dragging ? 'Drop your image here' : 'Drag & drop thumbnail'}
                    </p>
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                      or click to browse
                      <input
                        type="file"
                        id="thumbnailInput"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChangeImage}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">Recommended: 1:1 ratio, 1500×1500px</p>
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
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
      <label
        htmlFor="audioFile"
        className="text-sm font-medium text-gray-700 mb-2 flex items-center"
      >
        <FiMic className="mr-2 text-indigo-500" />
        Audio File <span className="text-red-500 ml-1">*</span>
      </label>

      <div
        onClick={triggerFileSelect}
        className="relative px-4 py-3 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-md hover:border-indigo-400 transition cursor-pointer flex justify-between items-center"
      >
        <span
          className={`truncate ${
            audioFile
              ? 'text-indigo-600 font-medium'
              : 'text-gray-500 italic'
          }`}
        >
          {audioFile ? audioFile.name : 'Click to select an audio file'}
        </span>
        <FiUpload className="text-gray-400 ml-3" />
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        id="audioFile"
        name="audioFile"
        accept=".mp3,.wav,.m4a,.ogg,.aac,.aiff"
        className="hidden"
        onChange={handleAudioFile}
        required
      />

      {/* File info & remove */}
      {audioFile && (
        <div className="mt-2 flex items-center">
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
            {Math.round(audioFile.size / 1024 / 1024)}MB
          </span>
          <button
            onClick={removeFile}
            className="ml-2 text-xs text-red-500 hover:text-red-700 flex items-center"
          >
            <FiX className="mr-1" /> Remove
          </button>
        </div>
      )}
    </motion.div>

                  {/* Category Select */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
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
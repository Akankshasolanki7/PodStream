import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(new Audio());

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e) => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update volume when volume state changes
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playPodcast = async (podcast) => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate podcast object
      if (!podcast || !podcast.audioFile) {
        throw new Error('Invalid podcast or missing audio file');
      }

      // If it's a different podcast, load it
      if (!currentPodcast || currentPodcast._id !== podcast._id) {
        setCurrentPodcast(podcast);
        audioRef.current.src = podcast.audioFile;
        setCurrentTime(0);

        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
          const audio = audioRef.current;
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            resolve();
          };
          const handleError = (e) => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            reject(new Error('Failed to load audio'));
          };

          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleError);

          // Timeout after 10 seconds
          setTimeout(() => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            reject(new Error('Audio load timeout'));
          }, 10000);
        });
      }

      await audioRef.current.play();
    } catch (error) {
      console.error('Play error:', error);
      setError(error.message || 'Failed to play audio');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const pausePodcast = () => {
    try {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      pausePodcast();
    } else if (currentPodcast) {
      await playPodcast(currentPodcast);
    }
  };

  const seekTo = (time) => {
    try {
      if (audioRef.current && !isNaN(time) && time >= 0 && time <= duration) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const setVolumeLevel = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const stopPodcast = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value = {
    // State
    currentPodcast,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    
    // Actions
    playPodcast,
    pausePodcast,
    togglePlayPause,
    seekTo,
    setVolumeLevel,
    stopPodcast,
    
    // Utilities
    formatTime,
    
    // Computed values
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    isCurrentPodcast: (podcast) => currentPodcast && currentPodcast._id === podcast._id,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;

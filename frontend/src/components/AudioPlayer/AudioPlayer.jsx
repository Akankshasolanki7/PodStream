// src/components/AudioPlayer.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { playerActions } from '../../store/player';

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [eqBars, setEqBars] = useState([3, 5, 7, 9, 7, 5, 3]);

  const PlayerDivState = useSelector((state) => state.player.isPlayerdiv);
  const songPath = useSelector((state) => state.player.songPath);
  const img = useSelector((state) => state.player.img);
  const title = useSelector((state) => state.player.title) || 'Unknown Track';
  const artist = useSelector((state) => state.player.artist) || 'Unknown Artist';

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const eqInterval = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      eqInterval.current = setInterval(() => {
        setEqBars((prev) => prev.map(() => Math.floor(Math.random() * 8) + 1));
      }, 200);
    } else {
      clearInterval(eqInterval.current);
    }
    return () => clearInterval(eqInterval.current);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log('Play failed:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const updateTime = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume == 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const closeAudioPlayerDiv = (e) => {
    e.preventDefault();
    dispatch(playerActions.closeDiv());
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (audioRef.current && songPath) {
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Auto-play failed:', err));
    }
  }, [songPath, volume]);

  if (!PlayerDivState) return null;

  return (
    <>
      <div
        className="sticky bottom-0 left-0 right-0 h-20 sm:h-24 bg-white border-t border-gray-200 z-[100] shadow-lg px-2 sm:px-4 flex items-center justify-between"
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '0.5rem', // Base gap for sx
          minHeight: '5rem', // Ensure height consistency
        }}
      >
        {/* Custom styles for responsive adjustments */}
        <style jsx>{`
          .audio-player {
            gap: 0.5rem;
          }
          @media (min-width: 640px) {
            .audio-player {
              gap: 1rem; /* sm:gap-4 */
            }
          }
          @media (min-width: 768px) {
            .audio-player {
              gap: 1.25rem; /* md:gap-5 */
            }
          }
          @media (min-width: 1024px) {
            .audio-player {
              gap: 1.5rem; /* lg:gap-6 */
            }
          }
          @media (max-width: 360px) {
            .audio-player {
              flex-direction: column;
              height: auto;
              padding: 0.5rem;
              gap: 0.25rem;
            }
            .audio-player > div {
              width: 100%;
              justify-content: center;
            }
            .audio-player .track-info {
              min-width: 0;
              flex: 1;
            }
            .audio-player .controls {
              max-width: none;
            }
            .audio-player .volume-controls {
              min-width: 0;
              justify-content: center;
            }
          }
        `}</style>

        {/* Album Art and Track Info */}
        <div className="track-info flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none sm:min-w-[160px] md:min-w-[180px]">
          <img
            src={img?.replace(/\\/g, '/') || 'https://via.placeholder.com/80?text=No+Image'}
            alt="Album Art"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md shadow-sm object-cover flex-shrink-0"
          />
          <div className="overflow-hidden min-w-0">
            <h3 className="font-medium text-xs sm:text-sm text-gray-800 truncate">{title}</h3>
            <p className="text-gray-500 text-[0.65rem] sm:text-xs truncate">{artist}</p>
          </div>
        </div>

        {/* Equalizer */}
        <div className="hidden sm:flex items-end h-8 sm:h-10 gap-[2px] mx-1 sm:mx-2 flex-shrink-0">
          {eqBars.map((height, i) => (
            <div
              key={i}
              className={`w-[2px] sm:w-[3px] ${isPlaying ? 'bg-gradient-to-t from-blue-400 to-blue-300' : 'bg-gray-200'} rounded-t-sm transition-all duration-100`}
              style={{ height: `${height * 3}px` }}
            />
          ))}
        </div>

        {/* Main Controls and Progress Bar */}
        <div className="controls flex flex-col items-center flex-1 min-w-0 max-w-[16rem] sm:max-w-md">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <button className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0">
              <FaBackward size={10} />
            </button>
            <button
              onClick={togglePlay}
              className={`p-1.5 sm:p-2 rounded-full shadow-sm transition-all ${
                isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-500'
              } hover:bg-blue-100 flex-shrink-0`}
            >
              {isPlaying ? <FaPause size={10} /> : <FaPlay size={10} className="ml-[1px]" />}
            </button>
            <button className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0">
              <FaForward size={10} />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-1 sm:gap-2 w-full min-w-0">
            <span className="text-[0.65rem] sm:text-xs text-gray-500 w-6 sm:w-8 flex-shrink-0">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-gray-200 rounded-full cursor-pointer min-w-0"
            >
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <span className="text-[0.65rem] sm:text-xs text-gray-500 w-6 sm:w-8 flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume and Close */}
        <div className="volume-controls flex items-center gap-1 sm:gap-2 min-w-0 sm:min-w-[100px] md:min-w-[120px] justify-end flex-shrink-0">
          <button
            onClick={toggleMute}
            className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
          >
            {isMuted ? <FaVolumeMute size={10} /> : <FaVolumeUp size={10} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-12 sm:w-16 h-1 bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 flex-shrink-0"
          />
          <button
            onClick={closeAudioPlayerDiv}
            className="text-gray-500 hover:text-gray-700 ml-1 sm:ml-2 transition-colors flex-shrink-0"
          >
            <AiOutlineClose size={12} />
          </button>
        </div>

        {/* Hidden Audio */}
        <audio
          ref={audioRef}
          onTimeUpdate={updateTime}
          onLoadedMetadata={updateTime}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        >
          {songPath && <source src={songPath.replace(/\\/g, '/')} type="audio/mpeg" />}
        </audio>
      </div>
    </>
  );
};

export default AudioPlayer;
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  isPreviewOnly?: boolean;
}

export default function AudioPlayer({ audioUrl, isPreviewOnly = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioLocked, setAudioLocked] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      setDuration(isPreviewOnly ? Math.min(30, audioRef.current.duration) : audioRef.current.duration);
      if (!isPreviewOnly) {
        setAudioLocked(false);
      }
    }
  }, [isPreviewOnly]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    if (isPreviewOnly && audioRef.current.currentTime >= 30) {
      audioRef.current.pause();
      audioRef.current.currentTime = 30;
      setIsPlaying(false);
      setAudioLocked(true);
      setCurrentTime(30);
      return;
    }
    
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    // For free users, visual duration is at most 30s
    setDuration(isPreviewOnly ? Math.min(30, audioRef.current.duration) : audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    
    if (isPreviewOnly && time >= 30) {
      audioRef.current.currentTime = 30;
      setCurrentTime(30);
      setAudioLocked(true);
      return;
    }
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setAudioLocked(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    audioRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const speedOptions = [1, 1.25, 1.5, 2];

  if (!audioUrl) return null;

  return (
    <div className="bg-[#1F1A17] dark:bg-[#181818] border border-[#2C2622] dark:border-[#2C2C2F] rounded-lg p-3.5 mb-8 text-white">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        {/* Left Side: Play Button & Status */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={togglePlay}
            className="h-8 w-8 bg-primary hover:bg-primary-hover text-[#1F1A17] transition-all rounded-full flex items-center justify-center cursor-pointer shadow-xs focus:outline-hidden"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current translate-x-0.5" />
            )}
          </button>
          <span className="text-xs uppercase font-extrabold tracking-wider select-none font-sans text-neutral-200 dark:text-[#FAFAF9]">
            {isPlaying ? 'Playing briefing' : 'Listen to briefing'}
          </span>
        </div>

        {/* Center: Thin Seek Timeline */}
        <div className="flex-1 flex items-center space-x-3 w-full sm:max-w-xs md:max-w-md">
          <span className="text-[10px] font-mono text-neutral-400 dark:text-[#CFCFCF] w-8 text-right select-none">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-[2px] bg-neutral-700 dark:bg-neutral-800 accent-primary rounded-lg cursor-pointer transition-all focus:outline-hidden"
          />
          <span className="text-[10px] font-mono text-neutral-400 dark:text-[#CFCFCF] w-8 select-none">
            {formatTime(duration)}
          </span>
        </div>

        {/* Right Side: Volume & Speed Controls */}
        <div className="flex items-center space-x-4 shrink-0 border-t sm:border-t-0 border-neutral-800 dark:border-[#2C2C2F] pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
          {/* Playback Speed */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-neutral-400 dark:text-[#FAFAF9] uppercase tracking-wider select-none">Speed</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="bg-neutral-800 dark:bg-[#111111] border border-neutral-700 dark:border-[#2C2C2F] text-white dark:text-[#FAFAF9] text-[10px] font-bold rounded px-1.5 py-0.5 focus:outline-hidden focus:border-primary cursor-pointer"
            >
              {speedOptions.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="text-neutral-400 dark:text-[#FAFAF9] hover:text-white transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {audioLocked && (
        <div className="text-[10px] text-primary font-bold flex items-center justify-center gap-1.5 pt-2.5 mt-2.5 border-t border-neutral-800 dark:border-[#2C2C2F] text-center select-none">
          <span>🔒 30-second preview ended. Upgrade to Premium to listen to the full briefing.</span>
        </div>
      )}
    </div>
  );
}

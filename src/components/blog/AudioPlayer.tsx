'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Headphones, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
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

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  if (!audioUrl) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 mb-8 shadow-xs">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side Info */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary text-black rounded-full flex items-center justify-center shadow-sm">
            <Headphones className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Audio Article</span>
            <h4 className="text-sm font-bold text-foreground leading-tight">Listen to this breakdown</h4>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full space-y-2">
          <div className="flex items-center space-x-4 w-full">
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-primary h-1 bg-border rounded-lg cursor-pointer transition-all"
            />
            <span className="text-xs font-mono text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Play Button */}
            <button
              onClick={togglePlay}
              className="h-10 w-10 sm:h-12 sm:w-12 bg-primary text-black hover:bg-primary/95 transition-all rounded-full flex items-center justify-center shadow-md cursor-pointer focus:outline-hidden"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-black" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-black translate-x-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Right Side Settings */}
        <div className="flex items-center justify-between sm:justify-end gap-6 border-t md:border-t-0 border-border pt-3 md:pt-0">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 accent-primary h-1 bg-border rounded-lg cursor-pointer"
            />
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-muted-foreground">Speed</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="bg-background border border-border text-foreground text-xs font-bold rounded-md px-2 py-1 focus:outline-hidden focus:border-primary"
            >
              {speedOptions.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

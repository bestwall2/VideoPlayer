"use client"
import React, { useEffect, useRef, useState } from "react";
import "@vidstack/react/player/styles/base.css";
import styles from "./player.module.css";
import {
  MediaPlayer,
  MediaProvider,
  useMediaStore,
  useMediaRemote,
  Track,
  TextTrack,
} from "@vidstack/react";
import { VideoLayout } from "./components/layouts/video-layout.tsx";
import { DefaultKeyboardDisplay } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/keyboard.css';
import { FastForwardIcon, FastBackwardIcon } from '@vidstack/react/icons';

function Player({
  src,
  subtitles,
  thumbnails,
  skiptimes,
  onProgressUpdate,
  initialTime = 0,
  onPlaybackEnded,
  onNextEpisodeClick,
  onPreviousEpisodeClick,
}) {
  const playerRef = useRef(null);
  const { duration, fullscreen } = useMediaStore(playerRef);
  const remote = useMediaRemote(playerRef);

  // Helper function to format time (e.g., MM:SS)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // localStorage functions
  const saveTimeToLocalStorage = (key, time, videoDuration) => {
    if (typeof window === 'undefined' || !key) return;
    try {
      const data = { time: Math.round(time), duration: Math.round(videoDuration), timestamp: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving time to localStorage:", error);
    }
  };

  const loadTimeFromLocalStorage = (key) => {
    if (typeof window === 'undefined' || !key) return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading time from localStorage:", error);
      return null;
    }
  };

  const [opbutton, setopbutton] = useState(false);
  const [edbutton, setedbutton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  let interval;

  useEffect(() => {
    playerRef.current?.subscribe(({ currentTime, duration }) => {

      if (skiptimes && skiptimes.length > 0) {
        const opStart = skiptimes[0]?.startTime ?? 0;
        const opEnd = skiptimes[0]?.endTime ?? 0;

        const epStart = skiptimes[1]?.startTime ?? 0;
        const epEnd = skiptimes[1]?.endTime ?? 0;

        const opButtonText = skiptimes[0]?.text || "";
        const edButtonText = skiptimes[1]?.text || "";

        setopbutton(opButtonText === "Opening" && (currentTime > opStart && currentTime < opEnd));
        setedbutton(edButtonText === "Ending" && (currentTime > epStart && currentTime < epEnd));
      }
    })

  }, []);

  function onCanPlay() {
    if (skiptimes && skiptimes.length > 0) {
      const track = new TextTrack({
        kind: 'chapters',
        default: true,
        label: 'English',
        language: 'en-US',
        type: 'json'
      });
      for (const cue of skiptimes) {
        track.addCue(new window.VTTCue(Number(cue.startTime), Number(cue.endTime), cue.text))
      }
      playerRef.current.textTracks.add(track);
    }
  }

  function onEnd() {
    setIsPlaying(false);
  }

  function onEnded() {
    // This is a Vidstack specific event name, we should call our prop `onPlaybackEnded` here.
    if (onPlaybackEnded) {
      onPlaybackEnded();
    }
  }

  function onPlay() {
    setIsPlaying(true);
  }

  function onPause() {
    setIsPlaying(false);
  }

  useEffect(() => {
    if (isPlaying) {
      interval = setInterval(async () => {
        const currentTime = playerRef.current?.currentTime
          ? Math.round(playerRef.current?.currentTime)
          : 0;
        const currentDuration = playerRef.current?.duration
          ? Math.round(playerRef.current?.duration)
          : 0;

        if (onProgressUpdate) {
          onProgressUpdate(currentTime, currentDuration);
        }

        // Save progress to localStorage
        if (src && currentTime > 0 && currentDuration > 0) {
          saveTimeToLocalStorage(src, currentTime, currentDuration);
        }
      }, 5000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, duration, onProgressUpdate, src]);

  function onLoadedMetadata() {
    const videoDuration = playerRef.current?.duration; // Get duration once available
    if (!src || !videoDuration) return; // Wait for src and duration

    const savedProgress = loadTimeFromLocalStorage(src);

    if (savedProgress && savedProgress.duration > 0) { // ensure duration from storage is valid
      const percentage = savedProgress.time / savedProgress.duration;
      if (percentage >= 0.95) {
        // Video almost fully watched, start from beginning or do nothing
        if (initialTime && initialTime > 0) { // Prioritize initialTime if specified and video was "done"
          remote.seek(initialTime);
        }
      } else {
        if (window.confirm(`Resume playback from ${formatTime(savedProgress.time)}?`)) {
          remote.seek(savedProgress.time - 3 < 0 ? 0 : savedProgress.time - 3);
        } else {
          // User chose not to resume, check initialTime
          if (initialTime && initialTime > 0) {
            remote.seek(initialTime);
          }
        }
      }
    } else if (initialTime && initialTime > 0) {
      // No saved progress, but initialTime is provided
      remote.seek(initialTime);
    }
  }

  function handleop() {
    Object.assign(playerRef.current ?? {}, { currentTime: skiptimes[0]?.endTime ?? 0 });
  }

  function handleed() {
    Object.assign(playerRef.current ?? {}, { currentTime: skiptimes[1]?.endTime ?? 0 });
  }


  return (
    <MediaPlayer key={src} ref={playerRef} playsInline aspectRatio={16 / 9}
      load='idle'
      muted={false}
      autoPlay={false}
      title={'Video Player'}
      className={`${styles.player} player relative`}
      crossOrigin={"anonymous"}
      streamType="on-demand"
      keyTarget={playerRef}
      onEnd={onEnd}
      onEnded={onEnded}
      onCanPlay={onCanPlay}
      src={src}
      onPlay={onPlay}
      onPause={onPause}
      onLoadedMetadata={onLoadedMetadata}
    >
      <MediaProvider>
        {subtitles && subtitles?.map((track) => (
          <Track {...track} key={track.src} />
        ))}
      </MediaProvider>
      {opbutton && <button onClick={handleop} className='absolute bottom-[70px] sm:bottom-[83px] right-4 z-[40] bg-white text-black py-2 px-3 rounded-[6px] font-medium text-[15px]'>Skip Opening</button>}
      {edbutton && <button onClick={handleed} className='absolute bottom-[70px] sm:bottom-[83px] right-4 z-[40] bg-white text-black py-2 px-3 rounded-[6px] font-medium text-[15px]'>Skip Ending</button>}
      <VideoLayout
        subtitles={subtitles}
        thumbnails={thumbnails ? process.env.NEXT_PUBLIC_PROXY_URI + '/' + thumbnails[0]?.src : ""}
        onNextEpisodeClick={onNextEpisodeClick} // Pass through to VideoLayout
        onPreviousEpisodeClick={onPreviousEpisodeClick} // Pass through to VideoLayout
      />
      <DefaultKeyboardDisplay
        icons={{
          Play: null,
          Pause: null,
          Mute: null,
          VolumeUp: null,
          VolumeDown: null,
          EnterFullscreen: null,
          ExitFullscreen: null,
          EnterPiP: null,
          ExitPiP: null,
          CaptionsOn: null,
          CaptionsOff: null,
          SeekForward: FastForwardIcon,
          SeekBackward: FastBackwardIcon,
        }}
      />
    </MediaPlayer>
  )
}

export default Player
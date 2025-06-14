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
// import { useRouter } from "next/navigation";
// import VideoProgressSave from '../../../utils/VideoProgressSave';
import { VideoLayout } from "./components/layouts/video-layout";
import { DefaultKeyboardDisplay } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/keyboard.css';
// import { updateEp } from "@/lib/EpHistoryfunctions";
// import { saveProgress } from "@/lib/AnilistUser";
import { FastForwardIcon, FastBackwardIcon } from '@vidstack/react/icons';
// import { useSettings, useTitle, useNowPlaying } from '@/lib/store';
// import { useStore } from "zustand";
// import { toast } from 'sonner';

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
  // const settings = useStore(useSettings, (state) => state.settings);
  // const animetitle = useStore(useTitle, (state) => state.animetitle);
  // const nowPlaying = useStore(useNowPlaying, (state) => state.nowPlaying);
  // const { epId, provider, epNum, subtype } = nowPlaying;
  const { previousep, currentep, nextep } = {} // groupedEp || {};
  // const [getVideoProgress, UpdateVideoProgress] = VideoProgressSave();
  // const router = useRouter();

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
  // const [progressSaved, setprogressSaved] = useState(false); // Unused variable
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

        // if (settings?.autoskip) {
        //   if (opButtonText === "Opening" && currentTime > opStart && currentTime < opEnd) {
        //     Object.assign(playerRef.current ?? {}, { currentTime: opEnd });
        //     return null;
        //   }
        //   if (edButtonText === "Ending" && currentTime > epStart && currentTime < epEnd) {
        //     Object.assign(playerRef.current ?? {}, { currentTime: epEnd });
        //     return null;
        //   }
        // }
      }
    })

  }, [/* settings */]);

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
    // console.log("End")
    setIsPlaying(false);
  }

  function onEnded() {
    // This is a Vidstack specific event name, we should call our prop `onPlaybackEnded` here.
    if (onPlaybackEnded) {
      onPlaybackEnded();
    }
    // if (!nextep?.id) return;
    // if (settings?.autonext) {
    //   router.push(
    //     `/anime/watch?id=${dataInfo?.id}&host=${provider}&epid=${nextep?.id || nextep?.episodeId}&ep=${nextep?.number}&type=${subtype}`
    //   );
    // }
  }

  function onPlay() {
    // console.log("play")
    setIsPlaying(true);
  }

  function onPause() {
    // console.log("pause")
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

        // await updateEp({
        //   userName: session?.user?.name,
        //   aniId: String(dataInfo?.id) || String(id),
        //   aniTitle: dataInfo?.title?.[animetitle] || dataInfo?.title?.romaji,
        //   epTitle: currentep?.title || `EP ${epNum}`,
        //   image: currentep?.img || currentep?.image ||
        //     dataInfo?.bannerImage || dataInfo?.coverImage?.extraLarge || '',
        //   epId: epId,
        //   epNum: Number(epNum) || Number(currentep?.number),
        //   timeWatched: currentTime,
        //   duration: duration,
        //   provider: provider,
        //   nextepId: nextep?.id || null,
        //   nextepNum: nextep?.number || null,
        //   subtype: subtype
        // })

        // UpdateVideoProgress(dataInfo?.id || id, {
        //   aniId: String(dataInfo?.id) || String(id),
        //   aniTitle: dataInfo?.title?.[animetitle] || dataInfo?.title?.romaji,
        //   epTitle: currentep?.title || `EP ${epNum}`,
        //   image: currentep?.img || currentep?.image ||
        //     dataInfo?.bannerImage || dataInfo?.coverImage?.extraLarge || '',
        //   epId: epId,
        //   epNum: Number(epNum) || Number(currentep?.number),
        //   timeWatched: currentTime,
        //   duration: duration,
        //   provider: provider,
        //   nextepId: nextep?.id || nextep?.episodeId || null,
        //   nextepNum: nextep?.number || null,
        //   subtype: subtype,
        //   createdAt: new Date().toISOString(),
        // });
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
        // console.log("Video almost fully watched, starting from 0 or doing nothing.");
        if (initialTime && initialTime > 0) { // Prioritize initialTime if specified and video was "done"
          remote.seek(initialTime);
        } else {
          // remote.seek(0); // Or simply let it be
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
    // Original logic for savedep (project-specific, commented out)
    // if (savedep && savedep[0]) {
    //   const seekTime = savedep[0]?.timeWatched;
    //   if (seekTime) {
    //     remote.seek(seekTime - 3);
    //   }
    // }
    // else {
    //   const seek = getVideoProgress(dataInfo?.id);
    //   if (seek?.epNum === Number(epNum)) {
    //     const seekTime = seek?.timeWatched;
    //     const percentage = duration !== 0 ? seekTime / Math.round(duration) : 0;

    //     if (percentage >= 0.95) {
    //       remote.seek(0);
    //     } else {
    //       remote.seek(seekTime - 3);
    //     }
    //   }
    // }
  }

  // function onTimeUpdate() { // This function's logic for nextButton is likely redundant
    // const currentTime = playerRef.current?.currentTime;
    // const timeToShowButton = duration - 8; // duration here is from useMediaStore, might not be the most up-to-date for this check
    // const currentVideoDuration = playerRef.current?.duration;


    // if (session && !progressSaved && percentage >= 0.9) { // session, progressSaved, saveProgress are removed
    //   try {
    //     setprogressSaved(true);
    //     saveProgress(session.user.token, dataInfo?.id || id, Number(epNum) || Number(currentep?.number));
    //   } catch (error) {
    //     console.error("Error saving progress:", error);
    //     toast.error("Error saving progress due to high traffic.");
    //   }
    // }

    // const nextButton = document.querySelector(".nextbtn"); // This button is now PlayNextButton, conditionally rendered by React

    // if (nextButton) {
      // nextep is always undefined here due to const { ..., nextep } = {}
      // if (currentVideoDuration && currentVideoDuration !== 0 && (currentTime > timeToShowButton && nextep?.id)) {
      //   nextButton.classList.remove("hidden");
      // } else {
      //   nextButton.classList.add("hidden");
      // }
    // }
  // }

  // function onSourceChange() { // This function only logs to console
  //   if(fullscreen){
  //     console.log("true")
  //   }else{
  //     console.log("false")
  //   }
  // }

  function handleop() {
    console.log("Skipping Intro");
    Object.assign(playerRef.current ?? {}, { currentTime: skiptimes[0]?.endTime ?? 0 });
  }

  function handleed() {
    console.log("Skipping Outro");
    Object.assign(playerRef.current ?? {}, { currentTime: skiptimes[1]?.endTime ?? 0 });
  }


  return (
    <MediaPlayer key={src} ref={playerRef} playsInline aspectRatio={16 / 9}
      // load={settings?.load || 'idle'}
      load='idle'
      // muted={settings?.audio || false}
      muted={false}
      // autoPlay={settings?.autoplay || false}
      autoPlay={false}
      // title={currentep?.title || `EP ${epNum}` || 'Loading...'}
      title={'Video Player'}
      className={`${styles.player} player relative`}
      crossOrigin={"anonymous"}
      streamType="on-demand"
      keyTarget={playerRef}
      onEnd={onEnd}
      onEnded={onEnded}
      onCanPlay={onCanPlay}
      // src prop is directly the URL string as per previous investigation
      src={src}
      // Example if src were an object:
      // src={typeof src === 'string' ? src : src?.src}
      onPlay={onPlay}
      onPause={onPause}
      onLoadedMetadata={onLoadedMetadata}
      // onTimeUpdate={onTimeUpdate} // Removed as its primary logic is now redundant or handled by React conditional rendering
      // onSourceChange={onSourceChange}
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
        // groupedEp={groupedEp} // This prop was removed from Player
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

/*
CONCEPTUAL USAGE EXAMPLE:

This demonstrates how to use the refactored Player component in a parent React application.

1. Import the Player:
import React, { useState, useEffect } from 'react'; // Added for example component
import Player from './VidstackPlayer/player'; // Adjust path as needed

2. Example Parent Component:

function MyVideoPage() {
  const [currentVideo, setCurrentVideo] = useState({
    src: "https://stream.mux.com/your-video-id/high.m3u8", // Replace with your actual video source
    subtitles: [
      { src: '/path/to/subs-en.vtt', label: 'English', language: 'en-US', kind: 'subtitles', default: true },
      { src: '/path/to/subs-es.vtt', label: 'Spanish', language: 'es-ES', kind: 'subtitles' },
    ],
    skiptimes: [
      { startTime: 30, endTime: 60, text: 'Intro' },
      { startTime: 720, endTime: 750, text: 'Outro' },
    ],
    thumbnails: '/path/to/thumbnails.vtt', // Optional: URL to a VTT thumbnails file
    // Potentially, an ID to manage progress or other metadata externally
    videoId: 'uniqueVideoId123'
  });

  // initialTime prop for the player is managed by the player's internal localStorage logic first.
  // This example shows how a parent *could* also manage it, perhaps from a central store.
  // For simplicity, the player's own localStorage-based resume will take precedence if available.
  // If you want parent-controlled initialTime to always override, you might need to adjust player logic or avoid localStorage in player.
  const [externalInitialTime, setExternalInitialTime] = useState(0);

  // Example: Load initial time for this video if you were managing it externally
  useEffect(() => {
    // This is just a placeholder. In a real app, you might fetch this from an API or a different localStorage key.
    // const savedProgress = parseFloat(localStorage.getItem(`custom-video-progress-${currentVideo.videoId}`)) || 0;
    // if (savedProgress > 5) {
    //     setExternalInitialTime(savedProgress);
    // } else {
    //     setExternalInitialTime(0);
    // }
  }, [currentVideo.videoId]);

  const handleProgressUpdate = (currentTime, duration) => {
    console.log(`Parent received progress: VideoID: ${currentVideo.videoId}, Time: ${currentTime}, Duration: ${duration}`);
    // Example: Save progress to your own backend or a different localStorage schema
    // localStorage.setItem(`custom-video-progress-${currentVideo.videoId}`, currentTime.toString());

    // Note: The player itself saves progress to localStorage using the video 'src' as the key.
    // The `onProgressUpdate` callback is for applications that need to sync this progress elsewhere
    // (e.g., to a backend database, or a global state management like Redux/Zustand).
    // If you only need localStorage resume, the player handles that internally.
  };

  const handlePlaybackEnded = () => {
    console.log(`Parent received: Video ${currentVideo.videoId} finished!`);
    // Implement logic for what happens when video ends.
    // For example, navigate to next video, show completion screen, etc.
    // handleNextEpisode(); // Uncomment if you want to automatically play the next episode.
  };

  const handleNextEpisode = () => {
    console.log("Parent: Next episode requested");
    // Implement logic to load and play the next episode/video
    // Example:
    // setCurrentVideo({
    //   src: "https://stream.mux.com/new-video-id/high.m3u8",
    //   videoId: 'uniqueVideoId456',
    //   subtitles: [ ... ],
    //   skiptimes: [ ... ],
    //   thumbnails: '...'
    // });
    // setExternalInitialTime(0); // Reset initial time for the new video
    alert("Next episode functionality to be implemented by parent application.");
  };

  const handlePreviousEpisode = () => {
    console.log("Parent: Previous episode requested");
    // Implement logic to load and play the previous episode/video
    // Example:
    // setCurrentVideo({
    //   src: "https://stream.mux.com/prev-video-id/high.m3u8",
    //   videoId: 'uniqueVideoId789',
    //   subtitles: [ ... ],
    //   skiptimes: [ ... ],
    //   thumbnails: '...'
    // });
    // setExternalInitialTime(0); // Reset initial time for the new video
    alert("Previous episode functionality to be implemented by parent application.");
  };

  // The 'groupedEp' prop is for conditionally showing Next/Previous buttons in the UI.
  // It does not handle navigation itself; that's done by onNextEpisodeClick/onPreviousEpisodeClick.
  // Provide it if you want the player's UI to show these buttons.
  const groupedEpForPlayerUI = {
    nextep: { id: 'someNextEpisodeIdentifier' }, // Dummy data to make button appear
    previousep: { id: 'somePrevEpisodeIdentifier' } // Dummy data to make button appear
  };


  return (
    <div>
      <Player
        src={currentVideo.src}
        subtitles={currentVideo.subtitles}
        skiptimes={currentVideo.skiptimes}
        thumbnails={currentVideo.thumbnails} // Optional
        initialTime={externalInitialTime} // Player will use its localStorage progress first, then this.
        onProgressUpdate={handleProgressUpdate}
        onPlaybackEnded={handlePlaybackEnded}
        onNextEpisodeClick={handleNextEpisode}
        onPreviousEpisodeClick={handlePreviousEpisode}
        // Pass groupedEp to VidstackPlayer/layout/video-layout.tsx for UI button visibility control
        // groupedEp={groupedEpForPlayerUI}
      />
    </div>
  );
}

// export default MyVideoPage; // Uncomment if this were a real file in your project

*/
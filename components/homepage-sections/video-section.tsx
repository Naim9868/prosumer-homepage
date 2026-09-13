"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { SectionHeading } from "@/components/shared/layout-primitives";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { loadYouTubeAPI, extractYouTubeId } from "@/lib/youtube-api";
import type { Section } from "@/types/homepage";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  YouTube player instance — typed subset of the YT.Player API       */
/* ------------------------------------------------------------------ */

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getCurrentTime(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getDuration(): number;
  destroy(): void;
  setVolume(volume: number): void;
  getVolume(): number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function VideoSection({ section }: { section: Extract<Section, { type: "video" }> }) {
  const {
    title,
    subtitle,
    youtubeId: legacyId,
    videoUrl,
    autoplayOnScroll,
    autoplayMuted,
    pauseWhenOutOfView,
    resumeWhenInView,
    intersectionThreshold,
    controls: showNativeControls,
    showCustomControls,
    showPlayButton,
    showMuteButton,
    overlay,
    overlayOpacity,
    aspectRatio,
    maxWidth,
    borderRadius,
    startTime,
    endTime,
    spacing,
  } = section.settings;

  const videoId = extractYouTubeId(videoUrl) || legacyId;

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerDivId = useRef(`yt-player-${section.id}`);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const readyRef = useRef(false);
  const autoplayBlockedRef = useRef(false);

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(autoplayMuted);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- Cleanup helper ---- */
  const cleanup = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  /* ---- Create YouTube player ---- */
  useEffect(() => {
    if (!videoId || typeof window === "undefined") return;

    let destroyed = false;

    loadYouTubeAPI()
      .then((YT) => {
        if (destroyed) return;

        const player = new YT.Player(playerDivId.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            mute: autoplayMuted ? 1 : 0,
            playsinline: 1,
            controls: showNativeControls ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            start: startTime || undefined,
            end: endTime || undefined,
          },
          events: {
            onReady: () => {
              if (destroyed) return;
              playerRef.current = player;
              readyRef.current = true;
              setPlayerReady(true);
              if (autoplayMuted) {
                player.mute();
                setIsMuted(true);
              }
            },
            onStateChange: (e: { data: number }) => {
              if (destroyed) return;
              // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=queued
              setIsPlaying(e.data === 1);
            },
            onAutoplayBlocked: () => {
              if (destroyed) return;
              autoplayBlockedRef.current = true;
              setAutoplayBlocked(true);
            },
          },
        });
      })
      .catch(() => {
        /* API load failed — graceful degradation */
      });

    return () => {
      destroyed = true;
      cleanup();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* swallow */
        }
        playerRef.current = null;
      }
    };
  }, [videoId, autoplayMuted, showNativeControls, startTime, endTime, cleanup]);

  /* ---- IntersectionObserver: play/pause on scroll ---- */
  useEffect(() => {
    if (!readyRef.current || !autoplayOnScroll || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const player = playerRef.current;
        if (!player) return;

        if (entry.isIntersecting) {
          if (autoplayMuted) player.mute();
          player.playVideo();
          if (startTime && player.getCurrentTime() < startTime) {
            player.seekTo(startTime, true);
          }
        } else {
          if (pauseWhenOutOfView) {
            player.pauseVideo();
          }
        }
      },
      { threshold: intersectionThreshold },
    );

    observer.observe(containerRef.current);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [playerReady, autoplayOnScroll, autoplayMuted, pauseWhenOutOfView, intersectionThreshold, startTime]);

  /* ---- Progress tracker ---- */
  useEffect(() => {
    if (!playerReady || !showCustomControls) return;

    progressInterval.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const current = player.getCurrentTime();
      const duration = player.getDuration();
      setProgress(duration > 0 ? (current / duration) * 100 : 0);
    }, 250);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [playerReady, showCustomControls]);

  /* ---- Controls ---- */
  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      if (isMuted) player.mute();
      player.playVideo();
    }
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  if (!videoId) {
    return (
      <SectionWrapper style={section.style}>
        <SectionHeading eyebrow="In the Field" title={title} description={subtitle} align="center" className="mx-auto" />
        <div
          className="mx-auto mt-12 flex aspect-video items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border bg-muted/30"
          style={{ maxWidth }}
        >
          <p className="text-sm text-foreground-muted">Add a YouTube URL in the section settings.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      style={{
        ...section.style,
        paddingTop: spacing?.top ?? section.style.paddingTop,
        paddingBottom: spacing?.bottom ?? section.style.paddingBottom,
      }}
    >
      <SectionHeading eyebrow="In the Field" title={title} description={subtitle} align="center" className="mx-auto" />

      <div className="mx-auto mt-12" style={{ maxWidth }}>
        <div
          ref={containerRef}
          className={cn(
            "relative w-full overflow-hidden border border-border bg-black",
            "transition-shadow duration-500 hover:shadow-xl",
          )}
          style={{
            aspectRatio,
            borderRadius,
          }}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* YouTube iframe container */}
          <div id={playerDivId.current} className="absolute inset-0 h-full w-full" />

          {/* Dark overlay */}
          {overlay && !isPlaying && (
            <div
              className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
              style={{ opacity: overlayOpacity }}
            />
          )}

          {/* Large play button (initial / autoplay blocked) */}
          {showPlayButton && !isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play video"
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-black shadow-2xl transition-transform duration-300 hover:scale-110 sm:h-24 sm:w-24">
                <Play className="h-8 w-8 fill-black sm:h-10 sm:w-10" />
              </span>
            </button>
          )}

          {/* Custom controls bar */}
          {showCustomControls && (showControls || !isPlaying) && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 transition-opacity duration-300">
              {/* Play / Pause */}
              {showPlayButton && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                </button>
              )}

              {/* Progress bar */}
              <div className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/20" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-200" style={{ width: `${progress}%` }} />
              </div>

              {/* Mute toggle */}
              {showMuteButton && (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Autoplay blocked notice */}
          {autoplayBlocked && !isPlaying && (
            <div className="absolute inset-x-0 top-4 z-20 text-center">
              <span className="inline-block rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm">
                Tap play to start the video
              </span>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

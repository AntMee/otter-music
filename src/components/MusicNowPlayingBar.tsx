"use client";

import { ListVideo, Pause, Play } from "lucide-react";
import { useMusicStore } from "@/store/music-store";
import { useShallow } from "zustand/react/shallow";
import { PlayerQueueDrawer } from "./PlayerQueueDrawer";
import { MusicCover } from "./MusicCover";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";

interface MusicNowPlayingBarProps {
  onOpenFullScreen?: () => void;
  isTab?: boolean;
}

export function MusicNowPlayingBar({
  onOpenFullScreen,
  isTab = true,
}: MusicNowPlayingBarProps) {
  const {
    isPlaying,
    currentAudioTime,
    duration,
    isShuffle,
    queue,
    currentIndex,
    coverUrl,
    togglePlay,
    setCurrentIndexAndPlay,
    clearQueue,
    reshuffle,
    removeFromQueue,
    playTrackAsNext,
  } = useMusicStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      currentAudioTime: state.currentAudioTime,
      duration: state.duration,
      isShuffle: state.isShuffle,
      queue: state.queue,
      currentIndex: state.currentIndex,
      coverUrl: state.coverUrl,
      togglePlay: state.togglePlay,
      setCurrentIndexAndPlay: state.setCurrentIndexAndPlay,
      clearQueue: state.clearQueue,
      reshuffle: state.reshuffle,
      removeFromQueue: state.removeFromQueue,
      playTrackAsNext: state.playTrackAsNext,
    }))
  );

  const currentTrack = queue[currentIndex] || null;

  const playTrack = useCallback(
    (index: number) => {
      setCurrentIndexAndPlay(index);
    },
    [setCurrentIndexAndPlay]
  );

  const handleClearQueue = () => {
    clearQueue();
    toast.success("播放列表已清空");
  };

  const handleRemoveFromQueue = useCallback(
    (track: MusicTrack) => {
      removeFromQueue(track.id);
    },
    [removeFromQueue]
  );

  const progress = duration > 0 ? (currentAudioTime / duration) * 100 : 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  if (!currentTrack) {
    return null;
  }

  return (
    <div
      className={cn(
        isTab
          ? "px-3 md:mx-auto md:max-w-7xl md:px-6 lg:px-8"
          : "w-full md:mx-auto md:max-w-7xl md:px-6 lg:px-8"
      )}
    >
      <div
        className={cn(
          "flex items-center backdrop-blur-sm transition-all duration-300",
          isTab
            ? "gap-2 rounded-2xl border border-border/50 bg-card/95 px-2 py-1.5 shadow-md md:rounded-lg md:px-3 md:py-2"
            : "gap-3 bg-background/95 px-4 py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-border/50 md:rounded-lg md:border md:border-border/50 md:bg-card/95 md:px-3 md:py-2 md:pb-2 md:shadow-md"
        )}
      >
        {/* Keep the queue trigger outside this area to avoid ghost-click fullscreen opens. */}
        <div
          className="flex items-center flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpenFullScreen?.()}
        >
          {/* Cover */}
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-md transition-all duration-300 shadow-sm",
              isTab ? "h-8 w-8" : "h-11 w-11"
            )}
          >
            <MusicCover
              src={coverUrl}
              alt={currentTrack.name}
              className="w-full h-full"
              iconClassName={isTab ? "h-4 w-4" : "h-5 w-5"}
            />
          </div>

          {/* Track info */}
          <p className="flex-1 min-w-0 truncate flex items-baseline gap-1.5 ml-2">
            <span
              className={cn(
                "font-medium text-foreground transition-all duration-300",
                isTab ? "text-sm" : "text-base"
              )}
            >
              {currentTrack.name}
            </span>
            <span
              className={cn(
                "text-muted-foreground truncate transition-all duration-300",
                isTab ? "text-xs" : "text-sm"
              )}
            >
              - {currentTrack.artist?.join(", ")}
            </span>
          </p>

          {/* Progress play button */}
          <div
            className={cn(
              "relative shrink-0 transition-all duration-300 ml-2",
              isTab ? "w-9 h-9" : "w-11 h-11"
            )}
          >
            {/* Circular progress scales with the viewBox. */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
              {/* Progress background */}
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={isTab ? "2" : "2.5"}
                className="text-muted/30 transition-all duration-300"
              />
              {/* Progress ring starts from the top. */}
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={isTab ? "2" : "2.5"}
                strokeLinecap="round"
                className="text-primary transition-[stroke-dashoffset] duration-300"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 20 20)"
              />
            </svg>

            {/* Play button */}
            <button
              className="absolute inset-0 flex items-center justify-center text-primary hover:text-primary/80 transition-colors focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <Pause
                  className={cn(
                    "fill-current transition-all duration-300",
                    isTab ? "h-4 w-4" : "h-5 w-5"
                  )}
                />
              ) : (
                <Play
                  className={cn(
                    "fill-current ml-0.5 transition-all duration-300",
                    isTab ? "h-4 w-4" : "h-5 w-5"
                  )}
                />
              )}
            </button>
          </div>
        </div>

        {/* Separate sibling node so overlay close clicks do not bubble into fullscreen. */}
        <PlayerQueueDrawer
          queue={queue}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          isShuffle={isShuffle}
          onPlay={playTrack}
          onClear={handleClearQueue}
          onReshuffle={reshuffle}
          onRemove={handleRemoveFromQueue}
          onPlayTrack={playTrackAsNext}
          trigger={
            <button
              className={cn(
                "text-muted-foreground hover:text-foreground transition-all shrink-0 focus:outline-none",
                isTab ? "p-1.5" : "p-2 ml-1"
              )}
              aria-label="播放列表"
            >
              <ListVideo
                className={cn(
                  "transition-all duration-300",
                  isTab ? "h-4 w-4" : "h-[22px] w-[22px]"
                )}
              />
            </button>
          }
        />
      </div>
    </div>
  );
}

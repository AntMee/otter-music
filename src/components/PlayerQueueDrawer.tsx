"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, X, Maximize2, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MusicCover } from "@/components/MusicCover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicCover } from "@/hooks/useMusicCover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useHistoryStore } from "@/store/history-store";
import { useMusicStore } from "@/store/music-store";
import type { MusicTrack } from "@/types/music";

interface PlayerQueueDrawerProps {
  queue: MusicTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  onPlay: (index: number) => void;
  onClear: () => void;
  onReshuffle: () => void;
  onRemove: (track: MusicTrack) => void;
  onPlayTrack?: (track: MusicTrack) => void;
  onOpenChange?: (open: boolean) => void;
  desktopPlacement?: "app" | "fullscreen";
  trigger: React.ReactNode;
}

interface QueueTrackItemProps {
  track: MusicTrack;
  isCurrent: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onRemove: (track: MusicTrack, isCurrent: boolean) => void;
  itemRef?: (el: HTMLDivElement | null) => void;
}

function QueueTrackItem({
  track,
  isCurrent,
  isPlaying,
  onSelect,
  onRemove,
  itemRef,
}: QueueTrackItemProps) {
  const coverUrl = useMusicCover(track);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(track, isCurrent);
  };

  return (
    <div
      ref={itemRef}
      role="button"
      tabIndex={0}
      aria-label={`播放 ${track.name}`}
      className={cn(
        "grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-muted/60 active:bg-muted",
        isCurrent && "bg-muted/50"
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onSelect();
      }}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        <MusicCover
          src={coverUrl}
          alt=""
          className="rounded-lg"
          iconClassName="h-5 w-5 text-muted-foreground/40"
        />

        {/* Compact equalizer indicator for the current playing track. */}
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center gap-[3px] rounded-lg bg-black/30 backdrop-blur-[2px]">
            <div className="h-1 w-[2.5px] rounded-full bg-primary animate-[audio-bar_1s_ease-in-out_infinite]" />
            <div className="h-1 w-[2.5px] rounded-full bg-primary animate-[audio-bar_1s_ease-in-out_infinite] [animation-delay:200ms]" />
            <div className="h-1 w-[2.5px] rounded-full bg-primary animate-[audio-bar_1s_ease-in-out_infinite] [animation-delay:400ms]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex flex-col justify-center overflow-hidden">
        <span
          className={cn(
            "text-[15px] font-medium truncate leading-snug transition-colors",
            isCurrent ? "text-primary" : "text-foreground"
          )}
        >
          {track.name}
        </span>
        <span className="text-[13px] text-muted-foreground/70 truncate leading-snug">
          {track.artist.join(" / ")}
        </span>
      </div>

      <div className="flex items-center justify-center -mr-2">
        <button
          className="rounded-lg p-2 text-muted-foreground/50 hover:text-foreground"
          onClick={handleRemove}
          title="删除"
          aria-label={`删除 ${track.name}`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function PlayerQueueDrawer({
  queue,
  currentIndex,
  isPlaying,
  isShuffle,
  onPlay,
  onClear,
  onReshuffle,
  onRemove,
  onPlayTrack,
  onOpenChange,
  trigger,
}: PlayerQueueDrawerProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const { history, removeFromHistory, clearHistory } = useHistoryStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasScrolledOnOpen = useRef(false);

  useEffect(() => {
    hasScrolledOnOpen.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || hasScrolledOnOpen.current) return;
    hasScrolledOnOpen.current = true;

    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    });

    return () => cancelAnimationFrame(id);
  }, [open, currentIndex]);

  const setCurrentRef = (el: HTMLDivElement | null) => {
    if (el) scrollRef.current = el;
  };

  const handleTabChange = (tab: "queue" | "history") => {
    setActiveTab(tab);
    viewportRef.current?.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleConfirm = () => {
    confirmState?.action();
    setConfirmState(null);
  };

  const requestClearQueue = () => {
    setConfirmState({
      title: "清空播放列表",
      description: "确定要清空当前播放列表吗？此操作不会删除本地歌曲文件。",
      action: onClear,
    });
  };

  const requestClearHistory = () => {
    setConfirmState({
      title: "清空播放历史",
      description: "确定要清空最近播放记录吗？此操作不可恢复。",
      action: clearHistory,
    });
  };

  const requestRemoveTrack = (track: MusicTrack, isCurrent: boolean) => {
    if (!isCurrent) {
      onRemove(track);
      return;
    }

    setConfirmState({
      title: "删除当前播放歌曲",
      description: `确定要从播放列表移除《${track.name}》吗？`,
      action: () => onRemove(track),
    });
  };

  const queueContent = (
    <>
      <DrawerHeader className="shrink-0 px-6 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleTabChange("queue")}
              className={cn(
                "text-[15px] transition-all whitespace-nowrap",
                activeTab === "queue"
                  ? "font-bold text-foreground tracking-wide"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              播放列表{" "}
              <span className="text-xs opacity-60 ml-0.5">{queue.length}</span>
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={cn(
                "text-[15px] transition-all whitespace-nowrap",
                activeTab === "history"
                  ? "font-bold text-foreground tracking-wide"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              最近播放{" "}
              <span className="text-xs opacity-60 ml-0.5">
                {history.length}
              </span>
            </button>
          </div>

          <p className="sr-only">当前播放队列，可切换、清空或删除歌曲。</p>

          <div className="flex items-center gap-2">
            {activeTab === "queue" && isShuffle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                onClick={onReshuffle}
                title="再次打乱"
              >
                <Dices className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => {
                setOpen(false);
                useMusicStore.getState().setIsFullScreenPlayer(false);
                navigate(activeTab === "queue" ? "/queue" : "/history");
              }}
              title={activeTab === "queue" ? "展开播放列表" : "展开历史记录"}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={
                activeTab === "queue" ? requestClearQueue : requestClearHistory
              }
              title={activeTab === "queue" ? "清空播放列表" : "清空播放历史"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DrawerHeader>

      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col gap-1">
            {activeTab === "queue"
              ? queue.map((track, i) => (
                  <QueueTrackItem
                    key={`${track.id}-${i}`}
                    track={track}
                    isCurrent={i === currentIndex}
                    isPlaying={isPlaying}
                    onSelect={() => {
                      onPlay(i);
                      setOpen(false);
                    }}
                    onRemove={requestRemoveTrack}
                    itemRef={i === currentIndex ? setCurrentRef : undefined}
                  />
                ))
              : history.map((track, i) => (
                  <QueueTrackItem
                    key={`${track.id}-${i}`}
                    track={track}
                    isCurrent={track.id === queue[currentIndex]?.id}
                    isPlaying={
                      isPlaying && track.id === queue[currentIndex]?.id
                    }
                    onSelect={() => {
                      // Add the history track back to the queue and play it.
                      onPlayTrack?.(track);
                      setOpen(false);
                    }}
                    onRemove={(item) => removeFromHistory(item.id)}
                  />
                ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );

  if (!isMobile) {
    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            sideOffset={12}
            collisionPadding={24}
            className={cn(
              "flex w-[420px] max-w-[calc(100vw-3rem)] flex-col gap-0 overflow-hidden rounded-2xl border bg-popover p-0 shadow-xl outline-none",
              "h-[min(640px,calc(100vh-8rem))] max-h-[calc(100vh-8rem)]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {queueContent}
          </PopoverContent>
        </Popover>

        <ConfirmQueueDialog
          state={confirmState}
          onCancel={() => setConfirmState(null)}
          onConfirm={handleConfirm}
        />
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent
          className="h-[75vh] max-h-[75vh] gap-0 rounded-t-3xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {queueContent}
        </DrawerContent>
      </Drawer>

      <ConfirmQueueDialog
        state={confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

function ConfirmQueueDialog({
  state,
  onCancel,
  onConfirm,
}: {
  state: {
    title: string;
    description: string;
    action: () => void;
  } | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!state) return null;

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="w-[min(360px,calc(100vw-32px))] gap-5 rounded-2xl p-5"
        showCloseButton={false}
      >
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="text-base">{state?.title}</DialogTitle>
          <DialogDescription className="leading-6">
            {state?.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

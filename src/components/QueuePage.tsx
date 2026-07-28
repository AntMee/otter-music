"use client";

import { Trash2, ListVideo } from "lucide-react";
import { MusicPlaylistView } from "./MusicPlaylistView";
import { MusicTrack } from "@/types/music";
import { Button } from "./ui/button";
import { PageLayout } from "./PageLayout";

interface QueuePageProps {
  queue: MusicTrack[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlay: (track: MusicTrack | null, index?: number) => void;
  onRemove: (track: MusicTrack) => void;
  onClear: () => void;
  onBack?: () => void;
}

export function QueuePage({
  queue,
  currentTrackId,
  isPlaying,
  onPlay,
  onRemove,
  onClear,
  onBack,
}: QueuePageProps) {
  return (
    <PageLayout
      title="播放列表"
      onBack={onBack}
      action={
        queue.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => confirm("确定清空播放列表吗？") && onClear()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      }
    >
      <div className="flex-1 min-h-0 overflow-hidden bg-background md:bg-muted/25 md:p-6 lg:p-8">
        <div className="mx-auto flex h-full max-w-7xl overflow-hidden bg-background md:rounded-2xl md:border md:shadow-sm">
          <MusicPlaylistView
            title="播放列表"
            tracks={queue}
            icon={<ListVideo className="h-8 w-8 text-primary/80" />}
            onPlay={onPlay}
            onRemove={onRemove}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
          />
        </div>
      </div>
    </PageLayout>
  );
}

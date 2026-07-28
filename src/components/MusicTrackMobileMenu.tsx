import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Download,
  Heart,
  ListPlus,
  MoreVertical,
  Trash2,
  CornerDownRight,
  User,
  Disc,
  MessageSquareQuote,
  Link2,
} from "lucide-react";
import { type ElementType, type ReactNode, useState } from "react";
import { MusicCover } from "./MusicCover";
import { useMusicCover } from "@/hooks/useMusicCover";
import { MusicTrack, SearchIntent, sourceLabels } from "@/types/music";
import { useNavigate } from "react-router-dom";
import { useMusicStore } from "@/store/music-store";
import { MusicProviderFactory } from "@/lib/music-provider";
import { MusicCommentsDrawer } from "./MusicCommentsDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildBilibiliSeriesAlbumId,
  buildBilibiliMultiPAlbumId,
  parseBilibiliTrackId,
} from "@otter-music/shared";

interface MusicTrackMobileMenuProps {
  track: MusicTrack;
  playlistId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToNextPlay?: () => void;
  onAddToPlaylist: () => void;
  onDownload?: () => void;
  onToggleLike?: () => void;
  isFavorite?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  confirmRemove?: boolean;
  customActions?: ReactNode;
  triggerClassName?: string;
  onNavigate?: () => void;
}

const ActionButton = ({
  onClick,
  icon: Icon,
  children,
  className,
}: {
  onClick?: () => void;
  icon: ElementType;
  children: ReactNode;
  className?: string;
}) => (
  <Button
    variant="ghost"
    className={cn("w-full justify-start", className)}
    onClick={onClick}
  >
    <Icon className="mr-2 h-4 w-4 shrink-0" />
    <span className="truncate">{children}</span>
  </Button>
);

export function MusicTrackMobileMenu({
  track,
  open,
  onOpenChange,
  onAddToNextPlay,
  onAddToPlaylist,
  onDownload,
  onToggleLike,
  isFavorite,
  onRemove,
  removeLabel = "删除",
  confirmRemove = true,
  customActions,
  triggerClassName,
  onNavigate,
}: MusicTrackMobileMenuProps) {
  const coverUrl = useMusicCover(track, open);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showArtistSelection, setShowArtistSelection] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const setSearchQuery = useMusicStore((s) => s.setSearchQuery);
  const setSearchResults = useMusicStore((s) => s.setSearchResults);
  const setSearchIntent = useMusicStore((s) => s.setSearchIntent);
  const setSearchSource = useMusicStore((s) => s.setSearchSource);

  const provider = MusicProviderFactory.getProvider(track.source);

  const handleSearch = async (
    keyword: string,
    type: SearchIntent["type"] = "",
    artist?: string,
    id?: string
  ) => {
    if (
      (provider.getArtistDetail || provider.getAlbumDetail) &&
      (!id || id === "0") &&
      provider.getSongDetail
    ) {
      try {
        const detail = await provider.getSongDetail(track.id);
        if (detail) {
          if (type === "artist" && detail.ar?.[0]?.id) {
            id = String(detail.ar[0].id);
          } else if (type === "album" && detail.al?.id) {
            id = String(detail.al.id);
          }

          if (type === "album" && track.source === "bilibili") {
            if (track.album_id?.startsWith("bilibili_")) {
              id = track.album_id;
            } else if (detail.ugc_season?.id) {
              const ownerMid = detail.owner?.mid;
              id = buildBilibiliSeriesAlbumId(detail.ugc_season.id, ownerMid);
            } else if (detail.pages && detail.pages.length > 1) {
              const parsed = parseBilibiliTrackId(track.id);
              if (parsed?.bvid) {
                id = buildBilibiliMultiPAlbumId(parsed.bvid);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to get song detail", e);
      }
    }

    if (
      (provider.getArtistDetail || provider.getAlbumDetail) &&
      id &&
      id !== "0"
    ) {
      if (type === "artist" && provider.getArtistDetail) {
        navigate(`/netease-artist/${id}`);
        onOpenChange(false);
        setShowArtistSelection(false);
        onNavigate?.();
        return;
      }
      if (type === "album" && provider.getAlbumDetail) {
        const targetPath =
          track.source === "bilibili" &&
          (id?.startsWith("bilibili_S_") ||
            id?.startsWith("bilibili_O_") ||
            id?.startsWith("bilibili_V_"))
            ? `/bilibili-collection/${id}`
            : `/netease-album/${id}`;
        navigate(targetPath);
        onOpenChange(false);
        onNavigate?.();
        return;
      }
    }

    const searchKeyword =
      type === "album" && artist ? `${keyword} ${artist}` : keyword;

    setSearchQuery(searchKeyword);
    if (type) {
      setSearchIntent({
        type,
        artist,
        id,
        name: keyword,
      });
    } else {
      setSearchIntent(null);
    }
    if (track.source && track.source !== "local") {
      setSearchSource(provider.searchArtist ? track.source : "all");
    }
    setSearchResults([]);
    navigate("/search");
    onOpenChange(false);
    setShowArtistSelection(false);
    onNavigate?.();
  };

  const triggerButton = (
    <Button
      size="icon"
      variant="ghost"
      className={cn("h-8 w-8", triggerClassName)}
      onClick={(e) => e.stopPropagation()}
      title="更多"
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  const menuContent = (
    <>
      <div className="flex items-center gap-4 px-5 py-4 md:px-4 md:py-3">
        <MusicCover
          src={coverUrl}
          alt={track.name}
          className="h-16 w-16 rounded-lg shadow-md md:h-12 md:w-12"
          iconClassName="h-8 w-8 md:h-6 md:w-6"
        />
        <div className="min-w-0">
          <div className="line-clamp-2 text-lg font-bold md:text-base md:font-semibold">
            {track.name}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {track.artist.join(" / ")}
            {track.album && ` - ${track.album}`}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 md:gap-1 md:p-3">
        {onToggleLike && (
          <ActionButton
            icon={Heart}
            onClick={() => {
              onToggleLike();
              onOpenChange(false);
            }}
            className={isFavorite ? "text-primary [&>svg]:fill-primary" : ""}
          >
            {isFavorite ? "取消喜欢" : "喜欢"}
          </ActionButton>
        )}
        {onDownload && (
          <ActionButton
            icon={Download}
            onClick={() => {
              onDownload();
              onOpenChange(false);
            }}
          >
            下载
          </ActionButton>
        )}
        {onAddToPlaylist && (
          <ActionButton
            icon={ListPlus}
            onClick={() => {
              onAddToPlaylist();
              onOpenChange(false);
            }}
          >
            添加到歌单
          </ActionButton>
        )}
        {onAddToNextPlay && (
          <ActionButton
            icon={CornerDownRight}
            onClick={() => {
              onAddToNextPlay();
              onOpenChange(false);
            }}
          >
            下一首播放
          </ActionButton>
        )}

        {provider.getComments && (
          <ActionButton
            icon={MessageSquareQuote}
            onClick={() => {
              onOpenChange(false);
              setShowComments(true);
            }}
          >
            评论
          </ActionButton>
        )}

        {track.source !== "podcast" && track.artist?.length > 0 && (
          <ActionButton
            icon={User}
            onClick={() => {
              if (track.artist.length > 1) {
                setShowArtistSelection(true);
              } else {
                handleSearch(
                  track.artist[0],
                  "artist",
                  undefined,
                  track.artist_ids?.[0]
                );
              }
            }}
          >
            歌手：{track.artist.join(" / ")}
          </ActionButton>
        )}

        {track.source !== "podcast" && track.album && (
          <ActionButton
            icon={Disc}
            onClick={() => {
              handleSearch(
                track.album,
                "album",
                track.artist[0],
                track.album_id
              );
            }}
          >
            专辑：{track.album}
          </ActionButton>
        )}

        <ActionButton
          icon={Link2}
          onClick={() =>
            handleSearch(`${track.name} ${track.artist[0] || ""}`.trim())
          }
        >
          <Link2 className="mr-2 h-4 w-4" /> 音源：
          {sourceLabels[track.source] || track.source}
        </ActionButton>

        {onRemove && (
          <ActionButton
            icon={Trash2}
            className="text-destructive hover:text-destructive"
            onClick={() => {
              onOpenChange(false);
              if (
                !confirmRemove ||
                window.confirm(`确定${removeLabel}《${track.name}》吗？`)
              ) {
                onRemove();
              }
            }}
          >
            {removeLabel}
          </ActionButton>
        )}

        {customActions && (
          <div className="flex flex-col gap-2">{customActions}</div>
        )}
      </div>
    </>
  );

  return (
    <div>
      {!isMobile ? (
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={10}
            collisionPadding={24}
            className="w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border bg-popover p-0 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">歌曲菜单</span>
            {menuContent}
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent onClick={(e) => e.stopPropagation()}>
            <DrawerTitle className="sr-only">歌曲菜单</DrawerTitle>
            {menuContent}
          </DrawerContent>
        </Drawer>
      )}

      <Dialog open={showArtistSelection} onOpenChange={setShowArtistSelection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择歌手</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {track.artist.map((artist, index) => (
              <Button
                key={artist}
                variant="ghost"
                className="w-full justify-start"
                onClick={() =>
                  handleSearch(
                    artist,
                    "artist",
                    undefined,
                    track.artist_ids?.[index]
                  )
                }
              >
                <User className="mr-2 h-4 w-4" />
                {artist}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <MusicCommentsDrawer
        track={track}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </div>
  );
}

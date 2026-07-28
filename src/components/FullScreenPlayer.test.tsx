import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { FullScreenPlayer } from "./FullScreenPlayer";
import { useMusicStore } from "@/store/music-store";
import type { MusicTrack } from "@/types/music";

vi.mock("@/lib/storage-adapter", () => ({
  idbStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock("react-color-extractor", () => ({
  ColorExtractor: () => null,
}));

vi.mock("@/components/MusicTrackMobileMenu", () => ({
  MusicTrackMobileMenu: () => null,
}));

vi.mock("@/components/AddToPlaylistDrawer", () => ({
  AddToPlaylistDrawer: () => null,
}));

vi.mock("@/components/PlayerQueueDrawer", () => ({
  PlayerQueueDrawer: ({ trigger }: { trigger: React.ReactNode }) => trigger,
}));

vi.mock("@/components/settings/QualityDrawer", () => ({
  QualityDrawer: () => null,
}));

vi.mock("@/components/settings/PlaybackSpeedDrawer", () => ({
  PlaybackSpeedDrawer: () => null,
}));

vi.mock("@/components/settings/SleepTimerDrawer", () => ({
  SleepTimerDrawer: () => null,
}));

vi.mock("@/components/LyricsPanel", () => ({
  LyricsPanel: () => <div />,
}));

vi.mock("@/components/MusicCover", () => ({
  MusicCover: () => <div data-testid="cover" />,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/utils/toast", () => ({
  toastUtils: {
    info: vi.fn(),
  },
}));

const track: MusicTrack = {
  id: "track-1",
  name: "Payphone",
  artist: ["Maroon 5"],
  album: "Album",
  pic_id: "pic-1",
  url_id: "url-1",
  lyric_id: "lyric-1",
  source: "cq_kg",
};

describe("FullScreenPlayer", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    vi.clearAllMocks();
    useMusicStore.setState({
      queue: [track],
      currentIndex: 0,
      coverUrl: null,
      quality: "192",
      isPlaying: true,
      isLoading: false,
      isRepeat: false,
      isShuffle: false,
      fullScreenBackgroundMode: "theme",
      playbackSpeed: 1,
      sleepTimerIsActive: false,
      sleepTimerRemaining: 0,
      currentAudioUrl: null,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = undefined;
    container = undefined;
    document.body.innerHTML = "";
  });

  it("keeps the fullscreen player opaque above the underlying page", () => {
    act(() => {
      root?.render(<FullScreenPlayer isFullScreen onClose={vi.fn()} />);
    });

    const portal = Array.from(document.body.children).find((element) =>
      element.className.includes("fixed inset-0")
    );

    expect(portal).toBeDefined();
    expect(portal?.className).toContain("bg-zinc-950");
  });
});

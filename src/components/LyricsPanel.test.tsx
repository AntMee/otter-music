import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LyricsPanel } from "./LyricsPanel";
import type { MusicTrack } from "@/types/music";

const { getLyricMock } = vi.hoisted(() => ({
  getLyricMock: vi.fn(),
}));

vi.mock("@/lib/music-api", () => ({
  musicApi: {
    getLyric: getLyricMock,
  },
}));

vi.mock("@/store/music-store", () => ({
  useMusicStore: vi.fn(() => ({
    currentAudioTime: 0,
    seek: vi.fn(),
    seekTimestamp: 0,
  })),
}));

const bilibiliTrack: MusicTrack = {
  id: "bilibili_BV1xx411c7mD",
  name: "Test Bilibili Video",
  artist: [""],
  album: "",
  pic_id: "https://example.com/pic.jpg",
  url_id: "bilibili_BV1xx411c7mD",
  lyric_id: "",
  source: "bilibili",
};

const neteaseTrack: MusicTrack = {
  id: "netease_123456",
  name: "Test Song",
  artist: ["Artist"],
  album: "Album",
  pic_id: "pic-1",
  url_id: "url-1",
  lyric_id: "lyric-1",
  source: "netease",
};

const kuwoTrack: MusicTrack = {
  ...neteaseTrack,
  id: "kuwo_654321",
  name: "Next Song",
  lyric_id: "lyric-2",
  source: "kuwo",
};

describe("LyricsPanel", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    getLyricMock.mockResolvedValue({
      lyric: "[00:00.00]第一首歌词",
      tlyric: "",
    });
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  const renderPanel = (track: MusicTrack | null) => {
    act(() => {
      root!.render(<LyricsPanel track={track} />);
    });
  };

  const cleanup = () => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    container?.remove();
    root = undefined;
    container = undefined;
  };

  it("shows an empty prompt when track is null", () => {
    renderPanel(null);
    expect(container?.textContent).toContain("选择歌曲查看歌词");
    cleanup();
  });

  it("shows no lyrics for Bilibili tracks without lyric_id", async () => {
    renderPanel(bilibiliTrack);

    await act(async () => {
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container?.textContent).toContain("暂无歌词");
    cleanup();
  });

  it("does not stay loading when lyric_id is empty", async () => {
    renderPanel(bilibiliTrack);

    await act(async () => {
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container?.textContent).not.toContain("加载歌词中...");
    cleanup();
  });

  it("shows loading while lyrics are being fetched", () => {
    renderPanel(neteaseTrack);
    expect(container?.textContent).toContain("加载歌词中...");
    cleanup();
  });

  it("reloads lyrics when the current track changes", async () => {
    getLyricMock
      .mockResolvedValueOnce({ lyric: "[00:00.00]第一首歌词", tlyric: "" })
      .mockResolvedValueOnce({ lyric: "[00:00.00]第二首歌词", tlyric: "" });

    renderPanel(neteaseTrack);
    await act(async () => {
      await Promise.resolve();
    });
    expect(container?.textContent).toContain("第一首歌词");

    renderPanel(kuwoTrack);
    expect(container?.textContent).toContain("加载歌词中...");

    await act(async () => {
      await Promise.resolve();
    });

    expect(getLyricMock).toHaveBeenNthCalledWith(1, "lyric-1", "netease");
    expect(getLyricMock).toHaveBeenNthCalledWith(2, "lyric-2", "kuwo");
    expect(container?.textContent).toContain("第二首歌词");
    cleanup();
  });
});

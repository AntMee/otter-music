import { describe, expect, it, vi } from "vitest";
import { ChangqingProvider } from "./changqing-provider";
import type { IMusicProvider } from "../interface";
import type { MusicTrack } from "@/types/music";

const track: MusicTrack = {
  id: "123",
  name: "Song",
  artist: ["Artist"],
  album: "",
  pic_id: "",
  url_id: "123",
  lyric_id: "123",
  source: "cq_kw",
};

describe("ChangqingProvider", () => {
  it("falls back to existing track cover when base provider cover lookup fails", async () => {
    const provider = new ChangqingProvider(
      "cq_kw",
      createBaseProvider({
        getPic: vi.fn().mockRejectedValue(new Error("cover failed")),
      })
    );

    await expect(
      provider.getPic({ ...track, pic_id: "https://img.example/a.jpg" })
    ).resolves.toBe("https://img.example/a.jpg");
  });

  it("returns null when lyric lookup fails", async () => {
    const provider = new ChangqingProvider(
      "cq_kw",
      createBaseProvider({
        getLyric: vi.fn().mockRejectedValue(new Error("lyric failed")),
      })
    );

    await expect(provider.getLyric(track)).resolves.toBeNull();
  });
});

function createBaseProvider(
  overrides: Partial<IMusicProvider> = {}
): IMusicProvider {
  return {
    source: "kuwo",
    search: vi.fn(),
    getUrl: vi.fn(),
    getPic: vi.fn().mockResolvedValue(null),
    getLyric: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as IMusicProvider;
}

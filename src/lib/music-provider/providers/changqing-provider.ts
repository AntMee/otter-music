import type { IMusicProvider } from "../interface";
import type {
  MusicTrack,
  SearchIntent,
  SearchPageResult,
  SongLyric,
} from "@/types/music";
import { buildChangqingMusicUrl } from "@/lib/changqing-url";

type ChangqingMusicSource = "cq_kg" | "cq_qq" | "cq_wy" | "cq_kw" | "cq_mg";

export class ChangqingProvider implements IMusicProvider {
  source: ChangqingMusicSource;

  constructor(
    source: ChangqingMusicSource,
    private readonly baseProvider: IMusicProvider
  ) {
    this.source = source;
  }

  private withSource<T extends MusicTrack>(
    result: SearchPageResult<T>
  ): SearchPageResult<MusicTrack> {
    return {
      ...result,
      items: result.items.map((track) => ({
        ...track,
        source: this.source,
      })),
    };
  }

  async search(
    query: string,
    page: number,
    count: number,
    signal?: AbortSignal,
    intent?: SearchIntent | null
  ): Promise<SearchPageResult<MusicTrack>> {
    const result = await this.baseProvider.search(
      query,
      page,
      count,
      signal,
      intent
    );
    return this.withSource(result);
  }

  async getUrl(track: MusicTrack, br?: number): Promise<string | null> {
    return buildChangqingMusicUrl({ source: this.source, track, br });
  }

  async getPic(track: MusicTrack, size?: number): Promise<string | null> {
    if (track.pic_id) return track.pic_id;
    try {
      return await this.baseProvider.getPic(track, size);
    } catch {
      return null;
    }
  }

  async getLyric(track: MusicTrack): Promise<SongLyric | null> {
    try {
      return await this.baseProvider.getLyric(track);
    } catch {
      return null;
    }
  }

  async searchArtist(
    query: string,
    page: number,
    count: number
  ): Promise<SearchPageResult<MusicTrack>> {
    if (!this.baseProvider.searchArtist) return this.search(query, page, count);
    return this.withSource(
      await this.baseProvider.searchArtist(query, page, count)
    );
  }

  async searchAlbum(
    query: string,
    page: number,
    count: number
  ): Promise<SearchPageResult<MusicTrack>> {
    if (!this.baseProvider.searchAlbum) return this.search(query, page, count);
    return this.withSource(
      await this.baseProvider.searchAlbum(query, page, count)
    );
  }
}

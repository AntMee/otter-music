import { toast } from "react-hot-toast";
import { useMusicStore } from "@/store/music-store";
import {
  EXCLUDED_FOR_SEARCH,
  getAggregatedSourcesForMatch,
} from "@/hooks/use-aggregated-sources";
import { musicApi } from "@/lib/music-api";
import { sourceLabels, type MusicTrack } from "@/types/music";
import {
  isNameMatch,
  isArtistMatch,
  normalizeArtists,
  normalizeText,
  convertT2SOnly,
} from "./utils/music-key";
import { logger } from "@/lib/logger";

const AUTO_MATCH_TIMEOUT_MS = 12000;

function buildPlaybackFallbackTrack(
  original: MusicTrack,
  match: MusicTrack
): MusicTrack {
  return {
    ...match,
    name: original.name,
    artist: original.artist,
    album: original.album || match.album,
    pic_id: match.pic_id || original.pic_id,
    artist_ids: original.artist_ids || match.artist_ids,
    album_id: original.album_id || match.album_id,
  };
}

function scoreAutoMatchCandidate(
  target: MusicTrack,
  candidate: MusicTrack,
  originalIndex: number
): number {
  let score = 0;
  const sameArtistSet =
    normalizeArtists(target.artist).join("/") ===
    normalizeArtists(candidate.artist).join("/");

  if (sameArtistSet) {
    score += 100;
  } else {
    const targetArtists = new Set(normalizeArtists(target.artist));
    const candidateArtists = new Set(normalizeArtists(candidate.artist));
    for (const artist of targetArtists) {
      if (candidateArtists.has(artist)) {
        score += 40;
        break;
      }
    }
  }

  if (normalizeText(target.name) === normalizeText(candidate.name)) {
    score += 100;
  }

  if (convertT2SOnly(target.name) === convertT2SOnly(candidate.name)) {
    score += 50;
  }

  score += Math.max(0, 20 - originalIndex);

  return score;
}

export async function handleAutoMatch(track: MusicTrack): Promise<boolean> {
  if (track.source && EXCLUDED_FOR_SEARCH.includes(track.source)) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, AUTO_MATCH_TIMEOUT_MS);
  const toastId = toast.loading("正在搜索免费音源...", {
    id: `auto-match-${track.id}`,
  });

  try {
    const { updateTrackInQueue } = useMusicStore.getState();
    const aggregatedSources = getAggregatedSourcesForMatch().filter(
      (source) => source !== track.source
    );

    if (aggregatedSources.length === 0) {
      toast.dismiss(toastId);
      return false;
    }

    const match = await musicApi.searchBestMatch({
      query: `${track.name} ${track.artist[0] || ""}`.trim(),
      sources: aggregatedSources,
      signal: controller.signal,
      predicate: (item: MusicTrack) => {
        if (!isNameMatch(track.name, item.name)) return false;
        return isArtistMatch(track.artist, item.artist);
      },
      ranker: (item, originalIndex) =>
        scoreAutoMatchCandidate(track, item, originalIndex),
      targetTrack: track,
    });

    if (!match) {
      toast.error("未找到可用音源", { id: toastId });
      return false;
    }

    const finalTrack = buildPlaybackFallbackTrack(track, match);
    updateTrackInQueue(track.id, finalTrack);

    const sourceLabel = sourceLabels[match.source] || match.source;
    toast.success(`已自动切换至: ${sourceLabel}`, { id: toastId });
    return true;
  } catch (error) {
    if (controller.signal.aborted) {
      logger.warn("audio-match", "Auto match timed out", {
        trackId: track.id,
        source: track.source,
      });
      toast.error("自动匹配超时", { id: toastId });
      return false;
    }

    logger.error("audio-match", "Auto match failed", error);
    toast.error("自动匹配失败", { id: toastId });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

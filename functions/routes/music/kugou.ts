import { Hono } from "hono";
import type { Env } from "../../types/hono";
import {
  fetchKugouPlaylistDetail,
  resolveKugouShortUrl,
} from "../../utils/music/kugou-api";

export const kugouRoutes = new Hono<{ Bindings: Env }>();

const KUGOU_CODE_UPSTREAMS = {
  "code-command": "http://t.kugou.com/command/",
  "code-playlist": "http://www2.kugou.kugou.com/apps/kucodeAndShare/app/",
} as const;

async function proxyKugouCodeRequest(
  body: unknown,
  target: (typeof KUGOU_CODE_UPSTREAMS)[keyof typeof KUGOU_CODE_UPSTREAMS]
) {
  return fetch(target, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

for (const [route, target] of Object.entries(KUGOU_CODE_UPSTREAMS)) {
  kugouRoutes.post(`/${route}`, async (c) => {
    try {
      const upstream = await proxyKugouCodeRequest(await c.req.json(), target);
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Kugou ${route} proxy error:`, error);
      return c.json({ error: "Kugou code proxy failed" }, 502);
    }
  });
}

/**
 * 解析酷狗分享短链。
 */
kugouRoutes.post("/resolve-shortlink", async (c) => {
  const { url } = await c.req.json<{ url: string }>();
  if (!url) return c.json({ error: "url required" }, 400);

  try {
    const resolvedUrl = await resolveKugouShortUrl(url);
    if (!resolvedUrl)
      return c.json({ error: "unable to resolve short link" }, 400);
    return c.json({ resolvedUrl });
  } catch (e: any) {
    console.error("Kugou short URL resolve error:", e);
    return c.json({ error: e.message || "Internal error" }, 500);
  }
});

/**
 * 获取酷狗公开歌单详情。
 */
kugouRoutes.post("/playlist", async (c) => {
  const { playlistId } = await c.req.json<{ playlistId: string }>();
  if (!playlistId) return c.json({ error: "playlistId required" }, 400);

  try {
    return c.json(await fetchKugouPlaylistDetail(playlistId));
  } catch (e: any) {
    console.error("Kugou API error:", e);
    return c.json({ error: e.message || "Internal error" }, 500);
  }
});

import type { IncomingMessage, ServerResponse } from 'http';
import { redis, statsKeys } from './_redis.js';
import { json, readJson } from './_util.js';

type LikeBody = {
  id?: string;
  deviceId?: string;
};

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });

  let body: LikeBody;
  try {
    body = await readJson<LikeBody>(req);
  } catch {
    return json(res, 400, { error: 'Invalid JSON' });
  }

  const itemId = String(body.id ?? '').trim();
  const deviceId = String(body.deviceId ?? '').trim();

  if (!itemId) return json(res, 400, { error: 'Missing id' });
  if (!deviceId) return json(res, 400, { error: 'Missing deviceId' });

  const viewsKey = statsKeys.views(itemId);
  const likesSetKey = statsKeys.likesSet(itemId);

  const currentlyLiked = await redis.sismember(likesSetKey, deviceId);
  if (currentlyLiked) {
    await redis.srem(likesSetKey, deviceId);
  } else {
    await redis.sadd(likesSetKey, deviceId);
  }

  const [viewsRaw, likes] = await Promise.all([redis.get<number>(viewsKey), redis.scard(likesSetKey)]);
  const views = typeof viewsRaw === 'number' ? viewsRaw : 0;

  return json(res, 200, {
    id: itemId,
    views,
    likes,
    liked: !currentlyLiked,
  });
}

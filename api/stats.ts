import type { IncomingMessage, ServerResponse } from 'http';
import { redis, statsKeys } from './_redis.js';
import { json } from './_util.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

  const url = new URL(req.url ?? '', 'http://localhost');
  const itemId = url.searchParams.get('id') ?? '';
  const deviceId = url.searchParams.get('deviceId') ?? '';

  if (!itemId) return json(res, 400, { error: 'Missing id' });

  const viewsKey = statsKeys.views(itemId);
  const likesSetKey = statsKeys.likesSet(itemId);

  const [viewsRaw, likes, liked] = await Promise.all([
    redis.get<number>(viewsKey),
    redis.scard(likesSetKey),
    deviceId ? redis.sismember(likesSetKey, deviceId) : Promise.resolve(false),
  ]);

  const views = typeof viewsRaw === 'number' ? viewsRaw : 0;

  return json(res, 200, {
    id: itemId,
    views,
    likes,
    liked: Boolean(liked),
  });
}

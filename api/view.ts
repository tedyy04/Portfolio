import type { IncomingMessage, ServerResponse } from 'http';
import { redis, statsKeys } from './_redis.js';
import { json, readJson } from './_util.js';

type ViewBody = {
  id?: string;
  deviceId?: string;
};

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });

  let body: ViewBody;
  try {
    body = await readJson<ViewBody>(req);
  } catch {
    return json(res, 400, { error: 'Invalid JSON' });
  }

  const itemId = String(body.id ?? '').trim();
  const deviceId = String(body.deviceId ?? '').trim();

  if (!itemId) return json(res, 400, { error: 'Missing id' });

  const viewsKey = statsKeys.views(itemId);
  const likesSetKey = statsKeys.likesSet(itemId);

  const views = await redis.incr(viewsKey);
  const [likes, liked] = await Promise.all([
    redis.scard(likesSetKey),
    deviceId ? redis.sismember(likesSetKey, deviceId) : Promise.resolve(false),
  ]);

  return json(res, 200, {
    id: itemId,
    views,
    likes,
    liked: Boolean(liked),
  });
}

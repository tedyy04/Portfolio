import { Redis } from '@upstash/redis';

const restUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_API_URL ||
  '';

const restToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_API_TOKEN ||
  '';

export const redis = restUrl && restToken ? new Redis({ url: restUrl, token: restToken }) : Redis.fromEnv();

export const statsKeys = {
  views: (itemId: string) => `stats:views:${itemId}`,
  likesSet: (itemId: string) => `stats:likes:set:${itemId}`,
};

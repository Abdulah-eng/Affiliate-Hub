import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const getRedisClient = () => {
  if (globalForRedis.redis) return globalForRedis.redis;
  
  // Try to connect, but don't fail immediately if Redis is down (for development)
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying
      }
      return 1000;
    },
  });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = client;
  }
  
  return client;
};

export const redis = getRedisClient();

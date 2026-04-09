import Redis from 'ioredis';

// In-memory store for development fallback
const mockStore: Record<string, any> = {};

class MockRedis {
  async get(key: string) { return mockStore[key] || null; }
  async set(key: string, value: string, ...args: any[]) { 
    mockStore[key] = value; 
    return 'OK'; 
  }
  async del(key: string) { delete mockStore[key]; return 1; }
  
  // Lists
  async lrange(key: string, start: number, stop: number) {
    const list = mockStore[key] || [];
    if (!Array.isArray(list)) return [];
    if (stop === -1) return list.slice(start);
    return list.slice(start, stop + 1);
  }
  async lpush(key: string, ...values: string[]) {
    if (!Array.isArray(mockStore[key])) mockStore[key] = [];
    mockStore[key].unshift(...values.reverse());
    return mockStore[key].length;
  }
  async rpush(key: string, ...values: string[]) {
    if (!Array.isArray(mockStore[key])) mockStore[key] = [];
    mockStore[key].push(...values);
    return mockStore[key].length;
  }
  async ltrim(key: string, start: number, stop: number) {
    const list = mockStore[key] || [];
    if (!Array.isArray(list)) return 'OK';
    if (stop === -1) mockStore[key] = list.slice(start);
    else mockStore[key] = list.slice(start, stop + 1);
    return 'OK';
  }
  async lrem(key: string, count: number, value: string) {
    const list = mockStore[key] || [];
    if (!Array.isArray(list)) return 0;
    const initialLen = list.length;
    mockStore[key] = list.filter(v => v !== value);
    return initialLen - mockStore[key].length;
  }
  async lpop(key: string) {
    const list = mockStore[key] || [];
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.shift();
  }

  pipeline() {
    const commands: any[] = [];
    return {
      lpush: (key: string, val: string) => { commands.push(() => this.lpush(key, val)); return this; },
      rpush: (key: string, val: string) => { commands.push(() => this.rpush(key, val)); return this; },
      exec: async () => {
        const results = [];
        for (const cmd of commands) results.push([null, await cmd()]);
        return results;
      }
    };
  }

  on() { return this; } // Dummy event handler
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | MockRedis | undefined;
};

const getRedisClient = () => {
  if (globalForRedis.redis) return globalForRedis.redis;
  
  if (process.env.NODE_ENV === 'production') {
    return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  // Development: Try to connect but fallback to mock on error
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 0, // Fail fast to trigger fallback
    retryStrategy() { return null; },
  });

  // Since we are in dev and ioredis doesn't make it easy to swap the instance 
  // on a shared singleton after export, we'll wrap it or just use a proxy.
  // A simpler way for this scale: 
  const mockProxy = new MockRedis();
  let useMock = false;

  client.on('error', (err) => {
    if (!useMock) {
      console.warn('⚠️ Redis connection failed. Falling back to In-Memory Mock for development.');
      useMock = true;
    }
  });

  const handler = {
    get(target: any, prop: string) {
      if (useMock) return (mockProxy as any)[prop];
      const val = target[prop];
      if (typeof val === 'function') return val.bind(target);
      return val;
    }
  };

  const proxiedClient = new Proxy(client, handler) as unknown as Redis;

  if ((process.env.NODE_ENV as string) !== 'production') {
    globalForRedis.redis = proxiedClient;
  }
  
  return proxiedClient;
};

export const redis = getRedisClient();

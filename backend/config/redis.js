const Redis = require("ioredis");

const REDIS_ENABLED = process.env.ENABLE_REDIS === "true" || process.env.REDIS_ENABLED === "true";
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let redisClient = null;
let isRedisAvailable = false;

if (REDIS_ENABLED) {
  try {
    redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          return null; // berhenti reconnect jika redis server tidak berjalan
        }
        return Math.min(times * 100, 1000);
      },
    });

    redisClient.connect().then(() => {
      isRedisAvailable = true;
      console.log(`[Redis] Terhubung ke ${REDIS_HOST}:${REDIS_PORT}`);
    }).catch((err) => {
      isRedisAvailable = false;
      console.warn(`[Redis] Server tidak aktif (${err.message}). Menggunakan mode passthrough tanpa cache.`);
    });

    redisClient.on("error", () => {
      isRedisAvailable = false;
    });

    redisClient.on("connect", () => {
      isRedisAvailable = true;
    });
  } catch (e) {
    isRedisAvailable = false;
  }
}

/**
 * Helper cache get
 */
const getCache = async (key) => {
  if (!isRedisAvailable || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

/**
 * Helper cache set dengan TTL (default 5 menit = 300 detik)
 */
const setCache = async (key, value, ttlSeconds = 300) => {
  if (!isRedisAvailable || !redisClient) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Helper invalidate cache berdasarkan pola prefix (misal 'pengajuan:*')
 */
const invalidateCache = async (pattern) => {
  if (!isRedisAvailable || !redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Express middleware untuk auto-cache GET requests
 */
const cacheMiddleware = (prefix = "api", ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET" || !isRedisAvailable) {
      return next();
    }

    const key = `${prefix}:${req.originalUrl || req.url}`;
    const cached = await getCache(key);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        setCache(key, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  invalidateCache,
  cacheMiddleware,
};


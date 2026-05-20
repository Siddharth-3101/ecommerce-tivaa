import { createClient } from "redis";

let redisClient;

let isRedisDisabled = false;

export const initCache = async () => {
    redisClient = createClient({
        socket: {
            reconnectStrategy: false
        }
    });
    
    redisClient.on("error", (err) => {
        if (!isRedisDisabled) {
            console.warn("Redis caching disabled (not running or error):", err.message);
            isRedisDisabled = true;
        }
        redisClient = null;
    });

    try {
        await redisClient.connect();
        console.log("Redis connected");
    } catch (err) {
        redisClient = null;
        isRedisDisabled = true;
    }
};

export const getCache = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return null; // fail gracefully
    }
};

export const setCache = async (key, value, expireTime = 300) => {
    if (!redisClient) return;
    try {
        await redisClient.setEx(key, expireTime, JSON.stringify(value));
    } catch (err) {
        // fail gracefully
    }
};

export const clearCache = async (prefix) => {
    if (!redisClient) return;
    try {
        // Simple flush or scan
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) { } // fail gracefully
};

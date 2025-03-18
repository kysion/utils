/**
 * HTTP请求缓存工具
 * 提供请求缓存的存取功能
 */

import type { HttpRequestConfig, HttpResponse } from './types';
import { getHttpConfig } from './config';

// 默认缓存前缀
const CACHE_PREFIX = 'http_cache:';

// 内存缓存，用于优化性能
const memoryCache = new Map<string, {
    data: HttpResponse<any>;
    expireAt: number;
}>();

// 一个测试模式的标志，用于测试环境
let isTestMode = false;

// 标记是否使用增强存储
let useEnhancedStorage = false;
let enhancedStorage: any = null;

/**
 * 启用测试模式，禁用内存缓存以便测试
 */
export function enableTestMode(): void {
    isTestMode = true;
    memoryCache.clear();
}

/**
 * 禁用测试模式
 */
export function disableTestMode(): void {
    isTestMode = false;
}

/**
 * 初始化使用增强的存储实现
 * @param storage 增强的存储实现
 */
export function initWithEnhancedStorage(storage: any): void {
    useEnhancedStorage = true;
    enhancedStorage = storage;
}

/**
 * 生成缓存键
 * @param config 请求配置
 */
export function getCacheKey(config: HttpRequestConfig): string {
    const { url = '', method = 'GET', params, data } = config;
    const key = `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
    return key;
}

/**
 * 获取缓存 - 增强版实现
 */
async function getEnhancedCache<T>(key: string): Promise<HttpResponse<T> | null> {
    try {
        // 首先检查内存缓存
        const memCache = memoryCache.get(key);
        if (memCache) {
            if (Date.now() < memCache.expireAt) {
                return memCache.data as HttpResponse<T>;
            } else {
                // 过期了，从内存缓存中删除
                memoryCache.delete(key);
            }
        }

        // 从增强存储中获取
        const cacheData = enhancedStorage.get(key);
        if (!cacheData) return null;

        // 添加到内存缓存以提高性能
        if (cacheData.expireAt) {
            memoryCache.set(key, {
                data: cacheData,
                expireAt: cacheData.expireAt
            });
        }

        return cacheData as HttpResponse<T>;
    } catch (error) {
        console.warn('Enhanced cache retrieval error:', error);
        return null;
    }
}

/**
 * 获取缓存 - 标准实现
 */
async function getStandardCache<T>(key: string): Promise<HttpResponse<T> | null> {
    try {
        // 在非测试模式下首先检查内存缓存
        if (!isTestMode) {
            const memCache = memoryCache.get(key);
            if (memCache) {
                if (Date.now() < memCache.expireAt) {
                    return memCache.data as HttpResponse<T>;
                } else {
                    // 过期了，从内存缓存中删除
                    memoryCache.delete(key);
                }
            }
        }

        // 从localStorage获取
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const cache = localStorage.getItem(cacheKey);
        if (!cache) return null;

        try {
            const { data, expireAt } = JSON.parse(cache);

            // 检查是否过期
            if (Date.now() > expireAt) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            // 添加到内存缓存 (在非测试模式下)
            if (!isTestMode) {
                memoryCache.set(key, {
                    data,
                    expireAt
                });
            }

            return data;
        } catch (jsonError) {
            // JSON解析错误
            localStorage.removeItem(cacheKey);
            return null;
        }
    } catch (error) {
        return null;
    }
}

/**
 * 获取缓存
 * @param key 缓存键
 */
export async function getCache<T>(key: string): Promise<HttpResponse<T> | null> {
    return useEnhancedStorage
        ? getEnhancedCache<T>(key)
        : getStandardCache<T>(key);
}

/**
 * 设置缓存 - 增强版实现
 */
async function setEnhancedCache<T>(
    key: string,
    data: HttpResponse<T>,
    cacheTime?: number
): Promise<void> {
    try {
        const { defaultCacheTime } = getHttpConfig();
        const expireTime = cacheTime || defaultCacheTime || 5 * 60 * 1000; // 默认5分钟
        const expireAt = Date.now() + expireTime;

        // 添加过期时间到响应对象
        const cachedResponse = {
            ...data,
            expireAt
        };

        // 保存到内存缓存
        memoryCache.set(key, {
            data: cachedResponse,
            expireAt
        });

        // 保存到增强存储
        enhancedStorage.put({
            key,
            data: cachedResponse,
            expirationMillis: expireTime
        });
    } catch (error) {
        console.error('Enhanced cache set error:', error);
    }
}

/**
 * 设置缓存 - 标准实现
 */
async function setStandardCache<T>(
    key: string,
    data: HttpResponse<T>,
    cacheTime?: number
): Promise<void> {
    try {
        const { defaultCacheTime } = getHttpConfig();
        const expireTime = cacheTime || defaultCacheTime || 5 * 60 * 1000; // 默认5分钟
        const expireAt = Date.now() + expireTime;

        // 添加过期时间到响应对象
        const cachedResponse = {
            ...data,
            expireAt
        };

        // 保存到内存缓存
        memoryCache.set(key, {
            data: cachedResponse,
            expireAt
        });

        const cache = {
            data,
            expireAt
        };
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cache));
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param data 缓存数据
 * @param cacheTime 缓存时间（毫秒）
 */
export async function setCache<T>(
    key: string,
    data: HttpResponse<T>,
    cacheTime?: number
): Promise<void> {
    return useEnhancedStorage
        ? setEnhancedCache(key, data, cacheTime)
        : setStandardCache(key, data, cacheTime);
}

/**
 * 清除指定缓存 - 增强版实现
 */
function clearEnhancedCache(key: string): void {
    try {
        // 从内存缓存中删除
        memoryCache.delete(key);

        // 从增强存储中删除
        enhancedStorage.remove(key);
    } catch (error) {
        console.error('Clear enhanced cache error:', error);
    }
}

/**
 * 清除指定缓存 - 标准实现
 */
function clearStandardCache(key: string): void {
    // 从内存缓存中删除
    memoryCache.delete(key);
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

/**
 * 清除指定缓存
 * @param key 缓存键
 */
export function clearCache(key: string): void {
    return useEnhancedStorage
        ? clearEnhancedCache(key)
        : clearStandardCache(key);
}

/**
 * 清除所有缓存 - 增强版实现
 */
function clearAllEnhancedCache(): void {
    try {
        // 清除内存缓存
        memoryCache.clear();

        // 重置增强存储
        enhancedStorage.reset();
    } catch (error) {
        console.error('Clear all enhanced cache error:', error);
    }
}

/**
 * 清除所有缓存 - 标准实现
 */
function clearAllStandardCache(): void {
    // 清除内存缓存
    memoryCache.clear();

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
    return useEnhancedStorage
        ? clearAllEnhancedCache()
        : clearAllStandardCache();
}

/**
 * 清除过期缓存 - 增强版实现
 */
function clearExpiredEnhancedCache(): void {
    try {
        const now = Date.now();

        // 清除内存中的过期缓存
        for (const [key, value] of memoryCache.entries()) {
            if (value.expireAt < now) {
                memoryCache.delete(key);
            }
        }

        // 增强存储会自动处理过期项
    } catch (error) {
        console.error('Clear expired enhanced cache error:', error);
    }
}

/**
 * 清除过期缓存 - 标准实现
 */
function clearExpiredStandardCache(): void {
    const now = Date.now();

    // 清除内存中的过期缓存
    for (const [key, value] of memoryCache.entries()) {
        if (value.expireAt < now) {
            memoryCache.delete(key);
        }
    }

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
            try {
                const cache = localStorage.getItem(key);
                if (cache) {
                    const { expireAt } = JSON.parse(cache);
                    if (expireAt < now) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (error) {
                // 无效的缓存项，直接删除
                localStorage.removeItem(key);
            }
        }
    });
}

/**
 * 清除过期缓存
 */
export function clearExpiredCache(): void {
    return useEnhancedStorage
        ? clearExpiredEnhancedCache()
        : clearExpiredStandardCache();
}
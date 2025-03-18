/**
 * HTTP请求缓存工具
 * 提供请求缓存的存取功能
 */
import { getHttpConfig } from './config';
// 默认缓存前缀
const CACHE_PREFIX = 'http_cache:';
// 内存缓存，用于优化性能
export const memoryCache = new Map();
// 一个测试模式的标志，用于测试环境
let isTestMode = false;
// 标记是否使用增强存储
let useEnhancedStorage = false;
let enhancedStorage = null;
/**
 * 启用测试模式，禁用内存缓存以便测试
 */
export function enableTestMode() {
    isTestMode = true;
    memoryCache.clear();
}
/**
 * 禁用测试模式
 */
export function disableTestMode() {
    isTestMode = false;
}
/**
 * 初始化使用增强的存储实现
 * @param storage 增强的存储实现
 */
export function initWithEnhancedStorage(storage) {
    useEnhancedStorage = true;
    enhancedStorage = storage;
}
/**
 * 生成缓存键
 * @param config 请求配置
 */
export function getCacheKey(config) {
    const { url = '', method = 'GET', params, data } = config;
    const key = `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
    return key;
}
/**
 * 从缓存键中提取URL
 * @param key 缓存键
 * @returns URL字符串
 */
export function getUrlFromCacheKey(key) {
    const parts = key.split(':');
    if (parts.length >= 2) {
        return parts[1]; // 返回URL部分
    }
    return '';
}
/**
 * 从缓存键中提取请求方法
 * @param key 缓存键
 * @returns 请求方法
 */
export function getMethodFromCacheKey(key) {
    const parts = key.split(':');
    if (parts.length >= 1) {
        return parts[0]; // 返回请求方法部分
    }
    return '';
}
/**
 * 获取缓存 - 增强版实现
 */
async function getEnhancedCache(key) {
    try {
        // 首先检查内存缓存
        const memCache = memoryCache.get(key);
        if (memCache) {
            if (Date.now() < memCache.expireAt) {
                return memCache.data;
            }
            else {
                // 过期了，从内存缓存中删除
                memoryCache.delete(key);
            }
        }
        // 从增强存储中获取
        const cacheData = enhancedStorage.get(key);
        if (!cacheData)
            return null;
        // 添加到内存缓存以提高性能
        if (cacheData.expireAt) {
            memoryCache.set(key, {
                data: cacheData,
                expireAt: cacheData.expireAt
            });
        }
        return cacheData;
    }
    catch (error) {
        console.warn('Enhanced cache retrieval error:', error);
        return null;
    }
}
/**
 * 获取缓存 - 标准实现
 */
async function getStandardCache(key) {
    try {
        // 在非测试模式下首先检查内存缓存
        if (!isTestMode) {
            const memCache = memoryCache.get(key);
            if (memCache) {
                if (Date.now() < memCache.expireAt) {
                    return memCache.data;
                }
                else {
                    // 过期了，从内存缓存中删除
                    memoryCache.delete(key);
                }
            }
        }
        // 从localStorage获取
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const cache = localStorage.getItem(cacheKey);
        if (!cache)
            return null;
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
        }
        catch (jsonError) {
            // JSON解析错误
            localStorage.removeItem(cacheKey);
            return null;
        }
    }
    catch (error) {
        return null;
    }
}
/**
 * 获取缓存
 * @param key 缓存键
 */
export async function getCache(key) {
    return useEnhancedStorage
        ? getEnhancedCache(key)
        : getStandardCache(key);
}
/**
 * 设置缓存 - 增强版实现
 */
async function setEnhancedCache(key, data, cacheTime) {
    try {
        const { defaultCacheTime } = getHttpConfig();
        const expireTime = cacheTime || defaultCacheTime || 5 * 60 * 1000; // 默认5分钟
        const expireAt = Date.now() + expireTime;
        // 添加过期时间到响应对象
        const cachedResponse = {
            ...data,
            expireAt
        };
        // 从缓存键中提取URL和方法
        const url = getUrlFromCacheKey(key);
        const method = getMethodFromCacheKey(key);
        // 保存到内存缓存
        memoryCache.set(key, {
            data: cachedResponse,
            expireAt,
            url,
            method
        });
        // 保存到增强存储
        enhancedStorage.put({
            key,
            data: cachedResponse,
            expirationMillis: expireTime,
            metadata: { url, method } // 添加元数据
        });
    }
    catch (error) {
        console.error('Enhanced cache set error:', error);
    }
}
/**
 * 设置缓存 - 标准实现
 */
async function setStandardCache(key, data, cacheTime) {
    try {
        const { defaultCacheTime } = getHttpConfig();
        const expireTime = cacheTime || defaultCacheTime || 5 * 60 * 1000; // 默认5分钟
        const expireAt = Date.now() + expireTime;
        // 从缓存键中提取URL和方法
        const url = getUrlFromCacheKey(key);
        const method = getMethodFromCacheKey(key);
        // 添加过期时间到响应对象
        const cachedResponse = {
            ...data,
            expireAt
        };
        // 保存到内存缓存
        memoryCache.set(key, {
            data: cachedResponse,
            expireAt,
            url,
            method
        });
        const cache = {
            data,
            expireAt,
            url, // 添加URL
            method // 添加方法
        };
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cache));
    }
    catch (error) {
        console.error('Cache set error:', error);
    }
}
/**
 * 设置缓存
 * @param key 缓存键
 * @param data 缓存数据
 * @param cacheTime 缓存时间（毫秒）
 */
export async function setCache(key, data, cacheTime) {
    return useEnhancedStorage
        ? setEnhancedCache(key, data, cacheTime)
        : setStandardCache(key, data, cacheTime);
}
/**
 * 清除指定缓存 - 增强版实现
 */
function clearEnhancedCache(key) {
    try {
        // 从内存缓存中删除
        memoryCache.delete(key);
        // 从增强存储中删除
        enhancedStorage.remove(key);
    }
    catch (error) {
        console.error('Clear enhanced cache error:', error);
    }
}
/**
 * 清除指定缓存 - 标准实现
 */
function clearStandardCache(key) {
    // 从内存缓存中删除
    memoryCache.delete(key);
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}
/**
 * 清除指定缓存
 * @param key 缓存键
 */
export function clearCache(key) {
    return useEnhancedStorage
        ? clearEnhancedCache(key)
        : clearStandardCache(key);
}
/**
 * 清除所有缓存 - 增强版实现
 */
function clearAllEnhancedCache() {
    try {
        // 清除内存缓存
        memoryCache.clear();
        // 重置增强存储
        enhancedStorage.reset();
    }
    catch (error) {
        console.error('Clear all enhanced cache error:', error);
    }
}
/**
 * 清除所有缓存 - 标准实现
 */
function clearAllStandardCache() {
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
export function clearAllCache() {
    return useEnhancedStorage
        ? clearAllEnhancedCache()
        : clearAllStandardCache();
}
/**
 * 清除过期缓存 - 增强版实现
 */
function clearExpiredEnhancedCache() {
    try {
        const now = Date.now();
        // 清除内存中的过期缓存
        for (const [key, value] of memoryCache.entries()) {
            if (value.expireAt < now) {
                memoryCache.delete(key);
            }
        }
        // 增强存储会自动处理过期项
    }
    catch (error) {
        console.error('Clear expired enhanced cache error:', error);
    }
}
/**
 * 清除过期缓存 - 标准实现
 */
function clearExpiredStandardCache() {
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
            }
            catch (error) {
                // 无效的缓存项，直接删除
                localStorage.removeItem(key);
            }
        }
    });
}
/**
 * 清除过期缓存
 */
export function clearExpiredCache() {
    return useEnhancedStorage
        ? clearExpiredEnhancedCache()
        : clearExpiredStandardCache();
}
/**
 * 通过URL清除缓存 - 增强版实现
 * @param url 请求URL
 * @param options 清除选项
 */
function clearEnhancedCacheByUrl(url, options = {}) {
    try {
        const { method, exactMatch = false, pattern = false } = options;
        const keysToDelete = [];
        // 收集要删除的缓存键
        memoryCache.forEach((value, key) => {
            let cacheUrl;
            let cacheMethod;
            // 直接从缓存值中获取URL和方法
            if (value.data && value.data.config) {
                cacheUrl = value.data.config.url || '';
                cacheMethod = value.data.config.method || '';
            }
            else if (value.url && value.method) {
                cacheUrl = value.url;
                cacheMethod = value.method;
            }
            else {
                // 从键中提取URL和方法
                cacheUrl = getUrlFromCacheKey(key);
                cacheMethod = getMethodFromCacheKey(key);
            }
            // 跳过没有URL的项
            if (!cacheUrl)
                return;
            // 方法匹配检查
            const methodMatches = !method || method === cacheMethod;
            if (!methodMatches)
                return;
            // URL匹配检查
            let urlMatches = false;
            if (exactMatch) {
                // 精确匹配
                urlMatches = cacheUrl === url;
            }
            else if (pattern instanceof RegExp) {
                // 正则表达式匹配
                urlMatches = pattern.test(cacheUrl);
            }
            else if (pattern === true) {
                // 包含匹配
                urlMatches = cacheUrl.includes(url);
            }
            else {
                // 默认前缀匹配
                urlMatches = cacheUrl.startsWith(url);
            }
            if (urlMatches) {
                keysToDelete.push(key);
            }
        });
        // 删除匹配的缓存项
        for (const key of keysToDelete) {
            memoryCache.delete(key);
            enhancedStorage.remove(key);
        }
    }
    catch (error) {
        console.error('Clear enhanced cache by URL error:', error);
    }
}
/**
 * 通过URL清除缓存 - 标准实现
 * @param url 请求URL
 * @param options 清除选项
 */
function clearStandardCacheByUrl(url, options = {}) {
    try {
        const { method, exactMatch = false, pattern = false } = options;
        const keysToDelete = [];
        // 收集要删除的缓存键
        memoryCache.forEach((value, key) => {
            let cacheUrl;
            let cacheMethod;
            // 直接从缓存值中获取URL和方法
            if (value.data && value.data.config) {
                cacheUrl = value.data.config.url || '';
                cacheMethod = value.data.config.method || '';
            }
            else if (value.url && value.method) {
                cacheUrl = value.url;
                cacheMethod = value.method;
            }
            else {
                // 从键中提取URL和方法
                cacheUrl = getUrlFromCacheKey(key);
                cacheMethod = getMethodFromCacheKey(key);
            }
            // 跳过没有URL的项
            if (!cacheUrl)
                return;
            // 方法匹配检查
            const methodMatches = !method || method === cacheMethod;
            if (!methodMatches)
                return;
            // URL匹配检查
            let urlMatches = false;
            if (exactMatch) {
                // 精确匹配
                urlMatches = cacheUrl === url;
            }
            else if (pattern instanceof RegExp) {
                // 正则表达式匹配
                urlMatches = pattern.test(cacheUrl);
            }
            else if (pattern === true) {
                // 包含匹配
                urlMatches = cacheUrl.includes(url);
            }
            else {
                // 默认前缀匹配
                urlMatches = cacheUrl.startsWith(url);
            }
            if (urlMatches) {
                keysToDelete.push(key);
            }
        });
        // 删除匹配的缓存项
        for (const key of keysToDelete) {
            memoryCache.delete(key);
        }
        // 处理localStorage缓存
        if (typeof localStorage !== 'undefined') {
            const storageKeys = Object.keys(localStorage);
            for (const storageKey of storageKeys) {
                if (storageKey.startsWith(CACHE_PREFIX)) {
                    try {
                        const cache = localStorage.getItem(storageKey);
                        if (cache) {
                            let cacheUrl = '';
                            let cacheMethod = '';
                            try {
                                const cacheObj = JSON.parse(cache);
                                if (cacheObj.data && cacheObj.data.config) {
                                    cacheUrl = cacheObj.data.config.url || '';
                                    cacheMethod = cacheObj.data.config.method || '';
                                }
                                else if (cacheObj.url && cacheObj.method) {
                                    cacheUrl = cacheObj.url;
                                    cacheMethod = cacheObj.method;
                                }
                                else {
                                    // 从键中提取URL和方法
                                    cacheUrl = getUrlFromCacheKey(storageKey.replace(CACHE_PREFIX, ''));
                                    cacheMethod = getMethodFromCacheKey(storageKey.replace(CACHE_PREFIX, ''));
                                }
                                // 跳过没有URL的项
                                if (!cacheUrl)
                                    continue;
                                // 方法匹配检查
                                const methodMatches = !method || method === cacheMethod;
                                if (!methodMatches)
                                    continue;
                                // URL匹配检查
                                let urlMatches = false;
                                if (exactMatch) {
                                    // 精确匹配
                                    urlMatches = cacheUrl === url;
                                }
                                else if (pattern instanceof RegExp) {
                                    // 正则表达式匹配
                                    urlMatches = pattern.test(cacheUrl);
                                }
                                else if (pattern === true) {
                                    // 包含匹配
                                    urlMatches = cacheUrl.includes(url);
                                }
                                else {
                                    // 默认前缀匹配
                                    urlMatches = cacheUrl.startsWith(url);
                                }
                                if (urlMatches) {
                                    localStorage.removeItem(storageKey);
                                }
                            }
                            catch (parseError) {
                                // JSON解析错误，移除可能无效的缓存
                                localStorage.removeItem(storageKey);
                            }
                        }
                    }
                    catch (error) {
                        // 无效的缓存项，忽略
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Clear standard cache by URL error:', error);
    }
}
/**
 * 通过URL清除缓存
 * @param url 请求URL
 * @param options 清除选项
 * - method: 请求方法，如 'GET', 'POST' 等，不指定则清除所有方法
 * - exactMatch: 是否精确匹配URL，默认为false
 * - pattern: 是否使用模式匹配
 *   - true: 使用includes匹配 (url包含关系)
 *   - RegExp: 使用正则表达式匹配
 *   - false/undefined: 使用前缀匹配 (即url.startsWith)
 */
export function clearCacheByUrl(url, options = {}) {
    return useEnhancedStorage
        ? clearEnhancedCacheByUrl(url, options)
        : clearStandardCacheByUrl(url, options);
}
/**
 * 仅用于测试的简化缓存清除方法
 * 注意：这个方法只在测试中使用，生产中请使用正常的clearCacheByUrl方法
 */
export function __testOnlyClearCacheByUrl(url, options = {}) {
    const { method, exactMatch = false, pattern = false } = options;
    // 遍历内存缓存并删除匹配的项
    const keysToDelete = [];
    memoryCache.forEach((value, key) => {
        // 获取URL和方法
        const cacheUrl = value.url || '';
        const cacheMethod = value.method || getMethodFromCacheKey(key);
        // 方法匹配检查
        if (method && cacheMethod !== method) {
            return;
        }
        // URL匹配检查
        let urlMatches = false;
        if (exactMatch) {
            urlMatches = cacheUrl === url;
        }
        else if (pattern instanceof RegExp) {
            urlMatches = pattern.test(cacheUrl);
        }
        else if (pattern === true) {
            urlMatches = cacheUrl.includes(url);
        }
        else {
            urlMatches = cacheUrl.startsWith(url);
        }
        if (urlMatches) {
            keysToDelete.push(key);
        }
    });
    // 删除匹配的项
    for (const key of keysToDelete) {
        memoryCache.delete(key);
    }
}

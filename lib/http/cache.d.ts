/**
 * HTTP请求缓存工具
 * 提供请求缓存的存取功能
 */
import type { HttpRequestConfig, HttpResponse } from './types';
export declare const memoryCache: Map<string, {
    data: HttpResponse<any>;
    expireAt: number;
    url?: string;
    method?: string;
}>;
/**
 * 启用测试模式，禁用内存缓存以便测试
 */
export declare function enableTestMode(): void;
/**
 * 禁用测试模式
 */
export declare function disableTestMode(): void;
/**
 * 初始化使用增强的存储实现
 * @param storage 增强的存储实现
 */
export declare function initWithEnhancedStorage(storage: any): void;
/**
 * 生成缓存键
 * @param config 请求配置
 */
export declare function getCacheKey(config: HttpRequestConfig): string;
/**
 * 从缓存键中提取URL
 * @param key 缓存键
 * @returns URL字符串
 */
export declare function getUrlFromCacheKey(key: string): string;
/**
 * 从缓存键中提取请求方法
 * @param key 缓存键
 * @returns 请求方法
 */
export declare function getMethodFromCacheKey(key: string): string;
/**
 * 获取缓存
 * @param key 缓存键
 */
export declare function getCache<T>(key: string): Promise<HttpResponse<T> | null>;
/**
 * 设置缓存
 * @param key 缓存键
 * @param data 缓存数据
 * @param cacheTime 缓存时间（毫秒）
 */
export declare function setCache<T>(key: string, data: HttpResponse<T>, cacheTime?: number): Promise<void>;
/**
 * 清除指定缓存
 * @param key 缓存键
 */
export declare function clearCache(key: string): void;
/**
 * 清除所有缓存
 */
export declare function clearAllCache(): void;
/**
 * 清除过期缓存
 */
export declare function clearExpiredCache(): void;
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
export declare function clearCacheByUrl(url: string, options?: {
    method?: string;
    exactMatch?: boolean;
    pattern?: boolean | RegExp;
}): void;
/**
 * 仅用于测试的简化缓存清除方法
 * 注意：这个方法只在测试中使用，生产中请使用正常的clearCacheByUrl方法
 */
export declare function __testOnlyClearCacheByUrl(url: string, options?: {
    method?: string;
    exactMatch?: boolean;
    pattern?: boolean | RegExp;
}): void;

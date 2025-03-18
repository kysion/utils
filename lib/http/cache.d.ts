/**
 * HTTP请求缓存工具
 * 提供请求缓存的存取功能
 */
import type { HttpRequestConfig, HttpResponse } from './types';
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

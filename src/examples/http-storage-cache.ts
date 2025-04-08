/**
 * 示例：使用LocalStorageWrapper增强HTTP缓存
 * 
 * 这个示例展示如何使用LocalStorageWrapper来增强HTTP请求的缓存功能，
 * 从而添加加密、版本控制和更强大的过期机制。
 */

import { initWithEnhancedStorage } from '../http/cache';
import { LocalStorageWrapper } from '../storage';
import { HttpClient } from '../http';

/**
 * 初始化HTTP缓存
 */
function initHttpCache() {
    // 创建一个专用于HTTP缓存的LocalStorageWrapper实例
    const httpCacheStorage = new LocalStorageWrapper<any>({
        storageKey: 'http_cache',
        keyPrefix: 'api',
        version: '1.0.0', // 可以通过更改版本号来使所有已有缓存失效
        crypto: true      // 启用加密，增强安全性
    });

    // 初始化HTTP缓存系统，使用增强的存储实现
    initWithEnhancedStorage(httpCacheStorage);
}

/**
 * 使用带缓存的HTTP客户端
 */
async function useHttpClientWithCache() {
    // 初始化缓存系统
    initHttpCache();

    // 创建HTTP客户端
    const httpClient = new HttpClient();

    // 示例：使用缓存获取用户数据
    await httpClient.get('/api/users', null, {
        useCache: true,       // 启用缓存
        cacheTime: 3600000    // 缓存1小时
    });

    // 示例：强制刷新数据（跳过缓存）
    await httpClient.get('/api/users');

    // 示例：POST请求通常不使用缓存
    await httpClient.post('/api/users', {
        name: '张三',
        email: 'zhangsan@example.com'
    });
}

// 导出函数，可以在应用启动时调用
export { initHttpCache, useHttpClientWithCache }; 
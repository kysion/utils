/**
 * HTTP请求模块入口文件
 */
import HttpClient from './HttpClient';
import { getCacheKey, getCache, setCache, clearCache, clearAllCache, clearExpiredCache } from './cache';
import { configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, handleAuthFailed, DEFAULT_ERROR_MESSAGES } from './config';
import { defaultInterceptors, requestInterceptor, responseInterceptor, errorHandler } from './interceptors';
// 导出类和函数
export { HttpClient, getCacheKey, getCache, setCache, clearCache, clearAllCache, clearExpiredCache, defaultInterceptors, requestInterceptor, responseInterceptor, errorHandler, configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, handleAuthFailed, DEFAULT_ERROR_MESSAGES };
// 创建默认的HTTP客户端实例
let http = null;
// 检查环境
const isBrowser = typeof window !== 'undefined';
const isTestEnv = process?.env?.NODE_ENV === 'test';
// 只在浏览器环境中创建HTTP实例
if (isBrowser && !isTestEnv) {
    try {
        // 直接使用导入的HttpClient类
        http = new HttpClient();
    }
    catch (error) {
        console.warn('无法创建默认HTTP客户端实例:', error);
    }
}
else {
    // 在非浏览器环境或测试环境中，不创建HTTP实例
    console.info('在非浏览器环境或测试环境中不创建HTTP客户端实例');
}
export { http };
// 默认导出
export default HttpClient;
/**
 * 导出默认HTTP方法
 *
 * 使用示例:
 *
 * // 默认情况下，只获取API响应中的data部分
 * const userData = await get('/api/users');
 *
 * // 获取完整响应对象
 * const response = await get('/api/users', null, { returnResponse: true });
 */
export const get = http ? http.get.bind(http) : null;
export const post = http ? http.post.bind(http) : null;
export const put = http ? http.put.bind(http) : null;
export const del = http ? http.delete.bind(http) : null;
export const patch = http ? http.patch.bind(http) : null;
export const request = http ? http.request.bind(http) : null;

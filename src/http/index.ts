/**
 * HTTP请求模块入口文件
 */

import { HttpClient } from './HttpClient';
import {
    defaultInterceptors,
    requestInterceptor,
    responseInterceptor,
    errorHandler
} from './interceptors';
import {
    getCacheKey,
    getCache,
    setCache,
    clearCache,
    clearAllCache,
    clearExpiredCache,
    clearCacheByUrl,
    getUrlFromCacheKey,
    getMethodFromCacheKey
} from './cache';
import {
    configureHttp,
    resetHttpConfig,
    getHttpConfig,
    getErrorMessage,
    handleAuthFailed,
    DEFAULT_ERROR_MESSAGES
} from './config';

import type {
    HttpRequestConfig,
    HttpResponse,
    HttpError,
    ApiResponse,
    RequestInterceptor,
    ResponseInterceptor,
    ErrorInterceptor,
    HttpGlobalConfig,
    UploadProgressInfo,
    DownloadProgressInfo,
    ResumeInfo
} from './types';

/**
 * 获取HttpClient实例
 * @param config 配置（可选）
 * @returns HttpClient实例
 */
export const getHttpInstance = (config?: HttpRequestConfig): HttpClient => {
    console.log('getHttpInstance=======>', config);
    // 创建单例实例
    if (!HttpClient.instance) {
        HttpClient.instance = new HttpClient(config);
    }
    return HttpClient.instance;
};

/**
 * 更新HttpClient实例配置
 * @param config 配置
 * @returns 更新后的HttpClient实例
 */
export const updateHttpConfig = (config: Partial<HttpRequestConfig>): HttpClient => {
    console.log('updateHttpConfig=======>', config);
    if (!HttpClient.instance) {
        HttpClient.instance = new HttpClient(config);
    } else {
        HttpClient.instance.updateConfig(config);
    }
    return HttpClient.instance;
};

// 创建默认的HTTP客户端实例
let http = null;

// 检查环境
const isBrowser = typeof window !== 'undefined';

// 只在浏览器环境中创建HTTP实例
if (isBrowser) {
    try {
        http = getHttpInstance();
    } catch (_) {
        // console.info('无法创建默认HTTP客户端实例:');
    }
} else {
    // 在非浏览器环境或测试环境中，不创建HTTP实例
    console.info('在非浏览器环境或测试环境中不创建HTTP客户端实例');
}

// 导出http实例
export { http };

// 导出类和函数
export {
    HttpClient,
    getCacheKey,
    getCache,
    setCache,
    clearCache,
    clearAllCache,
    clearExpiredCache,
    clearCacheByUrl,
    getUrlFromCacheKey,
    getMethodFromCacheKey,
    defaultInterceptors,
    requestInterceptor,
    responseInterceptor,
    errorHandler,
    configureHttp,
    resetHttpConfig,
    getHttpConfig,
    getErrorMessage,
    handleAuthFailed,
    DEFAULT_ERROR_MESSAGES
};

// 导出类型
export type {
    HttpRequestConfig,
    HttpResponse,
    HttpError,
    ApiResponse,
    RequestInterceptor,
    ResponseInterceptor,
    ErrorInterceptor,
    HttpGlobalConfig,
    UploadProgressInfo,
    DownloadProgressInfo,
    ResumeInfo
};

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

/**
 * 导出文件上传下载方法
 * 
 * 使用示例:
 * 
 * // 上传文件
 * const file = document.querySelector('input[type="file"]').files[0];
 * const result = await upload('/api/upload', file, {
 *   onUploadProgressInfo: (info) => {
 *     console.log(`上传进度: ${info.percent}%, 速度: ${info.speed} bytes/s`);
 *   }
 * });
 * 
 * // 下载文件
 * const blob = await download('/api/files/123', {
 *   fileName: 'document.pdf',
 *   onDownloadProgressInfo: (info) => {
 *     console.log(`下载进度: ${info.percent}%`);
 *   }
 * });
 */
export const upload = http ? http.upload.bind(http) : null;
export const uploadLargeFile = http ? http.uploadLargeFile.bind(http) : null;
export const download = http ? http.download.bind(http) : null;
export const downloadLargeFile = http ? http.downloadLargeFile.bind(http) : null;

// 导出HTTP客户端方法
export const clearCacheByPattern = http ? http.clearCacheByUrl.bind(http) : null;
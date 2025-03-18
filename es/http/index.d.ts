/**
 * HTTP请求模块入口文件
 */
import HttpClient from './HttpClient';
import { getCacheKey, getCache, setCache, clearCache, clearAllCache, clearExpiredCache } from './cache';
import { configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, handleAuthFailed, DEFAULT_ERROR_MESSAGES } from './config';
import { defaultInterceptors, requestInterceptor, responseInterceptor, errorHandler } from './interceptors';
import type { HttpRequestConfig, HttpResponse, HttpError, ApiResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpGlobalConfig } from './types';
export { HttpClient, getCacheKey, getCache, setCache, clearCache, clearAllCache, clearExpiredCache, defaultInterceptors, requestInterceptor, responseInterceptor, errorHandler, configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, handleAuthFailed, DEFAULT_ERROR_MESSAGES };
export type { HttpRequestConfig, HttpResponse, HttpError, ApiResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpGlobalConfig };
declare let http: null;
export { http };
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
export declare const get: (<T = any>(url: string, params?: any, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const post: (<T = any>(url: string, data?: any, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const put: (<T = any>(url: string, data?: any, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const del: (<T = any>(url: string, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const patch: (<T = any>(url: string, data?: any, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const request: (<T = any>(config: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;

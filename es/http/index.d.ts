/**
 * HTTP请求模块入口文件
 */
import { HttpClient } from './HttpClient';
import { defaultInterceptors, requestInterceptor, responseInterceptor, errorHandler } from './interceptors';
import { getCacheKey, getCache, setCache, clearCache, clearAllCache, clearExpiredCache, clearCacheByUrl, getUrlFromCacheKey, getMethodFromCacheKey } from './cache';
import { configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, handleAuthFailed, DEFAULT_ERROR_MESSAGES } from './config';
import type { HttpRequestConfig, HttpResponse, HttpError, ApiResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpGlobalConfig, UploadProgressInfo, DownloadProgressInfo, ResumeInfo } from './types';
declare let http: null;
/**
 * 获取HttpClient实例
 * @param config 配置（可选）
 * @returns HttpClient实例
 */
export declare const getHttpInstance: (config?: HttpRequestConfig) => HttpClient;
/**
 * 更新HttpClient实例配置
 * @param config 配置
 * @returns 更新后的HttpClient实例
 */
export declare const updateHttpConfig: (config: Partial<HttpRequestConfig>) => HttpClient;
export { http };
export { HttpClient, getCacheKey, getCache, setCache, clearCache, clearAllCache, clearExpiredCache, clearCacheByUrl, getUrlFromCacheKey, getMethodFromCacheKey, defaultInterceptors, requestInterceptor, responseInterceptor, errorHandler, configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, handleAuthFailed, DEFAULT_ERROR_MESSAGES };
export type { HttpRequestConfig, HttpResponse, HttpError, ApiResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpGlobalConfig, UploadProgressInfo, DownloadProgressInfo, ResumeInfo };
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
export declare const get: (<T = any>(url: string, params?: any, config?: Partial<HttpRequestConfig>) => Promise<HttpResponse<T> | T>) | null;
export declare const post: (<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>) => Promise<HttpResponse<T> | T>) | null;
export declare const put: (<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>) => Promise<HttpResponse<T> | T>) | null;
export declare const del: (<T = any>(url: string, config?: Partial<HttpRequestConfig>) => Promise<HttpResponse<T> | T>) | null;
export declare const patch: (<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>) => Promise<HttpResponse<T> | T>) | null;
export declare const request: (<T = any>(config: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
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
export declare const upload: (<T = any>(url: string, file: File | Blob | Buffer, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const uploadLargeFile: (<T = any>(url: string, file: File | Blob, config?: HttpRequestConfig) => Promise<HttpResponse<T> | T>) | null;
export declare const download: ((url: string, config?: HttpRequestConfig) => Promise<Blob | Buffer>) | null;
export declare const downloadLargeFile: ((url: string, config?: HttpRequestConfig) => Promise<Blob | Buffer>) | null;
export declare const clearCacheByPattern: ((url: string, options?: {
    method?: string;
    exactMatch?: boolean;
    pattern?: boolean | RegExp;
}) => void) | null;

/**
 * HTTP请求模块类型定义
 */
import type { AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders, AxiosError, AxiosProgressEvent } from 'axios';
import type { KyResponse } from '@kysion/types';
/**
 * 文件上传进度信息
 */
export interface UploadProgressInfo extends AxiosProgressEvent {
    /**
     * 上传速度 (bytes/s)
     */
    speed?: number;
    /**
     * 上传完成百分比 (0-100)
     */
    percent: number;
    /**
     * 剩余时间 (秒)
     */
    remainingTime?: number;
}
/**
 * 文件下载进度信息
 */
export interface DownloadProgressInfo extends AxiosProgressEvent {
    /**
     * 下载速度 (bytes/s)
     */
    speed?: number;
    /**
     * 下载完成百分比 (0-100)
     */
    percent: number;
    /**
     * 剩余时间 (秒)
     */
    remainingTime?: number;
}
/**
 * 断点续传信息
 */
export interface ResumeInfo {
    /**
     * 已传输的字节数
     */
    startByte: number;
    /**
     * 总字节数
     */
    totalBytes: number;
    /**
     * 文件唯一标识
     */
    fileId: string;
}
/**
 * HTTP全局配置接口
 */
export interface HttpGlobalConfig {
    /**
     * 基础URL
     */
    baseURL?: string;
    /**
     * 默认超时时间（毫秒）
     */
    timeout?: number;
    /**
     * 默认请求头
     */
    headers?: Record<string, string>;
    /**
     * 错误消息翻译函数
     * @param code 错误码
     * @param message 默认消息
     * @param lang 语言代码
     */
    translateErrorMessage?: (code: string | number, message: string, lang?: string) => string;
    /**
     * 错误消息映射对象
     * 格式: { [errorCode: string]: string | { [lang: string]: string } }
     */
    errorMessages?: Record<string, string | Record<string, string>>;
    /**
     * 默认语言
     */
    defaultLanguage?: string;
    /**
     * 是否在控制台输出调试信息
     */
    debug?: boolean;
    /**
     * 获取当前语言的函数
     */
    getCurrentLanguage?: () => string;
    /**
     * 获取当前认证令牌的函数
     */
    getAuthToken?: () => string | null;
    /**
     * 认证失败回调函数
     */
    onAuthFailed?: () => void;
    /**
     * 全局请求拦截器
     */
    requestInterceptors?: RequestInterceptor[];
    /**
     * 全局响应拦截器
     */
    responseInterceptors?: ResponseInterceptor[];
    /**
     * 全局错误拦截器
     */
    errorInterceptors?: ErrorInterceptor[];
    /**
     * 默认缓存时间（毫秒）
     */
    defaultCacheTime?: number;
    /**
     * 默认上传请求基础URL
     */
    uploadBaseURL?: string;
    /**
     * 默认下载请求基础URL
     */
    downloadBaseURL?: string;
    /**
     * 默认分块上传大小（字节）
     */
    defaultChunkSize?: number;
    /**
     * 默认上传并发数
     */
    defaultUploadConcurrency?: number;
    /**
     * 默认下载并发数
     */
    defaultDownloadConcurrency?: number;
}
/**
 * HTTP请求配置接口
 * 扩展自Axios请求配置
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
    skipAuth?: boolean;
    skipErrorHandler?: boolean;
    showLoading?: boolean;
    showError?: boolean;
    errorHandler?: (error: any) => void;
    returnResponse?: boolean;
    cache?: boolean;
    cacheKey?: string;
    cacheTime?: number;
    headers?: AxiosRequestHeaders;
    requestId?: string;
    retryCount?: number;
    retryDelay?: number;
    useCache?: boolean;
    /**
     * 更高级的上传进度回调
     */
    onUploadProgressInfo?: (progressInfo: UploadProgressInfo) => void;
    /**
     * 更高级的下载进度回调
     */
    onDownloadProgressInfo?: (progressInfo: DownloadProgressInfo) => void;
    /**
     * 是否支持断点续传
     */
    resumable?: boolean;
    /**
     * 断点续传信息
     */
    resumeInfo?: ResumeInfo;
    /**
     * 上传分块大小（字节）
     */
    chunkSize?: number;
    /**
     * 上传并发数
     */
    concurrency?: number;
    /**
     * 是否自动计算上传/下载速度
     */
    calculateSpeed?: boolean;
    /**
     * 文件保存路径（仅用于下载）
     */
    filePath?: string;
    /**
     * 自定义文件名（下载时使用）
     */
    fileName?: string;
}
/**
 * HTTP响应接口
 * 扩展自Axios响应
 */
export type HttpResponse<T = any> = AxiosResponse<T> & {
    config: HttpRequestConfig;
    fromCache?: boolean;
    expireAt?: number;
};
/**
 * 后端API响应数据结构
 */
export interface ApiResponse<T = any> extends KyResponse<T> {
    code: number;
    message: string;
    data: T;
}
/**
 * HTTP错误接口
 * 扩展自Axios错误
 */
export interface HttpError extends Omit<AxiosError<any, HttpRequestConfig>, 'config'> {
    config?: HttpRequestConfig;
    retryCount?: number;
}
/**
 * 请求拦截器函数类型
 */
export type RequestInterceptor = (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
/**
 * 响应拦截器函数类型
 */
export type ResponseInterceptor<T = any> = (response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;
/**
 * 错误拦截器函数类型
 */
export type ErrorInterceptor = (error: HttpError) => HttpError | Promise<HttpError>;

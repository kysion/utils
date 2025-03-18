/**
 * HTTP请求模块类型定义
 */

import type { AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders, AxiosError } from 'axios';
import type { KyResponse } from '@kysion/types';

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
}

/**
 * HTTP响应接口
 * 扩展自Axios响应
 */
export type HttpResponse<T = any> = AxiosResponse<T> & {
    config: HttpRequestConfig;
    fromCache?: boolean;
    expireAt?: number; // 缓存过期时间戳
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
export type RequestInterceptor = (
    config: HttpRequestConfig
) => HttpRequestConfig | Promise<HttpRequestConfig>;

/**
 * 响应拦截器函数类型
 */
export type ResponseInterceptor<T = any> = (
    response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>;

/**
 * 错误拦截器函数类型
 */
export type ErrorInterceptor = (
    error: HttpError
) => HttpError | Promise<HttpError>;
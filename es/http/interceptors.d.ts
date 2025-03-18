/**
 * HTTP请求拦截器配置
 * 提供默认的请求和响应拦截器
 */
import type { AxiosError } from 'axios';
import type { HttpRequestConfig, HttpResponse } from './types';
export declare function requestInterceptor(config: HttpRequestConfig): HttpRequestConfig;
export declare function responseInterceptor(response: HttpResponse<any>): HttpResponse<any> | Promise<never>;
export declare function errorHandler(error: AxiosError): Promise<never>;
/**
 * 设置默认拦截器
 * @param client HTTP客户端实例
 */
export declare function setupDefaultInterceptors(client: any): void;
export declare const defaultInterceptors: {
    request: typeof requestInterceptor;
    response: typeof responseInterceptor;
    error: typeof errorHandler;
};

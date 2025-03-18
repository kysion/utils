/**
 * HTTP请求客户端类
 * 基于Axios封装，提供请求拦截、响应拦截、错误处理、请求取消、缓存等功能
 */
import type { HttpRequestConfig, HttpResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './types';
/**
 * HTTP客户端类
 */
declare class HttpClient {
    private axiosInstance;
    private requestInterceptors;
    private responseInterceptors;
    private errorInterceptors;
    private cancelTokenMap;
    /**
     * 构造函数
     * @param config 实例配置
     */
    constructor(config?: HttpRequestConfig);
    /**
     * 添加全局拦截器
     * @param config 全局配置
     */
    private addGlobalInterceptors;
    /**
     * 添加请求拦截器
     * @param interceptor 请求拦截器函数
     * @returns 拦截器ID，用于移除
     */
    addRequestInterceptor(interceptor: RequestInterceptor): number;
    /**
     * 添加响应拦截器
     * @param interceptor 响应拦截器函数
     * @returns 拦截器ID，用于移除
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): number;
    /**
     * 添加错误拦截器
     * @param interceptor 错误拦截器函数
     * @returns 拦截器ID，用于移除
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): number;
    /**
     * 移除请求拦截器
     * @param id 拦截器ID
     */
    removeRequestInterceptor(id: number): void;
    /**
     * 移除响应拦截器
     * @param id 拦截器ID
     */
    removeResponseInterceptor(id: number): void;
    /**
     * 创建取消令牌
     * @param requestId 请求ID
     * @returns 取消令牌源
     */
    private createCancelToken;
    /**
     * 取消请求
     * @param requestId 请求ID
     * @param message 取消消息
     */
    cancel(requestId: string, message?: string): void;
    /**
     * 取消所有请求
     * @param message 取消消息
     */
    cancelAll(message?: string): void;
    /**
     * 处理请求缓存
     * @param config 请求配置
     * @returns 缓存的响应或undefined
     */
    private handleCache;
    /**
     * 处理请求重试
     * @param error 错误对象
     * @returns Promise
     */
    private handleRetry;
    /**
     * 发送HTTP请求
     * @param config 请求配置
     * @returns Promise
     */
    request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 判断响应数据是否符合API响应格式
     * @param data 响应数据
     * @returns 是否是API响应格式
     */
    private isApiResponse;
    /**
     * 发送GET请求
     * @param url 请求URL
     * @param params 请求参数
     * @param config 请求配置
     * @returns Promise
     */
    get<T = any>(url: string, params?: any, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 发送POST请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 发送PUT请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 发送DELETE请求
     * @param url 请求URL
     * @param config 请求配置
     * @returns Promise
     */
    delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 发送PATCH请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 从API响应中提取数据
     * @param response HTTP响应
     * @returns 数据部分
     */
    private extractApiData;
}
export default HttpClient;

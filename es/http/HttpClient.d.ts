/**
 * HTTP请求客户端类
 * 基于Axios封装，提供请求拦截、响应拦截、错误处理、请求取消、缓存等功能
 */
import type { HttpRequestConfig, HttpResponse, RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpGlobalConfig } from './types';
/**
 * HTTP客户端类
 */
export declare class HttpClient {
    static instance: HttpClient | null;
    private config;
    private axiosInstance;
    private requestInterceptors;
    private responseInterceptors;
    private errorInterceptors;
    private cancelTokenMap;
    /**
     * 获取HttpClient单例实例
     * @param config 配置（可选）
     * @returns HttpClient实例
     */
    static getInstance(config?: HttpRequestConfig): HttpClient;
    /**
     * 更新默认单例实例的配置
     * @param config 新的配置
     * @returns 更新后的HttpClient实例
     */
    static updateConfig(config: Partial<HttpRequestConfig> | ((config: HttpGlobalConfig) => Partial<HttpRequestConfig>)): HttpClient;
    /**
     * 更新当前实例的配置
     * @param config 新的配置
     */
    updateConfig(config: Partial<HttpRequestConfig> | ((config: HttpGlobalConfig) => Partial<HttpRequestConfig>)): void;
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
    get<T = any>(url: string, params?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T> | T>;
    /**
     * 发送POST请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T> | T>;
    /**
     * 发送PUT请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T> | T>;
    /**
     * 发送DELETE请求
     * @param url 请求URL
     * @param config 请求配置
     * @returns Promise
     */
    delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T> | T>;
    /**
     * 发送PATCH请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    patch<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T> | T>;
    /**
     * 从API响应中提取数据
     * @param response HTTP响应
     * @returns 数据部分
     */
    private extractApiData;
    /**
     * 根据URL清除缓存
     * @param url 请求URL
     * @param options 清除选项
     * - method: 请求方法，如 'GET', 'POST' 等，不指定则清除所有方法
     * - exactMatch: 是否精确匹配URL，默认为false
     * - pattern: 是否使用模式匹配
     */
    clearCacheByUrl(url: string, options?: {
        method?: string;
        exactMatch?: boolean;
        pattern?: boolean | RegExp;
    }): void;
    /**
     * 创建增强版的进度回调处理函数
     * @param progressCallback 原始的进度回调
     * @param infoCallback 增强的进度信息回调
     * @param calculateSpeed 是否计算速度
     * @returns 处理函数
     */
    private createProgressHandler;
    /**
     * 上传文件
     * @param url 上传地址
     * @param file 要上传的文件
     * @param config 配置选项
     * @returns 上传结果
     */
    upload<T = any>(url: string, file: File | Blob | Buffer, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 上传大文件（分块上传）
     * @param url 上传地址
     * @param file 要上传的文件
     * @param config 配置选项
     * @returns 上传结果
     */
    uploadLargeFile<T = any>(url: string, file: File | Blob, config?: HttpRequestConfig): Promise<HttpResponse<T> | T>;
    /**
     * 下载文件
     * @param url 下载地址
     * @param config 配置选项
     * @returns 下载结果（Blob 或 Buffer）
     */
    download(url: string, config?: HttpRequestConfig): Promise<Blob | Buffer>;
    /**
     * 大文件下载（支持断点续传）
     * @param url 下载地址
     * @param config 配置选项
     * @returns 下载的文件（Blob 或 Buffer）
     */
    downloadLargeFile(url: string, config?: HttpRequestConfig): Promise<Blob | Buffer>;
    /**
     * 保存文件到客户端（仅浏览器环境）
     * @param blob 文件blob
     * @param fileName 文件名
     */
    private saveFile;
}

/**
 * HTTP请求客户端类
 * 基于Axios封装，提供请求拦截、响应拦截、错误处理、请求取消、缓存等功能
 */
import axios from 'axios';
import { setupDefaultInterceptors } from './interceptors';
import { getCacheKey, getCache, setCache } from './cache';
import { Funs } from '..';
import { getHttpConfig } from './config';
/**
 * HTTP客户端类
 */
class HttpClient {
    /**
     * 构造函数
     * @param config 实例配置
     */
    constructor(config) {
        // 请求拦截器列表
        this.requestInterceptors = [];
        // 响应拦截器列表
        this.responseInterceptors = [];
        // 错误拦截器列表
        this.errorInterceptors = [];
        // 取消请求的token映射
        this.cancelTokenMap = new Map();
        // 获取全局配置
        const globalConfig = getHttpConfig();
        // 创建Axios实例
        this.axiosInstance = axios.create({
            baseURL: globalConfig.baseURL || Funs.getEnv('APP_SERVICE_BASE_URL', ''),
            timeout: globalConfig.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...globalConfig.headers
            },
            ...config,
        });
        // 设置默认拦截器
        setupDefaultInterceptors(this);
        // 添加全局拦截器
        this.addGlobalInterceptors(globalConfig);
    }
    /**
     * 添加全局拦截器
     * @param config 全局配置
     */
    addGlobalInterceptors(config) {
        // 添加全局请求拦截器
        if (config.requestInterceptors && config.requestInterceptors.length > 0) {
            config.requestInterceptors.forEach(interceptor => {
                this.addRequestInterceptor(interceptor);
            });
        }
        // 添加全局响应拦截器
        if (config.responseInterceptors && config.responseInterceptors.length > 0) {
            config.responseInterceptors.forEach(interceptor => {
                this.addResponseInterceptor(interceptor);
            });
        }
        // 添加全局错误拦截器
        if (config.errorInterceptors && config.errorInterceptors.length > 0) {
            config.errorInterceptors.forEach(interceptor => {
                this.addErrorInterceptor(interceptor);
            });
        }
    }
    /**
     * 添加请求拦截器
     * @param interceptor 请求拦截器函数
     * @returns 拦截器ID，用于移除
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
        return this.axiosInstance.interceptors.request.use(interceptor, (error) => Promise.reject(error));
    }
    /**
     * 添加响应拦截器
     * @param interceptor 响应拦截器函数
     * @returns 拦截器ID，用于移除
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
        return this.axiosInstance.interceptors.response.use(interceptor, (error) => Promise.reject(error));
    }
    /**
     * 添加错误拦截器
     * @param interceptor 错误拦截器函数
     * @returns 拦截器ID，用于移除
     */
    addErrorInterceptor(interceptor) {
        this.errorInterceptors.push(interceptor);
        return this.axiosInstance.interceptors.response.use((response) => response, interceptor);
    }
    /**
     * 移除请求拦截器
     * @param id 拦截器ID
     */
    removeRequestInterceptor(id) {
        this.axiosInstance.interceptors.request.eject(id);
    }
    /**
     * 移除响应拦截器
     * @param id 拦截器ID
     */
    removeResponseInterceptor(id) {
        this.axiosInstance.interceptors.response.eject(id);
    }
    /**
     * 创建取消令牌
     * @param requestId 请求ID
     * @returns 取消令牌源
     */
    createCancelToken(requestId) {
        if (!requestId)
            return undefined;
        // 如果已存在相同ID的请求，则取消之前的请求
        if (this.cancelTokenMap.has(requestId)) {
            this.cancel(requestId, '请求被替换');
        }
        // 创建新的取消令牌
        const source = axios.CancelToken.source();
        this.cancelTokenMap.set(requestId, source);
        return source;
    }
    /**
     * 取消请求
     * @param requestId 请求ID
     * @param message 取消消息
     */
    cancel(requestId, message) {
        const source = this.cancelTokenMap.get(requestId);
        if (source) {
            source.cancel(message);
            this.cancelTokenMap.delete(requestId);
        }
    }
    /**
     * 取消所有请求
     * @param message 取消消息
     */
    cancelAll(message) {
        this.cancelTokenMap.forEach((source) => {
            source.cancel(message);
        });
        this.cancelTokenMap.clear();
    }
    /**
     * 处理请求缓存
     * @param config 请求配置
     * @returns 缓存的响应或undefined
     */
    async handleCache(config) {
        if (!config.useCache && !config.cache)
            return undefined;
        const cacheKey = getCacheKey(config);
        const cachedResponse = await getCache(cacheKey);
        if (cachedResponse) {
            // 标记响应来自缓存
            return {
                ...cachedResponse,
                fromCache: true
            };
        }
        return undefined;
    }
    /**
     * 处理请求重试
     * @param error 错误对象
     * @returns Promise
     */
    async handleRetry(error) {
        if (!error || typeof error !== 'object') {
            return Promise.reject(error);
        }
        // 断言 config 为 HttpRequestConfig 类型
        const config = error.config;
        if (!config)
            return Promise.reject(error);
        // 如果没有配置重试或已达到最大重试次数，则抛出错误
        if (!config.retryCount || config.retryCount <= 0) {
            return Promise.reject(error);
        }
        // 设置已重试次数
        config.retryCount--;
        // 延迟重试
        const delay = config.retryDelay || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        // 重新发送请求
        return this.request(config);
    }
    /**
     * 发送HTTP请求
     * @param config 请求配置
     * @returns Promise
     */
    async request(config) {
        try {
            const globalConfig = getHttpConfig();
            // 检查缓存
            if (config.useCache || config.cache) {
                const cachedResponse = await this.handleCache(config);
                if (cachedResponse) {
                    return config.returnResponse !== true && this.isApiResponse(cachedResponse.data)
                        ? this.extractApiData(cachedResponse)
                        : cachedResponse;
                }
            }
            // 创建取消令牌
            if (config.requestId) {
                const source = this.createCancelToken(config.requestId);
                if (source) {
                    config.cancelToken = source.token;
                }
            }
            // 发送请求
            const response = await this.axiosInstance.request(config);
            // 如果需要缓存，则保存响应
            if (config.useCache || config.cache) {
                const cacheKey = getCacheKey(config);
                await setCache(cacheKey, response, config.cacheTime || globalConfig.defaultCacheTime);
            }
            // 如果有请求ID，请求完成后从映射中移除
            if (config.requestId) {
                this.cancelTokenMap.delete(config.requestId);
            }
            // 默认情况下返回API数据部分，只有在明确要求时才返回完整响应
            if (config.returnResponse === true || !this.isApiResponse(response.data)) {
                return response;
            }
            return this.extractApiData(response);
        }
        catch (error) {
            // 处理错误
            if (axios.isCancel(error)) {
                return Promise.reject(error);
            }
            // 尝试将错误转换为 AxiosError 类型
            const axiosError = error;
            // 检查是否存在 config 属性，并转换为 HttpRequestConfig
            if (axiosError && axiosError.config) {
                const errorConfig = axiosError.config;
                // 尝试重试请求
                if (errorConfig.retryCount && errorConfig.retryCount > 0) {
                    return this.handleRetry(axiosError);
                }
                // 如果配置了自定义错误处理，则调用
                if (errorConfig.errorHandler) {
                    errorConfig.errorHandler(axiosError);
                }
            }
            return Promise.reject(error);
        }
    }
    /**
     * 判断响应数据是否符合API响应格式
     * @param data 响应数据
     * @returns 是否是API响应格式
     */
    isApiResponse(data) {
        return data && typeof data === 'object' &&
            'code' in data &&
            'message' in data &&
            'data' in data;
    }
    /**
     * 发送GET请求
     * @param url 请求URL
     * @param params 请求参数
     * @param config 请求配置
     * @returns Promise
     */
    get(url, params, config) {
        return this.request({
            method: 'GET',
            url,
            params,
            ...config,
        });
    }
    /**
     * 发送POST请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    post(url, data, config) {
        return this.request({
            method: 'POST',
            url,
            data,
            ...config,
        });
    }
    /**
     * 发送PUT请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    put(url, data, config) {
        return this.request({
            method: 'PUT',
            url,
            data,
            ...config,
        });
    }
    /**
     * 发送DELETE请求
     * @param url 请求URL
     * @param config 请求配置
     * @returns Promise
     */
    delete(url, config) {
        return this.request({
            method: 'DELETE',
            url,
            ...config,
        });
    }
    /**
     * 发送PATCH请求
     * @param url 请求URL
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise
     */
    patch(url, data, config) {
        return this.request({
            method: 'PATCH',
            url,
            data,
            ...config,
        });
    }
    /**
     * 从API响应中提取数据
     * @param response HTTP响应
     * @returns 数据部分
     */
    extractApiData(response) {
        if (!response.data) {
            throw new Error('响应数据为空');
        }
        const apiResponse = response.data;
        if (apiResponse.code !== 0 && apiResponse.code !== 200) {
            throw new Error(apiResponse.message || '请求失败');
        }
        return apiResponse.data;
    }
}
// 导出默认导出
export default HttpClient;

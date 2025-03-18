/**
 * HTTP请求客户端类
 * 基于Axios封装，提供请求拦截、响应拦截、错误处理、请求取消、缓存等功能
 */
import axios from 'axios';
import { setupDefaultInterceptors } from './interceptors';
import { getCacheKey, getCache, setCache, clearCacheByUrl } from './cache';
import { Funs } from '..';
import { getHttpConfig } from './config';
/**
 * HTTP客户端类
 */
export class HttpClient {
    /**
     * 获取HttpClient单例实例
     * @param config 配置（可选）
     * @returns HttpClient实例
     */
    static getInstance(config) {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient(config);
        }
        return HttpClient.instance;
    }
    /**
     * 更新默认单例实例的配置
     * @param config 新的配置
     * @returns 更新后的HttpClient实例
     */
    static updateConfig(config) {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient(config);
        }
        else {
            HttpClient.instance.updateConfig(config);
        }
        return HttpClient.instance;
    }
    /**
     * 更新当前实例的配置
     * @param config 新的配置
     */
    updateConfig(config) {
        // 更新配置
        this.config = { ...this.config, ...config };
        // 应用新配置到axios实例
        if (config.baseURL !== undefined) {
            this.axiosInstance.defaults.baseURL = config.baseURL;
        }
        if (config.timeout !== undefined) {
            this.axiosInstance.defaults.timeout = config.timeout;
        }
        if (config.headers) {
            this.axiosInstance.defaults.headers = {
                ...this.axiosInstance.defaults.headers,
                ...config.headers
            };
        }
        // 更新其他可能的配置项
        if (config.withCredentials !== undefined) {
            this.axiosInstance.defaults.withCredentials = config.withCredentials;
        }
        if (config.responseType !== undefined) {
            this.axiosInstance.defaults.responseType = config.responseType;
        }
    }
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
        // 保存配置
        this.config = {
            baseURL: globalConfig.baseURL || Funs.getEnv('APP_SERVICE_BASE_URL', ''),
            timeout: globalConfig.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...globalConfig.headers
            },
            ...config,
        };
        // 创建Axios实例
        this.axiosInstance = axios.create(this.config);
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
            if (config.returnResponse === true || !response || !response.data || !this.isApiResponse(response.data)) {
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
    /**
     * 根据URL清除缓存
     * @param url 请求URL
     * @param options 清除选项
     * - method: 请求方法，如 'GET', 'POST' 等，不指定则清除所有方法
     * - exactMatch: 是否精确匹配URL，默认为false
     * - pattern: 是否使用模式匹配
     */
    clearCacheByUrl(url, options) {
        clearCacheByUrl(url, options);
    }
    /**
     * 创建增强版的进度回调处理函数
     * @param progressCallback 原始的进度回调
     * @param infoCallback 增强的进度信息回调
     * @param calculateSpeed 是否计算速度
     * @returns 处理函数
     */
    createProgressHandler(progressCallback, infoCallback, calculateSpeed = false) {
        let startTime = Date.now();
        let lastLoaded = 0;
        let speedSamples = [];
        return (progressEvent) => {
            // 调用原始回调
            if (progressCallback) {
                progressCallback(progressEvent);
            }
            // 如果没有增强回调，直接返回
            if (!infoCallback) {
                return;
            }
            const { loaded, total } = progressEvent;
            const percent = total ? Math.floor((loaded / total) * 100) : 0;
            // 计算速度
            let speed;
            let remainingTime;
            if (calculateSpeed) {
                const currentTime = Date.now();
                const timeDiff = (currentTime - startTime) / 1000; // 转换为秒
                if (timeDiff > 0) {
                    const loadedDiff = loaded - lastLoaded;
                    const currentSpeed = loadedDiff / timeDiff; // bytes/s
                    // 添加样本并保持最多10个
                    speedSamples.push(currentSpeed);
                    if (speedSamples.length > 10) {
                        speedSamples.shift();
                    }
                    // 计算平均速度
                    speed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
                    // 计算剩余时间
                    if (speed > 0 && total) {
                        remainingTime = (total - loaded) / speed;
                    }
                    // 重置计时
                    startTime = currentTime;
                    lastLoaded = loaded;
                }
            }
            // 创建进度信息对象
            const progressInfo = {
                ...progressEvent,
                percent,
                speed,
                remainingTime
            };
            // 调用增强回调
            infoCallback(progressInfo);
        };
    }
    /**
     * 上传文件
     * @param url 上传地址
     * @param file 要上传的文件
     * @param config 配置选项
     * @returns 上传结果
     */
    async upload(url, file, config) {
        // 合并配置
        const mergedConfig = {
            ...this.config,
            ...config,
        };
        // 合并头信息
        mergedConfig.headers = {
            ...(this.config.headers || {}),
            ...(config?.headers || {}),
            'Content-Type': 'multipart/form-data',
        };
        // 创建表单数据
        const formData = new FormData();
        // 如果是Buffer，创建Blob对象
        let fileToUpload;
        if (Buffer.isBuffer(file)) {
            fileToUpload = new Blob([file]);
        }
        else {
            fileToUpload = file;
        }
        // 文件名处理
        const fileName = file.name || config?.fileName || 'file';
        formData.append('file', fileToUpload, fileName);
        // 添加其他表单字段
        if (config && config.data) {
            const data = config.data;
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
        }
        // 处理进度回调
        if (mergedConfig.onUploadProgress || mergedConfig.onUploadProgressInfo) {
            mergedConfig.onUploadProgress = this.createProgressHandler(mergedConfig.onUploadProgress, mergedConfig.onUploadProgressInfo, mergedConfig.calculateSpeed);
        }
        // 发起上传请求
        return this.post(url, formData, mergedConfig);
    }
    /**
     * 上传大文件（分块上传）
     * @param url 上传地址
     * @param file 要上传的文件
     * @param config 配置选项
     * @returns 上传结果
     */
    async uploadLargeFile(url, file, config) {
        // 获取全局配置
        const globalConfig = getHttpConfig();
        // 合并配置
        const mergedConfig = {
            ...this.config,
            ...config,
        };
        // 合并头信息
        mergedConfig.headers = {
            ...(this.config.headers || {}),
            ...(config?.headers || {}),
            'Content-Type': 'application/octet-stream',
        };
        // 块大小和并发数
        const chunkSize = mergedConfig.chunkSize || globalConfig.defaultChunkSize || 1024 * 1024; // 默认1MB
        const concurrency = mergedConfig.concurrency || globalConfig.defaultUploadConcurrency || 3;
        // 断点续传信息
        const resumeInfo = mergedConfig.resumeInfo;
        const startByte = resumeInfo?.startByte || 0;
        const totalSize = file.size;
        // 创建进度追踪对象
        let uploadedBytes = startByte;
        let lastReportTime = Date.now();
        let speedSamples = [];
        // 创建分块
        const chunks = [];
        for (let start = startByte; start < totalSize; start += chunkSize) {
            const end = Math.min(start + chunkSize, totalSize);
            chunks.push({ start, end });
        }
        // 进度回调函数
        const updateProgress = () => {
            if (!mergedConfig.onUploadProgressInfo)
                return;
            const loaded = uploadedBytes;
            const total = totalSize;
            const percent = Math.floor((loaded / total) * 100);
            // 计算速度
            let speed;
            let remainingTime;
            if (mergedConfig.calculateSpeed) {
                const currentTime = Date.now();
                const timeDiff = (currentTime - lastReportTime) / 1000; // 转换为秒
                if (timeDiff > 0.5) { // 至少0.5秒更新一次
                    // 计算平均速度
                    if (speedSamples.length > 0) {
                        speed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
                    }
                    // 重置
                    speedSamples = [];
                    lastReportTime = currentTime;
                    // 计算剩余时间
                    if (speed && speed > 0) {
                        remainingTime = (total - loaded) / speed;
                    }
                }
            }
            const progressInfo = {
                loaded,
                total,
                percent,
                speed,
                remainingTime,
                bytes: loaded,
                estimated: total,
                lengthComputable: true
            };
            mergedConfig.onUploadProgressInfo(progressInfo);
        };
        // 上传单个分块
        const uploadChunk = async (chunk) => {
            const { start, end } = chunk;
            const chunkData = file.slice(start, end);
            // 设置范围头
            const chunkHeaders = {
                ...(mergedConfig.headers || {}),
                'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`,
                'Content-Length': `${end - start}`
            };
            try {
                // 发送分块
                const response = await this.axiosInstance.post(url, chunkData, {
                    ...mergedConfig,
                    headers: chunkHeaders,
                    onUploadProgress: (progressEvent) => {
                        // 更新已上传字节数
                        const chunkUploaded = Math.min(progressEvent.loaded, end - start);
                        uploadedBytes = start + chunkUploaded;
                        // 计算速度
                        if (mergedConfig.calculateSpeed) {
                            const currentTime = Date.now();
                            const timeDiff = (currentTime - lastReportTime) / 1000; // 转换为秒
                            if (timeDiff > 0) {
                                const currentSpeed = progressEvent.loaded / timeDiff;
                                speedSamples.push(currentSpeed);
                            }
                        }
                        updateProgress();
                    }
                });
                return response;
            }
            catch (error) { // 显式指定类型为any
                // 如果支持断点续传，保存当前进度
                if (mergedConfig.resumable) {
                    const newResumeInfo = {
                        startByte: uploadedBytes,
                        totalBytes: totalSize,
                        fileId: file.name || 'unknown'
                    };
                    // 可以在这里保存断点续传信息，例如存储到localStorage
                    console.error('上传中断，断点续传信息:', newResumeInfo);
                }
                throw error;
            }
        };
        // 并发上传分块
        const uploadChunks = async () => {
            let results = [];
            let currentIndex = 0;
            // 并发处理函数
            const processQueue = async () => {
                while (currentIndex < chunks.length) {
                    const chunkIndex = currentIndex++;
                    results[chunkIndex] = await uploadChunk(chunks[chunkIndex]);
                }
            };
            // 创建并发任务
            const tasks = [];
            for (let i = 0; i < Math.min(concurrency, chunks.length); i++) {
                tasks.push(processQueue());
            }
            // 等待所有任务完成
            await Promise.all(tasks);
            // 返回最后一个响应
            return results[results.length - 1];
        };
        // 开始上传
        const response = await uploadChunks();
        // 处理返回结果
        if (mergedConfig.returnResponse) {
            return response;
        }
        else {
            return this.extractApiData(response);
        }
    }
    /**
     * 下载文件
     * @param url 下载地址
     * @param config 配置选项
     * @returns 下载结果（Blob 或 Buffer）
     */
    async download(url, config) {
        // 合并配置
        const mergedConfig = {
            ...this.config,
            ...config,
            responseType: 'blob',
        };
        // 合并头信息
        mergedConfig.headers = {
            ...(this.config.headers || {}),
            ...(config?.headers || {})
        };
        // 处理进度回调
        if (mergedConfig.onDownloadProgress || mergedConfig.onDownloadProgressInfo) {
            mergedConfig.onDownloadProgress = this.createProgressHandler(mergedConfig.onDownloadProgress, mergedConfig.onDownloadProgressInfo, mergedConfig.calculateSpeed);
        }
        try {
            // 断点续传
            if (mergedConfig.resumable && mergedConfig.resumeInfo) {
                const { startByte } = mergedConfig.resumeInfo;
                if (startByte > 0) {
                    const rangeHeaders = {
                        ...(mergedConfig.headers || {}),
                        Range: `bytes=${startByte}-`
                    };
                    mergedConfig.headers = rangeHeaders;
                }
            }
            // 发起下载请求
            const response = await this.axiosInstance.get(url, mergedConfig);
            const data = response.data;
            // 浏览器环境（处理文件保存）
            if (typeof window !== 'undefined' && config?.fileName) {
                this.saveFile(data, config.fileName);
            }
            return data;
        }
        catch (error) { // 显式指定类型为any
            // 处理断点续传
            if (mergedConfig.resumable && error.response && error.response.status === 416) {
                // 范围请求错误，可能是服务器不支持或范围无效
                console.warn('服务器不支持范围请求或范围无效，将从头开始下载');
                // 移除范围头并重试
                const newConfig = { ...mergedConfig };
                if (newConfig.headers && 'Range' in newConfig.headers) {
                    delete newConfig.headers.Range;
                }
                if (newConfig.resumeInfo) {
                    newConfig.resumeInfo.startByte = 0;
                }
                return this.download(url, newConfig);
            }
            throw error;
        }
    }
    /**
     * 大文件下载（支持断点续传）
     * @param url 下载地址
     * @param config 配置选项
     * @returns 下载的文件（Blob 或 Buffer）
     */
    async downloadLargeFile(url, config) {
        // 获取全局配置
        const globalConfig = getHttpConfig();
        // 合并配置
        const mergedConfig = {
            ...this.config,
            ...config,
            responseType: 'arraybuffer',
            headers: {
                ...(this.config.headers || {}),
                ...(config?.headers || {}),
            }
        };
        // 获取文件大小
        const headResponse = await this.axiosInstance.head(url, {
            ...mergedConfig,
            responseType: 'stream'
        });
        const contentLength = parseInt(headResponse.headers['content-length'] || '0', 10);
        if (!contentLength) {
            throw new Error('无法获取文件大小');
        }
        // 块大小和并发数
        const chunkSize = mergedConfig.chunkSize || globalConfig.defaultChunkSize || 1024 * 1024; // 默认1MB
        const concurrency = mergedConfig.concurrency || globalConfig.defaultDownloadConcurrency || 3;
        // 断点续传信息
        const resumeInfo = mergedConfig.resumeInfo;
        const startByte = resumeInfo?.startByte || 0;
        // 创建分块
        const chunks = [];
        for (let start = startByte; start < contentLength; start += chunkSize) {
            const end = Math.min(start + chunkSize, contentLength) - 1;
            chunks.push({ start, end });
        }
        // 进度跟踪
        let downloadedBytes = startByte;
        let lastReportTime = Date.now();
        let speedSamples = [];
        // 进度回调函数
        const updateProgress = () => {
            if (!mergedConfig.onDownloadProgressInfo)
                return;
            const loaded = downloadedBytes;
            const total = contentLength;
            const percent = Math.floor((loaded / total) * 100);
            // 计算速度
            let speed;
            let remainingTime;
            if (mergedConfig.calculateSpeed) {
                const currentTime = Date.now();
                const timeDiff = (currentTime - lastReportTime) / 1000; // 转换为秒
                if (timeDiff > 0.5) { // 至少0.5秒更新一次
                    // 计算平均速度
                    if (speedSamples.length > 0) {
                        speed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
                    }
                    // 重置
                    speedSamples = [];
                    lastReportTime = currentTime;
                    // 计算剩余时间
                    if (speed && speed > 0) {
                        remainingTime = (total - loaded) / speed;
                    }
                }
            }
            const progressInfo = {
                loaded,
                total,
                percent,
                speed,
                remainingTime,
                bytes: loaded,
                estimated: total,
                lengthComputable: true
            };
            mergedConfig.onDownloadProgressInfo(progressInfo);
        };
        // 下载单个分块
        const downloadChunk = async (chunk) => {
            const { start, end } = chunk;
            // 设置范围头
            const headers = {
                ...mergedConfig.headers,
                Range: `bytes=${start}-${end}`
            };
            try {
                // 发送请求
                const response = await this.axiosInstance.get(url, {
                    ...mergedConfig,
                    headers,
                    onDownloadProgress: (progressEvent) => {
                        // 更新已下载字节数
                        const chunkDownloaded = Math.min(progressEvent.loaded, end - start + 1);
                        downloadedBytes = start + chunkDownloaded;
                        // 计算速度
                        if (mergedConfig.calculateSpeed) {
                            const currentTime = Date.now();
                            const timeDiff = (currentTime - lastReportTime) / 1000; // 转换为秒
                            if (timeDiff > 0) {
                                const currentSpeed = progressEvent.loaded / timeDiff;
                                speedSamples.push(currentSpeed);
                            }
                        }
                        updateProgress();
                    }
                });
                // 保存数据
                chunk.data = response.data;
                return chunk;
            }
            catch (error) {
                // 如果支持断点续传，保存当前进度
                if (mergedConfig.resumable) {
                    const newResumeInfo = {
                        startByte: downloadedBytes,
                        totalBytes: contentLength,
                        fileId: config?.fileName || url.split('/').pop() || 'unknown'
                    };
                    // 可以在这里保存断点续传信息，例如存储到localStorage
                    console.error('下载中断，断点续传信息:', newResumeInfo);
                }
                throw error;
            }
        };
        // 并发下载分块
        const downloadChunks = async () => {
            let results = [];
            let currentIndex = 0;
            // 并发处理函数
            const processQueue = async () => {
                while (currentIndex < chunks.length) {
                    const chunkIndex = currentIndex++;
                    results[chunkIndex] = await downloadChunk(chunks[chunkIndex]);
                }
            };
            // 创建并发任务
            const tasks = [];
            for (let i = 0; i < Math.min(concurrency, chunks.length); i++) {
                tasks.push(processQueue());
            }
            // 等待所有任务完成
            await Promise.all(tasks);
            return results;
        };
        // 开始下载
        const downloadedChunks = await downloadChunks();
        // 合并分块
        const totalSize = contentLength - startByte;
        const result = new Uint8Array(totalSize);
        let offset = 0;
        downloadedChunks.forEach(chunk => {
            if (chunk.data) {
                const data = new Uint8Array(chunk.data);
                result.set(data, offset);
                offset += data.length;
            }
        });
        // 创建Blob或Buffer
        if (typeof window !== 'undefined') {
            const blob = new Blob([result]);
            // 如果需要保存文件
            if (config?.fileName) {
                this.saveFile(blob, config.fileName);
            }
            return blob;
        }
        else {
            // Node.js环境
            return Buffer.from(result);
        }
    }
    /**
     * 保存文件到客户端（仅浏览器环境）
     * @param blob 文件blob
     * @param fileName 文件名
     */
    saveFile(blob, fileName) {
        // 仅在浏览器环境中执行
        if (typeof window === 'undefined') {
            return;
        }
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        // 触发下载
        document.body.appendChild(a);
        a.click();
        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
// 单例实例
HttpClient.instance = null;

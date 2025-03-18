/**
 * HTTP请求拦截器配置
 * 提供默认的请求和响应拦截器
 */

import type { AxiosError, AxiosHeaders } from 'axios';
import type { HttpRequestConfig, HttpResponse } from './types';
import { Funs } from '../funs';
import { getErrorMessage, getAuthToken, getCurrentLanguage, handleAuthFailed, getHttpConfig } from './config';

// 请求拦截器
export function requestInterceptor(config: HttpRequestConfig) {
    const { debug } = getHttpConfig();

    // 添加 token
    if (!config.skipAuth) {
        const token = getAuthToken();
        if (token) {
            if (!config.headers) {
                config.headers = {} as AxiosHeaders;
            }
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // 添加语言
    const language = getCurrentLanguage();
    if (!config.headers) {
        config.headers = {} as AxiosHeaders;
    }
    config.headers['Accept-Language'] = language;

    // 添加客户端标识
    const clientToken = localStorage.getItem('clientToken');
    if (clientToken && config.headers) {
        config.headers['X-CLIENT-ID'] = clientToken;
    }

    // 调试信息
    if (debug && Funs.isDevelopment()) {
        console.log('HTTP Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            params: config.params,
            data: config.data
        });
    }

    return config;
}

// 响应拦截器
export function responseInterceptor(response: HttpResponse<any>) {
    const { debug } = getHttpConfig();

    // 处理 loading 状态
    if ((response.config as HttpRequestConfig).showLoading !== false) {
        // hideLoading();
    }

    // 调试信息
    if (debug && Funs.isDevelopment()) {
        console.log('HTTP Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
    }

    // 处理响应数据
    const data = response.data;
    if (!data) {
        return Promise.reject(new Error('Response data is empty'));
    }

    // 处理业务错误
    if (data.code !== 0 && data.code !== 200) {
        const errorMessage = getErrorMessage(data.code, data.message || 'Unknown error');
        const error = new Error(errorMessage);
        return Promise.reject(error);
    }

    return response;
}

// 错误处理器
export function errorHandler(error: AxiosError) {
    const { debug } = getHttpConfig();

    // 处理 loading 状态
    // hideLoading();

    if (error.response) {
        const status = error.response.status.toString();
        const defaultMessage = error.message || 'Unknown error';
        const errorMessage = getErrorMessage(status, defaultMessage);

        // 调试信息
        if (debug && Funs.isDevelopment()) {
            console.error('API Error:', {
                status,
                url: error.config?.url || '',
                message: error.message,
                response: error.response
            });
        }

        // 处理特定状态码
        switch (status) {
            case '401':
                // 处理未授权错误
                handleAuthFailed();
                break;
            case '403':
                // 处理权限错误
                break;
            default:
                // 处理其他错误
                if (Funs.isDevelopment()) {
                    console.error('API Error:', {
                        status,
                        url: error.config?.url || '',
                        message: error.message,
                        response: error.response
                    });
                }
        }

        return Promise.reject(new Error(errorMessage));
    }

    if (error.request) {
        // 请求已发出但没有收到响应
        const networkErrorMessage = getErrorMessage('network', 'Network error');
        return Promise.reject(new Error(networkErrorMessage));
    }

    // 请求配置发生错误
    return Promise.reject(error);
}

/**
 * 设置默认拦截器
 * @param client HTTP客户端实例
 */
export function setupDefaultInterceptors(client: any): void {
    client.addRequestInterceptor(requestInterceptor);
    client.addResponseInterceptor(responseInterceptor);
    client.addErrorInterceptor(errorHandler);
}

// 导出默认拦截器配置
export const defaultInterceptors = {
    request: requestInterceptor,
    response: responseInterceptor,
    error: errorHandler
};
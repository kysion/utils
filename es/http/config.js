/**
 * HTTP全局配置管理模块
 */
// 默认错误消息
const DEFAULT_ERROR_MESSAGES = {
    '400': '请求参数错误',
    '401': '未授权，请登录',
    '403': '拒绝访问',
    '404': '请求地址出错',
    '408': '请求超时',
    '500': '服务器内部错误',
    '501': '服务未实现',
    '502': '网关错误',
    '503': '服务不可用',
    '504': '网关超时',
    '505': 'HTTP版本不受支持'
};
// 默认配置
const defaultConfig = {
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
    defaultLanguage: 'zh-CN',
    debug: false,
    errorMessages: DEFAULT_ERROR_MESSAGES,
    defaultCacheTime: 5 * 60 * 1000, // 5分钟
    getCurrentLanguage: () => localStorage.getItem('language') || 'zh-CN',
    getAuthToken: () => localStorage.getItem('token')
};
// 全局配置实例
let globalConfig = { ...defaultConfig };
/**
 * 配置HTTP客户端
 * @param config 配置对象
 */
export function configureHttp(config) {
    globalConfig = {
        ...globalConfig,
        ...config,
        headers: {
            ...globalConfig.headers,
            ...config.headers
        },
        errorMessages: {
            ...globalConfig.errorMessages,
            ...config.errorMessages
        }
    };
}
/**
 * 重置为默认配置
 */
export function resetHttpConfig() {
    globalConfig = { ...defaultConfig };
}
/**
 * 获取全局配置
 */
export function getHttpConfig() {
    return globalConfig;
}
/**
 * 获取错误消息
 * @param code 错误码
 * @param defaultMessage 默认消息
 */
export function getErrorMessage(code, defaultMessage) {
    const { errorMessages, translateErrorMessage, getCurrentLanguage, defaultLanguage } = globalConfig;
    // 如果有翻译函数，优先使用翻译函数
    if (translateErrorMessage) {
        const lang = getCurrentLanguage ? getCurrentLanguage() : defaultLanguage;
        return translateErrorMessage(code, defaultMessage, lang);
    }
    // 否则从错误消息映射中获取
    if (errorMessages) {
        const codeStr = String(code);
        const message = errorMessages[codeStr];
        if (typeof message === 'string') {
            return message;
        }
        if (message && typeof message === 'object') {
            const lang = getCurrentLanguage ? getCurrentLanguage() : defaultLanguage;
            return message[lang || 'zh-CN'] || message['en'] || defaultMessage;
        }
    }
    return defaultMessage;
}
/**
 * 获取当前语言
 */
export function getCurrentLanguage() {
    return globalConfig.getCurrentLanguage ?
        globalConfig.getCurrentLanguage() :
        globalConfig.defaultLanguage || 'zh-CN';
}
/**
 * 获取认证令牌
 */
export function getAuthToken() {
    return globalConfig.getAuthToken ?
        globalConfig.getAuthToken() :
        localStorage.getItem('token');
}
/**
 * 处理认证失败
 */
export function handleAuthFailed() {
    if (globalConfig.onAuthFailed) {
        globalConfig.onAuthFailed();
    }
    else {
        // 默认行为：清除token并跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}
// 导出默认配置和错误消息，方便使用
export { defaultConfig, DEFAULT_ERROR_MESSAGES };

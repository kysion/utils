import { configureHttp, resetHttpConfig, getHttpConfig, getErrorMessage, getCurrentLanguage, getAuthToken, handleAuthFailed } from '../../http/config';
describe('Config Module', () => {
    // 用于存储原始的localStorage方法
    let originalLocalStorage;
    // 保存并模拟localStorage
    beforeEach(() => {
        // 保存原始方法
        originalLocalStorage = window.localStorage;
        // 创建mock
        const localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'token')
                    return 'test-token';
                if (key === 'language')
                    return 'zh-CN';
                return null;
            }),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            length: 0,
            key: jest.fn()
        };
        // 替换localStorage
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
        // 重置配置和模拟
        resetHttpConfig();
        jest.clearAllMocks();
        window.location.href = '';
    });
    // 恢复原始的localStorage
    afterEach(() => {
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true
        });
    });
    describe('configureHttp', () => {
        test('应正确配置HTTP客户端', () => {
            const config = {
                baseURL: 'https://api.example.com',
                timeout: 5000,
                headers: { 'X-Custom-Header': 'test' },
                debug: true
            };
            configureHttp(config);
            const currentConfig = getHttpConfig();
            expect(currentConfig.baseURL).toBe('https://api.example.com');
            expect(currentConfig.timeout).toBe(5000);
            expect(currentConfig.headers).toMatchObject({ 'X-Custom-Header': 'test' });
            expect(currentConfig.debug).toBe(true);
        });
        test('应合并默认配置和自定义配置', () => {
            // 先配置一些基本设置
            configureHttp({ baseURL: 'https://api.example.com' });
            // 再添加更多配置
            configureHttp({
                timeout: 10000,
                headers: { 'X-Custom-Header': 'test' }
            });
            const config = getHttpConfig();
            expect(config.baseURL).toBe('https://api.example.com');
            expect(config.timeout).toBe(10000);
            expect(config.headers).toMatchObject({ 'X-Custom-Header': 'test' });
        });
        test('应正确合并headers和errorMessages', () => {
            configureHttp({
                headers: { 'X-Header-1': 'value1' },
                errorMessages: { '404': '找不到资源' }
            });
            configureHttp({
                headers: { 'X-Header-2': 'value2' },
                errorMessages: { '500': '服务器错误' }
            });
            const config = getHttpConfig();
            expect(config.headers).toMatchObject({
                'X-Header-1': 'value1',
                'X-Header-2': 'value2'
            });
            expect(config.errorMessages).toEqual(expect.objectContaining({
                '404': '找不到资源',
                '500': '服务器错误'
            }));
        });
    });
    describe('resetHttpConfig', () => {
        test('应重置为默认配置', () => {
            // 先设置自定义配置
            configureHttp({
                baseURL: 'https://api.example.com',
                timeout: 10000
            });
            // 验证配置已更改
            let config = getHttpConfig();
            expect(config.baseURL).toBe('https://api.example.com');
            // 重置配置
            resetHttpConfig();
            // 验证已恢复默认值
            config = getHttpConfig();
            expect(config.baseURL).toBeUndefined();
            expect(config.timeout).toBe(30000);
            expect(config.defaultLanguage).toBe('zh-CN');
        });
    });
    describe('getErrorMessage', () => {
        test('应从errorMessages获取错误消息', () => {
            // 先重置移除内置的错误消息
            resetHttpConfig();
            configureHttp({
                errorMessages: {
                    '404': '找不到资源',
                    '500': '服务器错误'
                }
            });
            expect(getErrorMessage('404', '默认消息')).toBe('找不到资源');
            expect(getErrorMessage('500', '默认消息')).toBe('服务器错误');
            // 确保使用默认消息
            expect(getErrorMessage('999', '默认消息')).toBe('默认消息');
        });
        test('应支持多语言错误消息', () => {
            configureHttp({
                errorMessages: {
                    'network': {
                        'zh-CN': '网络错误',
                        'en': 'Network error'
                    }
                },
                getCurrentLanguage: () => 'en'
            });
            expect(getErrorMessage('network', '默认消息')).toBe('Network error');
            // 切换语言
            configureHttp({
                getCurrentLanguage: () => 'zh-CN'
            });
            expect(getErrorMessage('network', '默认消息')).toBe('网络错误');
        });
        test('应使用自定义翻译函数', () => {
            const translateFn = jest.fn((code, message) => `翻译: ${code} - ${message}`);
            configureHttp({
                translateErrorMessage: translateFn
            });
            expect(getErrorMessage('404', '默认消息')).toBe('翻译: 404 - 默认消息');
            expect(translateFn).toHaveBeenCalledWith('404', '默认消息', expect.any(String));
        });
    });
    describe('getCurrentLanguage', () => {
        test('应使用默认语言获取函数', () => {
            // 禁用默认实现，以测试我们自己的mock
            const originalGetCurrentLanguage = getHttpConfig().getCurrentLanguage;
            configureHttp({ getCurrentLanguage: undefined });
            // 确保localStorage.getItem返回'zh-CN'
            jest.spyOn(localStorage, 'getItem').mockReturnValue('zh-CN');
            // 只验证返回值而不验证调用
            const result = getCurrentLanguage();
            expect(result).toBe('zh-CN');
            // 恢复原始实现
            configureHttp({ getCurrentLanguage: originalGetCurrentLanguage });
        });
        test('应使用自定义语言获取函数', () => {
            const getLanguageFn = jest.fn(() => 'en-US');
            configureHttp({
                getCurrentLanguage: getLanguageFn
            });
            expect(getCurrentLanguage()).toBe('en-US');
            expect(getLanguageFn).toHaveBeenCalled();
        });
    });
    describe('getAuthToken', () => {
        test('应从localStorage获取令牌', () => {
            // 禁用默认实现，以测试我们自己的mock
            const originalGetAuthToken = getHttpConfig().getAuthToken;
            configureHttp({ getAuthToken: undefined });
            expect(getAuthToken()).toBe('test-token');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
            // 恢复原始实现
            configureHttp({ getAuthToken: originalGetAuthToken });
        });
        test('应使用自定义令牌获取函数', () => {
            const getTokenFn = jest.fn(() => 'custom-token');
            configureHttp({
                getAuthToken: getTokenFn
            });
            expect(getAuthToken()).toBe('custom-token');
            expect(getTokenFn).toHaveBeenCalled();
        });
    });
    describe('handleAuthFailed', () => {
        test('应执行默认未授权处理', () => {
            // 模拟 handleAuthFailed 函数
            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                value: { href: '' },
                writable: true
            });
            // 测试函数调用
            handleAuthFailed();
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
            // 恢复原始location
            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true
            });
        });
        test('应使用自定义未授权处理函数', () => {
            const authFailedFn = jest.fn();
            configureHttp({
                onAuthFailed: authFailedFn
            });
            handleAuthFailed();
            expect(authFailedFn).toHaveBeenCalled();
            expect(window.localStorage.removeItem).not.toHaveBeenCalled();
        });
    });
});

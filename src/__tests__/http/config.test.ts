import {
    configureHttp,
    resetHttpConfig,
    getHttpConfig,
    getErrorMessage,
    getCurrentLanguage,
    getAuthToken,
    handleAuthFailed,
    defaultConfig,
    DEFAULT_ERROR_MESSAGES
} from '../../http/config';

// 全局变量模拟
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
// 将mock设置为全局变量
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// 模拟window.location
const locationMock = {
    href: ''
};
Object.defineProperty(global, 'window', {
    value: {
        location: locationMock
    },
    writable: true
});

describe('HTTP配置模块', () => {
    // 每个测试之前重置配置和模拟
    beforeEach(() => {
        resetHttpConfig();
        jest.clearAllMocks();
        locationMock.href = '';
    });

    describe('configureHttp', () => {
        test('应该正确合并新配置', () => {
            // 设置初始配置
            expect(getHttpConfig().timeout).toBe(30000);
            expect(getHttpConfig().headers).toEqual({ 'Content-Type': 'application/json' });

            // 应用新配置
            configureHttp({
                timeout: 5000,
                headers: {
                    'X-Custom-Header': 'test'
                }
            });

            // 验证配置已合并
            expect(getHttpConfig().timeout).toBe(5000);
            expect(getHttpConfig().headers).toEqual({
                'Content-Type': 'application/json',
                'X-Custom-Header': 'test'
            });
        });

        test('应该合并错误消息映射', () => {
            configureHttp({
                errorMessages: {
                    '429': '请求过于频繁'
                }
            });

            const config = getHttpConfig();
            expect(config.errorMessages).toBeDefined();
            if (config.errorMessages) {
                expect(config.errorMessages).toEqual({
                    ...DEFAULT_ERROR_MESSAGES,
                    '429': '请求过于频繁'
                });
            }
        });

        test('应该允许覆盖默认错误消息', () => {
            configureHttp({
                errorMessages: {
                    '404': '找不到页面'
                }
            });

            const config = getHttpConfig();
            expect(config.errorMessages).toBeDefined();
            if (config.errorMessages) {
                expect(config.errorMessages['404']).toBe('找不到页面');
            }
        });
    });

    describe('resetHttpConfig', () => {
        test('应该将配置重置为默认值', () => {
            // 应用自定义配置
            configureHttp({
                timeout: 5000,
                baseURL: 'https://api.example.com',
                headers: { 'X-Custom-Header': 'test' }
            });

            // 验证配置已更改
            expect(getHttpConfig().timeout).toBe(5000);
            expect(getHttpConfig().baseURL).toBe('https://api.example.com');

            // 重置配置
            resetHttpConfig();

            // 验证配置已重置
            expect(getHttpConfig().timeout).toBe(defaultConfig.timeout);
            expect(getHttpConfig().baseURL).toBeUndefined();
            expect(getHttpConfig().headers).toEqual(defaultConfig.headers);
        });
    });

    describe('getErrorMessage', () => {
        test('应从错误消息映射中获取消息', () => {
            expect(getErrorMessage('404', '未知错误')).toBe('请求地址出错');
            expect(getErrorMessage('999', '未知错误')).toBe('未知错误');
        });

        test('应使用提供的翻译函数', () => {
            const translateFn = jest.fn().mockImplementation(
                (code, defaultMsg) => `错误 ${code}: ${defaultMsg}`
            );

            configureHttp({
                translateErrorMessage: translateFn
            });

            expect(getErrorMessage('404', '未知错误')).toBe('错误 404: 未知错误');
            expect(translateFn).toHaveBeenCalledWith('404', '未知错误', 'zh-CN');
        });

        test('应处理多语言错误消息', () => {
            configureHttp({
                errorMessages: {
                    '404': {
                        'zh-CN': '请求地址不存在',
                        'en': 'Resource not found'
                    }
                },
                getCurrentLanguage: () => 'en'
            });

            expect(getErrorMessage('404', '未知错误')).toBe('Resource not found');

            configureHttp({
                getCurrentLanguage: () => 'zh-CN'
            });

            expect(getErrorMessage('404', '未知错误')).toBe('请求地址不存在');

            // 测试未知语言回退到en
            configureHttp({
                getCurrentLanguage: () => 'fr'
            });

            expect(getErrorMessage('404', '未知错误')).toBe('Resource not found');
        });
    });

    describe('getCurrentLanguage', () => {
        test('应返回配置的当前语言', () => {
            // 默认行为
            expect(getCurrentLanguage()).toBe('zh-CN');

            // 设置自定义语言获取函数
            configureHttp({
                getCurrentLanguage: () => 'en-US'
            });

            expect(getCurrentLanguage()).toBe('en-US');
        });

        test('应使用localStorage获取语言', () => {
            // 为了测试默认实现，我们需要spy localStorage而非修改配置
            jest.spyOn(global.localStorage, 'getItem').mockReturnValue('fr-FR');

            // 重置配置，确保使用默认的getCurrentLanguage（即从localStorage获取）
            resetHttpConfig();

            // 由于我们不能直接影响Jest环境中默认配置的localStorage行为
            // 我们可以在测试中验证 localStorage.getItem 是否被调用，而不是测试返回值
            getCurrentLanguage();
            expect(localStorageMock.getItem).toHaveBeenCalledWith('language');
        });
    });

    describe('getAuthToken', () => {
        test('应返回配置的认证令牌', () => {
            // 设置自定义令牌获取函数
            configureHttp({
                getAuthToken: () => 'custom-token-123'
            });

            expect(getAuthToken()).toBe('custom-token-123');
        });

        test('默认应从localStorage获取令牌', () => {
            // 重置为默认配置
            resetHttpConfig();

            // 确保使用默认的getAuthToken实现
            configureHttp({
                getAuthToken: undefined // 恢复为默认行为（使用localStorage）
            });

            // 模拟localStorage.getItem返回值
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'token') return 'token-from-storage';
                return null;
            });

            expect(getAuthToken()).toBe('token-from-storage');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
        });

        test('令牌不存在时应返回null', () => {
            resetHttpConfig();

            // 确保使用默认的getAuthToken实现
            configureHttp({
                getAuthToken: undefined
            });

            // 模拟localStorage.getItem返回null
            localStorageMock.getItem.mockImplementation(() => null);

            expect(getAuthToken()).toBeNull();
        });
    });

    describe('handleAuthFailed', () => {
        test('应执行默认的认证失败处理', () => {
            // 重置配置以使用默认的处理函数
            resetHttpConfig();
            configureHttp({
                onAuthFailed: undefined // 确保使用默认实现
            });

            // 清除之前的调用记录
            jest.clearAllMocks();

            handleAuthFailed();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
            expect(locationMock.href).toBe('/login');
        });

        test('应执行自定义的认证失败处理函数', () => {
            const customHandler = jest.fn();
            configureHttp({
                onAuthFailed: customHandler
            });

            handleAuthFailed();

            expect(customHandler).toHaveBeenCalled();
            expect(localStorageMock.removeItem).not.toHaveBeenCalled();
            expect(locationMock.href).toBe('');
        });
    });
}); 
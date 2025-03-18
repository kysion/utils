import {
    getCacheKey,
    getCache,
    setCache,
    clearCache,
    clearAllCache,
    clearExpiredCache,
    enableTestMode
} from '../../http/cache';
import { HttpRequestConfig } from '../../http/types';

// 模拟getHttpConfig
jest.mock('../../http/config', () => ({
    getHttpConfig: jest.fn().mockReturnValue({
        defaultCacheTime: 5 * 60 * 1000 // 5分钟
    })
}));

// Jest模拟类型
type JestMockFunction<T extends (...args: any) => any> = {
    mockReturnValueOnce: (value: ReturnType<T>) => JestMockFunction<T>;
    mockReturnValue: (value: ReturnType<T>) => JestMockFunction<T>;
    mockImplementationOnce: (fn: T) => JestMockFunction<T>;
    mockImplementation: (fn: T) => JestMockFunction<T>;
    mock: {
        calls: any[][];
    };
};

describe('Cache Module', () => {
    // 用于存储原始的localStorage方法
    let originalLocalStorage: Storage;

    // 保存并模拟localStorage
    beforeEach(() => {
        // 启用测试模式
        enableTestMode();

        // 保存原始方法
        originalLocalStorage = window.localStorage;

        // 创建mock
        const localStorageMock = {
            getItem: jest.fn(),
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

        // 清除所有模拟状态
        jest.clearAllMocks();
    });

    // 恢复原始的localStorage
    afterEach(() => {
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true
        });
    });

    describe('getCacheKey', () => {
        test('应从请求配置生成正确的缓存键', () => {
            const config: HttpRequestConfig = {
                method: 'GET',
                url: '/api/users',
                params: { page: 1, limit: 10 },
                data: null
            };

            const key = getCacheKey(config);
            expect(key).toBe('GET:/api/users:{"page":1,"limit":10}:null');
        });

        test('应处理缺少的字段', () => {
            const config: HttpRequestConfig = {
                url: '/api/users'
            };

            const key = getCacheKey(config);
            expect(key).toBe('GET:/api/users:undefined:undefined');
        });
    });

    describe('getCache', () => {
        test('应返回有效的缓存数据', async () => {
            const mockCacheData = {
                data: { data: 'cached data' },
                expireAt: Date.now() + 1000 // 1秒后过期
            };

            // 设置返回mock数据
            (window.localStorage.getItem as unknown as JestMockFunction<typeof window.localStorage.getItem>)
                .mockReturnValueOnce(JSON.stringify(mockCacheData));

            const result = await getCache('test-key');
            expect(result).toEqual({ data: 'cached data' });
            expect(window.localStorage.getItem).toHaveBeenCalledWith('http_cache:test-key');
        });

        test('应返回null如果缓存不存在', async () => {
            (window.localStorage.getItem as unknown as JestMockFunction<typeof window.localStorage.getItem>)
                .mockReturnValueOnce(null);

            const result = await getCache('test-key');
            expect(result).toBeNull();
        });

        test('应清除并返回null如果缓存已过期', async () => {
            const mockCacheData = {
                data: { data: 'expired data' },
                expireAt: Date.now() - 1000 // 已过期
            };

            (window.localStorage.getItem as unknown as JestMockFunction<typeof window.localStorage.getItem>)
                .mockReturnValueOnce(JSON.stringify(mockCacheData));

            const result = await getCache('test-key');
            expect(result).toBeNull();
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('http_cache:test-key');
        });

        test('应处理JSON解析错误', async () => {
            (window.localStorage.getItem as unknown as JestMockFunction<typeof window.localStorage.getItem>)
                .mockReturnValueOnce('invalid json');

            const result = await getCache('test-key');
            expect(result).toBeNull();
        });
    });

    describe('setCache', () => {
        test('应正确设置缓存数据', async () => {
            const data = { status: 200, data: { result: 'success' } };

            await setCache('test-key', data as any, 60000);

            expect(window.localStorage.setItem).toHaveBeenCalled();

            // 验证参数
            const calls = (window.localStorage.setItem as unknown as JestMockFunction<typeof window.localStorage.setItem>).mock.calls;
            expect(calls[0][0]).toBe('http_cache:test-key');

            const parsed = JSON.parse(calls[0][1]);
            expect(parsed.data).toEqual(data);
            expect(typeof parsed.expireAt).toBe('number');
        });

        test('应使用默认缓存时间', async () => {
            const now = Date.now();
            const realDateNow = Date.now;
            Date.now = jest.fn(() => now);

            const data = { status: 200, data: { result: 'success' } };
            await setCache('test-key', data as any);

            // 验证参数
            const calls = (window.localStorage.setItem as unknown as JestMockFunction<typeof window.localStorage.setItem>).mock.calls;
            const parsed = JSON.parse(calls[0][1]);

            // 默认缓存时间应为5分钟
            expect(parsed.expireAt).toBe(now + 5 * 60 * 1000);

            // 恢复Date.now
            Date.now = realDateNow;
        });

        test('应处理存储错误', async () => {
            // 模拟抛出错误
            (window.localStorage.setItem as unknown as JestMockFunction<typeof window.localStorage.setItem>)
                .mockImplementationOnce(() => {
                    throw new Error('Storage error');
                });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const data = { status: 200, data: { result: 'success' } };
            await setCache('test-key', data as any);

            expect(consoleSpy).toHaveBeenCalled();

            // 恢复console.error
            consoleSpy.mockRestore();
        });
    });

    describe('clearCache', () => {
        test('应清除指定的缓存', () => {
            clearCache('test-key');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('http_cache:test-key');
        });
    });

    describe('clearAllCache', () => {
        test('应清除所有缓存', () => {
            // 模拟Object.keys
            const mockKeys = ['http_cache:key1', 'http_cache:key2', 'other-key'];
            jest.spyOn(Object, 'keys').mockReturnValueOnce(mockKeys);

            clearAllCache();

            // 只应删除http_cache前缀的键
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('http_cache:key1');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('http_cache:key2');
            expect(window.localStorage.removeItem).not.toHaveBeenCalledWith('other-key');
        });
    });

    describe('clearExpiredCache', () => {
        test('应清除所有过期缓存', () => {
            const now = Date.now();
            const realDateNow = Date.now;
            Date.now = jest.fn(() => now);

            // 模拟Object.keys
            const mockKeys = ['http_cache:valid', 'http_cache:expired', 'http_cache:invalid'];
            jest.spyOn(Object, 'keys').mockReturnValueOnce(mockKeys);

            // 模拟localStorage.getItem的不同返回值
            (window.localStorage.getItem as unknown as JestMockFunction<typeof window.localStorage.getItem>)
                .mockImplementation((key: string) => {
                    if (key === 'http_cache:valid') {
                        return JSON.stringify({ expireAt: now + 1000 });
                    }
                    if (key === 'http_cache:expired') {
                        return JSON.stringify({ expireAt: now - 1000 });
                    }
                    if (key === 'http_cache:invalid') {
                        return 'invalid json';
                    }
                    return null;
                });

            clearExpiredCache();

            // 只应删除过期的缓存
            expect(window.localStorage.removeItem).not.toHaveBeenCalledWith('http_cache:valid');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('http_cache:expired');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('http_cache:invalid');

            // 恢复Date.now
            Date.now = realDateNow;
        });
    });
}); 
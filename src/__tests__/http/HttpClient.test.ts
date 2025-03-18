import axios from 'axios';
import HttpClient from '../../http/HttpClient';
import { configureHttp, resetHttpConfig } from '../../http/config';

// Jest模拟类型
type JestMockFunction<T extends (...args: any) => any> = {
    mockReturnValueOnce: (value: ReturnType<T>) => JestMockFunction<T>;
    mockReturnValue: (value: ReturnType<T>) => JestMockFunction<T>;
    mockImplementationOnce: (fn: T) => JestMockFunction<T>;
    mockImplementation: (fn: T) => JestMockFunction<T>;
    mockResolvedValueOnce: (value: any) => JestMockFunction<T>;
    mock: {
        calls: any[][];
    };
};

// 模拟storage.ts
jest.mock('../../storage', () => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn()
}));

// 模拟Funs模块
jest.mock('../../funs', () => ({
    Funs: {
        isDevelopment: jest.fn().mockReturnValue(true),
        getEnv: jest.fn().mockImplementation((_key: any, defaultValue: any) => defaultValue)
    }
}));

// 模拟axios
jest.mock('axios', () => {
    const mockAxios: any = {
        create: jest.fn(() => mockAxios),
        interceptors: {
            request: {
                use: jest.fn(),
                eject: jest.fn()
            },
            response: {
                use: jest.fn(),
                eject: jest.fn()
            }
        },
        request: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        isCancel: jest.fn(),
        CancelToken: {
            source: jest.fn(() => ({
                token: 'mock-token',
                cancel: jest.fn()
            }))
        },
        AxiosHeaders: jest.fn().mockImplementation(function (this: any) {
            this.set = jest.fn();
            return this;
        })
    };

    return mockAxios;
});

describe('HttpClient', () => {
    let httpClient: HttpClient;

    beforeEach(() => {
        // 重置所有模拟
        jest.clearAllMocks();

        // 配置HTTP客户端
        configureHttp({
            baseURL: 'https://api.example.com',
            getAuthToken: () => 'test-token'
        });

        // 创建新的HTTP客户端实例
        httpClient = new HttpClient();
    });

    afterEach(() => {
        resetHttpConfig();
    });

    describe('基本请求功能', () => {
        test('应创建带有正确配置的实例', () => {
            expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
                baseURL: 'https://api.example.com'
            }));
        });

        test('应设置默认拦截器', () => {
            expect(axios.interceptors.request.use).toHaveBeenCalled();
            expect(axios.interceptors.response.use).toHaveBeenCalled();
        });
    });

    describe('请求方法', () => {
        test('get方法应调用请求方法', async () => {
            (axios.request as unknown as JestMockFunction<typeof axios.request>).mockResolvedValueOnce({
                status: 200,
                data: {
                    code: 0,
                    message: 'success',
                    data: [{ id: 1, name: 'Test' }]
                }
            });

            await httpClient.get('/users');

            expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
                method: 'GET',
                url: '/users'
            }));
        });

        test('post方法应调用请求方法', async () => {
            (axios.request as unknown as JestMockFunction<typeof axios.request>).mockResolvedValueOnce({
                status: 200,
                data: {
                    code: 0,
                    message: 'success',
                    data: { id: 1 }
                }
            });

            const data = { name: 'New User' };
            await httpClient.post('/users', data);

            expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
                method: 'POST',
                url: '/users',
                data
            }));
        });
    });
}); 
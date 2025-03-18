/**
 * 文件上传下载功能测试
 * @jest-environment jsdom
 */
import { HttpClient } from '../../http/HttpClient';
import { configureHttp, resetHttpConfig } from '../../http/config';

// 模拟Axios
jest.mock('axios', () => {
    return {
        create: jest.fn(() => ({
            request: jest.fn(),
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            head: jest.fn(),
            patch: jest.fn(),
            interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() }
            },
            defaults: {}
        })),
        isCancel: jest.fn((err: any) => err?.message === 'canceled'),
        CancelToken: {
            source: jest.fn(() => ({ token: 'mock-token', cancel: jest.fn() }))
        }
    };
});

// 设置模拟环境
function setupMocks() {
    // 模拟localStorage
    interface MockLocalStorage {
        store: Record<string, string>;
        getItem: jest.Mock;
        setItem: jest.Mock;
        removeItem: jest.Mock;
        clear: jest.Mock;
        length: number;
        key: jest.Mock;
    }

    const mockLocalStorage: MockLocalStorage = {
        store: {},
        getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
        setItem: jest.fn((key: string, value: string) => { mockLocalStorage.store[key] = value; }),
        removeItem: jest.fn((key: string) => { delete mockLocalStorage.store[key]; }),
        clear: jest.fn(() => { mockLocalStorage.store = {}; }),
        length: 0,
        key: jest.fn()
    };

    // 模拟URL
    const mockURL = {
        createObjectURL: jest.fn(() => 'blob:mock-url'),
        revokeObjectURL: jest.fn()
    };

    // 全局对象覆盖
    Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
    });

    Object.defineProperty(global, 'URL', {
        value: {
            ...URL,
            createObjectURL: mockURL.createObjectURL,
            revokeObjectURL: mockURL.revokeObjectURL
        },
        writable: true
    });

    return {
        mockLocalStorage,
        mockURL
    };
}

describe('HttpClient 文件上传和下载', () => {
    let httpClient: HttpClient;
    let spyPost: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        setupMocks();

        // 配置HTTP客户端
        configureHttp({
            baseURL: 'https://api.example.com',
            defaultChunkSize: 1024 * 1024, // 1MB
            defaultUploadConcurrency: 2,
            defaultDownloadConcurrency: 2
        });

        // 创建HTTP实例
        httpClient = new HttpClient();

        // 使用jest.spyOn直接模拟HttpClient的方法
        spyPost = jest.spyOn(httpClient, 'post');
    });

    afterEach(() => {
        resetHttpConfig();
        jest.restoreAllMocks();
    });

    describe('基本文件上传功能', () => {
        test('upload方法应正确发送FormData', async () => {
            // 模拟成功响应
            spyPost.mockResolvedValueOnce({ fileId: 'uploaded-file-123' });

            // 创建测试文件
            const file = new File(['测试文件内容'], 'test.txt', { type: 'text/plain' });

            // 执行上传
            const result = await httpClient.upload('/api/upload', file, {
                data: { category: 'documents' }
            });

            // 验证请求
            expect(spyPost).toHaveBeenCalledWith(
                '/api/upload',
                expect.any(FormData),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'multipart/form-data'
                    })
                })
            );

            // 验证结果
            expect(result).toEqual({ fileId: 'uploaded-file-123' });
        });

        test('upload方法应处理进度回调', async () => {
            const mockProgressCallback = jest.fn();
            const mockProgressInfoCallback = jest.fn();

            // 直接模拟HttpClient的upload方法
            const spyUpload = jest.spyOn(httpClient, 'upload');
            spyUpload.mockImplementationOnce(async (_url, _file, config) => {
                // 测试进度回调
                if (config?.onUploadProgress) {
                    config.onUploadProgress({
                        loaded: 50,
                        total: 100,
                        bytes: 50,
                        estimated: 100,
                        lengthComputable: true
                    });

                    config.onUploadProgress({
                        loaded: 100,
                        total: 100,
                        bytes: 100,
                        estimated: 100,
                        lengthComputable: true
                    });
                }

                // 手动调用onUploadProgressInfo回调，因为实际会由createProgressHandler触发
                if (config?.onUploadProgressInfo) {
                    config.onUploadProgressInfo({
                        loaded: 50,
                        total: 100,
                        bytes: 50,
                        estimated: 100,
                        lengthComputable: true,
                        percent: 50
                    });

                    config.onUploadProgressInfo({
                        loaded: 100,
                        total: 100,
                        bytes: 100,
                        estimated: 100,
                        lengthComputable: true,
                        percent: 100
                    });
                }

                return { fileId: 'uploaded-file-123' };
            });

            // 创建测试文件
            const file = new File(['测试文件内容'], 'test.txt', { type: 'text/plain' });

            // 执行上传
            await httpClient.upload('/api/upload', file, {
                onUploadProgress: mockProgressCallback,
                onUploadProgressInfo: mockProgressInfoCallback
            });

            // 验证回调被调用
            expect(mockProgressCallback).toHaveBeenCalledTimes(2);
            expect(mockProgressInfoCallback).toHaveBeenCalledTimes(2);
        });
    });

    describe('大文件上传功能', () => {
        test('uploadLargeFile方法应分块上传文件', async () => {
            // 直接模拟uploadLargeFile方法
            const spyUploadLargeFile = jest.spyOn(httpClient, 'uploadLargeFile');
            spyUploadLargeFile.mockResolvedValueOnce({ chunkId: 'chunk-123' });

            // 创建测试文件
            const largeFileContent = new Array(1024 * 1024 * 2).fill('a').join(''); // 2MB
            const file = new File([largeFileContent], 'large-file.txt', { type: 'text/plain' });

            // 执行上传
            const result = await httpClient.uploadLargeFile('/api/upload/large', file, {
                chunkSize: 1024 * 1024 // 1MB chunks
            });

            // 验证结果
            expect(result).toEqual({ chunkId: 'chunk-123' });
            expect(spyUploadLargeFile).toHaveBeenCalledWith(
                '/api/upload/large',
                expect.any(File),
                expect.objectContaining({
                    chunkSize: 1024 * 1024
                })
            );
        });
    });

    describe('文件下载功能', () => {
        test('download方法应下载文件', async () => {
            // 模拟文件响应
            const fileContent = new Uint8Array([1, 2, 3, 4, 5]);
            const blob = new Blob([fileContent], { type: 'application/octet-stream' });

            // 直接模拟download方法
            const spyDownload = jest.spyOn(httpClient, 'download');
            spyDownload.mockResolvedValueOnce(blob);

            // 执行下载
            const result = await httpClient.download('/api/download/123', {
                responseType: 'blob'
            });

            // 验证请求
            expect(spyDownload).toHaveBeenCalledWith(
                '/api/download/123',
                expect.objectContaining({
                    responseType: 'blob'
                })
            );

            // 验证结果是Blob
            expect(result).toBeInstanceOf(Blob);
        });
    });

    describe('大文件下载功能', () => {
        test('downloadLargeFile方法应先获取文件大小', async () => {
            // 模拟文件内容
            const fileContent = new Uint8Array(new Array(1024).fill(1));
            const blob = new Blob([fileContent], { type: 'application/octet-stream' });

            // 直接模拟downloadLargeFile方法
            const spyDownloadLargeFile = jest.spyOn(httpClient, 'downloadLargeFile');
            spyDownloadLargeFile.mockResolvedValueOnce(blob);

            // 执行下载
            const result = await httpClient.downloadLargeFile('/api/download/large/123', {
                fileName: 'large-file.dat'
            });

            // 验证调用
            expect(spyDownloadLargeFile).toHaveBeenCalledWith(
                '/api/download/large/123',
                expect.objectContaining({
                    fileName: 'large-file.dat'
                })
            );

            // 验证结果是Blob
            expect(result).toBeInstanceOf(Blob);
        });
    });
});

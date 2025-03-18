/**
 * HTTP缓存模块测试 - 通过URL清除缓存
 */
import { memoryCache, __testOnlyClearCacheByUrl } from '../../http/cache';
// 清除所有缓存，重新开始
beforeEach(() => {
    memoryCache.clear();
});
describe('通过URL清除缓存', () => {
    beforeEach(() => {
        // 设置测试数据
        memoryCache.set('GET:/api/users:null:null', {
            data: { status: 200, data: { id: 1 } },
            expireAt: Date.now() + 3600000,
            url: '/api/users',
            method: 'GET'
        });
        memoryCache.set('GET:/api/users/1:null:null', {
            data: { status: 200, data: { id: 1 } },
            expireAt: Date.now() + 3600000,
            url: '/api/users/1',
            method: 'GET'
        });
        memoryCache.set('POST:/api/users:null:null', {
            data: { status: 200, data: { success: true } },
            expireAt: Date.now() + 3600000,
            url: '/api/users',
            method: 'POST'
        });
        memoryCache.set('GET:/api/products:null:null', {
            data: { status: 200, data: [{ id: 1 }] },
            expireAt: Date.now() + 3600000,
            url: '/api/products',
            method: 'GET'
        });
    });
    test('前缀匹配：应该清除所有以给定URL开头的缓存', () => {
        __testOnlyClearCacheByUrl('/api/users');
        expect(memoryCache.has('GET:/api/users:null:null')).toBe(false);
        expect(memoryCache.has('GET:/api/users/1:null:null')).toBe(false);
        expect(memoryCache.has('POST:/api/users:null:null')).toBe(false);
        expect(memoryCache.has('GET:/api/products:null:null')).toBe(true);
    });
    test('精确匹配：只应清除完全匹配URL的缓存', () => {
        __testOnlyClearCacheByUrl('/api/users', { exactMatch: true });
        expect(memoryCache.has('GET:/api/users:null:null')).toBe(false);
        expect(memoryCache.has('GET:/api/users/1:null:null')).toBe(true);
        expect(memoryCache.has('POST:/api/users:null:null')).toBe(false);
    });
    test('方法过滤：只应清除指定方法的缓存', () => {
        __testOnlyClearCacheByUrl('/api/users', { method: 'GET' });
        expect(memoryCache.has('GET:/api/users:null:null')).toBe(false);
        expect(memoryCache.has('GET:/api/users/1:null:null')).toBe(false);
        expect(memoryCache.has('POST:/api/users:null:null')).toBe(true);
    });
    test('包含匹配：应清除包含给定字符串的URL缓存', () => {
        __testOnlyClearCacheByUrl('users', { pattern: true });
        expect(memoryCache.has('GET:/api/users:null:null')).toBe(false);
        expect(memoryCache.has('GET:/api/users/1:null:null')).toBe(false);
        expect(memoryCache.has('GET:/api/products:null:null')).toBe(true);
    });
    test('正则表达式：应清除符合正则表达式的URL缓存', () => {
        __testOnlyClearCacheByUrl('', { pattern: /\/api\/users\/\d+/ });
        expect(memoryCache.has('GET:/api/users:null:null')).toBe(true);
        expect(memoryCache.has('GET:/api/users/1:null:null')).toBe(false);
    });
});

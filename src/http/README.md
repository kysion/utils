# HTTP 请求模块

基于 Axios 封装的 HTTP 请求模块，提供了更多实用功能，如：

- 请求/响应拦截
- 错误处理
- 请求取消
- 缓存支持
- 重试机制
- 全局配置
- 国际化支持

## 基本用法

```typescript
import { get, post, put, del, http } from '@kysion/utils';

// 使用快捷方法
const data = await get('/api/users');

// POST 请求
const result = await post('/api/users', { name: 'John' });

// 使用 HTTP 客户端实例
const response = await http.get('/api/users', null, { returnResponse: true });
```

## 全局配置

通过 `configureHttp` 函数可以设置全局配置：

```typescript
import { configureHttp } from '@kysion/utils';

configureHttp({
    // 基础 URL
    baseURL: 'https://api.example.com',
    
    // 默认超时时间（毫秒）
    timeout: 10000,
    
    // 默认请求头
    headers: {
        'X-App-Version': '1.0.0'
    },
    
    // 是否在控制台输出调试信息
    debug: true,
    
    // 默认语言
    defaultLanguage: 'zh-CN',
    
    // 默认缓存时间（毫秒）
    defaultCacheTime: 10 * 60 * 1000, // 10分钟
    
    // 错误消息映射
    errorMessages: {
        '404': '找不到请求的资源',
        '500': '服务器内部错误，请稍后重试',
        // 支持国际化
        'network': {
            'zh-CN': '网络错误，请检查您的网络连接',
            'en': 'Network error, please check your network connection'
        }
    },
    
    // 错误消息翻译函数
    translateErrorMessage: (code, message, lang) => {
        // 可以集成应用的 i18n 系统
        return i18n.t(`errors.${code}`, message);
    },
    
    // 获取当前语言
    getCurrentLanguage: () => {
        return i18n.locale;
    },
    
    // 获取认证令牌
    getAuthToken: () => {
        return store.getters['auth/token'];
    },
    
    // 认证失败回调
    onAuthFailed: () => {
        store.dispatch('auth/logout');
        router.push('/login');
    }
});
```

## 请求配置

每个请求都可以设置以下配置：

```typescript
const response = await http.get('/api/users', null, {
    // 跳过认证
    skipAuth: false,
    
    // 跳过错误处理
    skipErrorHandler: false,
    
    // 显示加载状态
    showLoading: true,
    
    // 显示错误提示
    showError: true,
    
    // 自定义错误处理
    errorHandler: (error) => {
        console.error('Custom error handler:', error);
    },
    
    // 返回完整响应，而不仅是 data 部分
    returnResponse: false,
    
    // 启用缓存
    cache: true,
    
    // 自定义缓存键
    cacheKey: 'user-list',
    
    // 缓存时间（毫秒）
    cacheTime: 5 * 60 * 1000, // 5分钟
    
    // 请求ID，用于取消请求
    requestId: 'get-users',
    
    // 重试次数
    retryCount: 3,
    
    // 重试延迟（毫秒）
    retryDelay: 1000
});
```

## 取消请求

```typescript
// 使用请求ID
http.get('/api/users', null, { requestId: 'get-users' });

// 取消指定请求
http.cancel('get-users');

// 取消所有请求
http.cancelAll();
```

## 缓存管理

```typescript
import { clearCache, clearAllCache, clearExpiredCache } from '@kysion/utils';

// 清除指定缓存
clearCache('get:/api/users:null:null');

// 清除所有缓存
clearAllCache();

// 清除过期缓存
clearExpiredCache();
```

## 自定义客户端实例

可以创建多个客户端实例，每个实例有独立的配置：

```typescript
import { HttpClient } from '@kysion/utils';

const adminHttp = new HttpClient({
    baseURL: 'https://admin-api.example.com',
    headers: {
        'X-Admin-Token': 'admin-token'
    }
});

// 使用自定义实例
const adminData = await adminHttp.get('/dashboard');
```

# HTTP 请求模块

基于 Axios 封装的 HTTP 请求模块，提供了更多实用功能，如：

- 请求/响应拦截
- 错误处理
- 请求取消
- 缓存支持
- 重试机制
- 全局配置
- 国际化支持
- 单例模式

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

## 使用单例模式

模块默认提供了单例模式支持，避免创建多个HTTP客户端实例：

```typescript
import { getHttpInstance, updateHttpConfig } from '@kysion/utils';

// 获取默认单例实例
const http = getHttpInstance();

// 获取单例并定制配置
const http = getHttpInstance({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

// 更新单例实例配置
updateHttpConfig({
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
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
import { clearCache, clearAllCache, clearExpiredCache, clearCacheByUrl } from '@kysion/utils';

// 清除指定缓存
clearCache('get:/api/users:null:null');

// 清除所有缓存
clearAllCache();

// 清除过期缓存
clearExpiredCache();

// 通过URL清除缓存
// 默认使用前缀匹配 (url.startsWith)
clearCacheByUrl('/api/users');

// 精确匹配URL
clearCacheByUrl('/api/users/123', { exactMatch: true });

// 仅清除指定HTTP方法的缓存
clearCacheByUrl('/api/users', { method: 'GET' });

// 使用包含关系匹配 (url.includes)
clearCacheByUrl('users', { pattern: true });

// 使用正则表达式匹配
clearCacheByUrl('/api/users', { pattern: /\/users\/\d+/ });

// 通过HttpClient实例清除
// 如果使用的是单例模式，可以使用以下方式
import { http, getHttpInstance } from '@kysion/utils';

// 使用默认实例
http.clearCacheByUrl('/api/users');

// 使用单例实例
const httpClient = getHttpInstance();
httpClient.clearCacheByUrl('/api/users');

// 或者使用便捷方法
import { clearCacheByPattern } from '@kysion/utils';
clearCacheByPattern('/api/users');
```

## 自定义客户端实例

可以创建多个客户端实例，每个实例有独立的配置：

```typescript
import { HttpClient } from '@kysion/utils';

// 创建新实例
const adminHttp = new HttpClient({
    baseURL: 'https://admin-api.example.com',
    headers: {
        'X-Admin-Token': 'admin-token'
    }
});

// 使用自定义实例
const adminData = await adminHttp.get('/dashboard');

// 使用单例模式（推荐）
import { getHttpInstance } from '@kysion/utils';

// 获取全局唯一实例
const http = getHttpInstance();

// 动态更新配置
import { updateHttpConfig } from '@kysion/utils';

// 例如登录后更新token
updateHttpConfig({
    headers: {
        'Authorization': `Bearer ${newToken}`
    }
});
```

## 文件上传和下载功能

HTTP模块现在支持文件上传和下载功能，包括大文件处理、断点续传和进度跟踪。

### 基本文件上传

```typescript
import { upload } from '@kysion/utils/http';

// 从文件输入框获取文件
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// 基本上传
const result = await upload('/api/upload', file);

// 带进度跟踪的上传
await upload('/api/upload', file, {
  // 简单进度回调 (Axios原生)
  onUploadProgress: (event) => {
    const percent = Math.floor((event.loaded / event.total) * 100);
    console.log(`简单进度: ${percent}%`);
  },
  
  // 增强进度回调 (带速度和剩余时间)
  onUploadProgressInfo: (info) => {
    console.log(`上传进度: ${info.percent}%, 速度: ${info.speed} bytes/s`);
    console.log(`剩余时间: ${info.remainingTime} 秒`);
  },
  
  // 自动计算上传速度和剩余时间
  calculateSpeed: true,
  
  // 附加表单数据
  data: {
    fileName: 'custom-name.jpg',
    category: 'images'
  }
});
```

### 大文件上传 (分块上传)

对于大文件，可以使用分块上传功能，支持断点续传：

```typescript
import { uploadLargeFile } from '@kysion/utils/http';

const largeFile = fileInput.files[0];

try {
  const result = await uploadLargeFile('/api/upload/chunks', largeFile, {
    // 分块大小 (默认1MB)
    chunkSize: 2 * 1024 * 1024, // 2MB
    
    // 并发上传数 (默认3)
    concurrency: 3,
    
    // 开启断点续传
    resumable: true,
    
    // 跟踪上传进度
    onUploadProgressInfo: (info) => {
      console.log(`分块上传进度: ${info.percent}%`);
      document.querySelector('.progress-bar').style.width = `${info.percent}%`;
    },
    
    // 自动计算速度
    calculateSpeed: true
  });
  
  console.log('上传成功:', result);
} catch (error) {
  // 如果上传中断，可以保存断点续传信息
  console.error('上传失败:', error);
  
  // 获取断点续传信息（示例）
  if (error.resumeInfo) {
    localStorage.setItem('upload-resume-info', JSON.stringify(error.resumeInfo));
  }
}

// 断点续传示例
const resumeUpload = async () => {
  try {
    // 获取之前保存的断点续传信息
    const savedResumeInfo = JSON.parse(localStorage.getItem('upload-resume-info'));
    
    if (savedResumeInfo) {
      // 从断点处继续上传
      await uploadLargeFile('/api/upload/chunks', largeFile, {
        resumable: true,
        resumeInfo: savedResumeInfo,
        onUploadProgressInfo: (info) => {
          console.log(`续传进度: ${info.percent}%`);
        }
      });
      
      // 上传成功后清除断点信息
      localStorage.removeItem('upload-resume-info');
    }
  } catch (error) {
    console.error('续传失败:', error);
  }
};
```

### 文件下载

```typescript
import { download, downloadLargeFile } from '@kysion/utils/http';

// 基本下载 (自动保存文件)
await download('/api/files/123', {
  fileName: 'document.pdf'
});

// 带进度跟踪的下载
const fileBlob = await download('/api/files/123', {
  fileName: 'document.pdf',
  onDownloadProgressInfo: (info) => {
    console.log(`下载进度: ${info.percent}%`);
    console.log(`速度: ${(info.speed / 1024).toFixed(2)} KB/s`);
  },
  calculateSpeed: true
});

// 处理下载的Blob
// 例如：预览图片
if (fileBlob instanceof Blob) {
  const imgUrl = URL.createObjectURL(fileBlob);
  document.querySelector('img').src = imgUrl;
}
```

### 大文件下载 (分块下载)

对于大文件，可以使用分块下载功能，支持断点续传：

```typescript
import { downloadLargeFile } from '@kysion/utils/http';

try {
  const fileBlob = await downloadLargeFile('/api/files/large-video.mp4', {
    fileName: 'video.mp4',
    // 分块大小 (默认1MB)
    chunkSize: 5 * 1024 * 1024, // 5MB
    
    // 并发下载数 (默认3)
    concurrency: 3,
    
    // 开启断点续传
    resumable: true,
    
    // 跟踪下载进度
    onDownloadProgressInfo: (info) => {
      console.log(`分块下载进度: ${info.percent}%`);
      document.querySelector('.download-progress').style.width = `${info.percent}%`;
    },
    
    // 自动计算速度
    calculateSpeed: true
  });
  
  console.log('下载完成，文件大小:', fileBlob.size);
} catch (error) {
  // 如果下载中断，可以保存断点续传信息
  console.error('下载失败:', error);
  
  // 获取断点续传信息（示例）
  if (error.resumeInfo) {
    localStorage.setItem('download-resume-info', JSON.stringify(error.resumeInfo));
  }
}

// 断点续传下载示例
const resumeDownload = async () => {
  try {
    // 获取之前保存的断点续传信息
    const savedResumeInfo = JSON.parse(localStorage.getItem('download-resume-info'));
    
    if (savedResumeInfo) {
      // 从断点处继续下载
      await downloadLargeFile('/api/files/large-video.mp4', {
        fileName: 'video.mp4',
        resumable: true,
        resumeInfo: savedResumeInfo,
        onDownloadProgressInfo: (info) => {
          console.log(`续传下载进度: ${info.percent}%`);
        }
      });
      
      // 下载成功后清除断点信息
      localStorage.removeItem('download-resume-info');
    }
  } catch (error) {
    console.error('续传下载失败:', error);
  }
};
```

### 配置全局默认参数

可以通过 `configureHttp` 配置全局默认参数：

```typescript
import { configureHttp } from '@kysion/utils/http';

configureHttp({
  // 上传基础URL
  uploadBaseURL: 'https://api.example.com/uploads',
  
  // 下载基础URL
  downloadBaseURL: 'https://cdn.example.com/files',
  
  // 默认分块大小
  defaultChunkSize: 2 * 1024 * 1024, // 2MB
  
  // 默认上传并发数
  defaultUploadConcurrency: 3,
  
  // 默认下载并发数
  defaultDownloadConcurrency: 2
});
```

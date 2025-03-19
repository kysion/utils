# @kysion/utils

Kysion Admin 工具函数包，提供HTTP请求增强、文件上传下载、多级缓存、数据加密等通用工具函数。

[![npm version](https://img.shields.io/npm/v/@kysion/utils.svg)](https://www.npmjs.com/package/@kysion/utils)
[![npm downloads](https://img.shields.io/npm/dm/@kysion/utils.svg)](https://www.npmjs.com/package/@kysion/utils)
[![license](https://img.shields.io/npm/l/@kysion/utils.svg)](LICENSE)

## 安装

```bash
npm install @kysion/utils
# 或者
yarn add @kysion/utils
# 或者
pnpm add @kysion/utils
```

## 功能特性

- 🚀 **HTTP 请求增强** - 高性能缓存系统、请求拦截和错误处理
- 📤 **文件上传下载** - 支持大文件分块上传、断点续传和进度监控
- 💾 **本地存储增强** - 支持版本控制、数据加密和过期机制
- 🔒 **加密解密工具** - 安全的数据加密和解密
- 🛠️ **常用工具函数** - 日期、对象、字符串等处理工具
- ✅ **数据验证函数** - 内置常见数据格式验证

## 主要模块

### HTTP 请求工具

基于 Axios 的 HTTP 客户端，支持请求拦截、响应处理、自动重试和多级缓存。

```typescript
import { HttpClient, configureHttp } from '@kysion/utils';

// 配置HTTP全局设置
configureHttp({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  defaultCacheTime: 10 * 60 * 1000 // 10分钟缓存
});

// 创建HTTP客户端
const http = new HttpClient();

// 发送请求并使用缓存
const data = await http.get('/users', { page: 1 }, { 
  useCache: true
});
```

### 文件上传下载

支持常规和大文件的上传下载，带进度监控和断点续传。

```typescript
import { HttpClient } from '@kysion/utils';

const http = new HttpClient();

// 基本文件上传
const result = await http.upload('/api/upload', fileObject, {
  onUploadProgress: (event) => {
    console.log(`已上传: ${event.loaded}/${event.total}`);
  }
});

// 大文件分块上传（支持断点续传）
const largeFileResult = await http.uploadLargeFile('/api/upload/large', fileObject, {
  chunkSize: 1024 * 1024, // 1MB的块大小
  concurrency: 3, // 3个并发上传任务
  onUploadProgressInfo: (info) => {
    console.log(`进度: ${info.percent}%, 速度: ${info.speed} bytes/s`);
  }
});

// 文件下载
const file = await http.download('/api/download/123', {
  fileName: 'document.pdf',
  onDownloadProgress: (event) => {
    console.log(`已下载: ${event.loaded}/${event.total}`);
  }
});
```

### 存储工具

增强的本地存储工具，支持版本控制、数据加密和自动过期：

```typescript
import { LocalStorageWrapper } from '@kysion/utils';

// 创建一个带版本控制和加密的存储实例
const userStorage = new LocalStorageWrapper({
  storageKey: 'user_data',
  keyPrefix: 'app',
  version: '1.0.0',
  crypto: true
});

// 存储数据，7天后过期
userStorage.put('profile', { id: 1, name: '张三' }, {
  expirationMillis: 7 * 24 * 60 * 60 * 1000
});

// 读取数据
const userData = userStorage.get('profile');
```

### 加密工具

便捷的数据加密解密功能：

```typescript
import { createCrypto } from '@kysion/utils';

// 创建默认的加密实例
const crypto = createCrypto();

// 加密数据
const encrypted = crypto.encrypt('敏感数据');

// 解密数据
const decrypted = crypto.decrypt(encrypted);
```

### 数据验证

常用数据格式验证工具：

```typescript
import { Validate } from '@kysion/utils';

// 验证手机号
if (Validate.isMobile('13812345678')) {
  // 有效的手机号
}

// 验证邮箱
if (Validate.isEmail('test@example.com')) {
  // 有效的邮箱
}

// 验证身份证
if (Validate.isIdCard('110101199001011234')) {
  // 有效的身份证号
}
```

## 完整文档

更详细的使用说明请参考 [使用指南](./GUIDE.md)

## 贡献指南

欢迎贡献代码或提出问题！请先阅读我们的[贡献指南](./CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
Copyright (c) 2025 Kysion

# @kysion/utils

Kysion Admin 工具函数包，提供数据处理、加密解密、日期处理、HTTP缓存优化等通用工具函数。

## 安装

```bash
npm install @kysion/utils
# 或者
yarn add @kysion/utils
# 或者
pnpm add @kysion/utils
```

## 功能特性

- 🔒 **加密解密工具** - 安全的数据加密和解密
- 💾 **本地存储增强** - 支持版本控制、数据加密和过期机制
- 🔄 **HTTP 请求增强** - 高性能缓存系统、请求拦截和错误处理
- 🆔 **唯一ID生成** - 轻量级唯一标识符生成
- ✅ **数据验证工具** - 全面的数据验证函数集
- 🛠️ **常用工具函数** - 日期、对象、字符串等处理工具

## 主要模块

### HTTP 请求工具

基于 Axios 的 HTTP 客户端，支持请求拦截、响应处理、自动重试和多级缓存。

```typescript
import { HttpClient, initWithEnhancedStorage } from '@kysion/utils';
import { LocalStorageWrapper } from '@kysion/utils/storage';

// 初始化增强的HTTP缓存
const cacheStorage = new LocalStorageWrapper({
  storageKey: 'http_cache',
  keyPrefix: 'api',
  version: '1.0.0',
  crypto: true
});
initWithEnhancedStorage(cacheStorage);

// 创建HTTP客户端
const http = new HttpClient({
  baseURL: '/api',
  timeout: 5000
});

// 发送请求并使用缓存
const data = await http.get('/users', { page: 1 }, { 
  useCache: true,
  cacheTime: 3600000 // 1小时
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
userStorage.put({
  data: { id: 1, name: '张三' },
  expirationMillis: 7 * 24 * 60 * 60 * 1000
});

// 读取数据
const userData = userStorage.get();
```

### 工具函数

各种常用工具函数：

```typescript
import { Funs, createCrypto, nanoid } from '@kysion/utils';

// 环境检测
const isDev = Funs.isDevelopment();

// 数据加密
const crypto = createCrypto();
const encrypted = crypto.encrypt('敏感数据');
const decrypted = crypto.decrypt(encrypted);

// 生成唯一ID
const id = nanoid();
```

## 完整文档

更详细的使用说明请参考 [User's Guide.md](./GUIDE.md)

## 贡献指南

欢迎贡献代码或提出问题！请先阅读我们的[贡献指南](./CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
Copyright (c) 2025 Kysion

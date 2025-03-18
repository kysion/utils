# @kysion/utils 使用指南

本指南详细介绍了@kysion/utils包中各个模块的使用方法和最佳实践。

## 目录

- [HTTP请求模块](#http请求模块)
- [存储模块](#存储模块)
- [模型存储](#模型存储)
- [工具函数](#工具函数)
- [加密模块](#加密模块)
- [数据验证](#数据验证)
- [ID生成器](#id生成器)

<a id="http请求模块"></a>
## HTTP请求模块

HTTP请求模块基于Axios封装，提供了请求拦截、响应处理、错误处理、请求取消、自动重试和多级缓存等强大功能。

### 基本用法

```typescript
import { HttpClient } from '@kysion/utils';

// 创建实例
const http = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// GET请求
const users = await http.get('/users', { page: 1 });

// POST请求
const newUser = await http.post('/users', { 
  name: '张三', 
  email: 'zhangsan@example.com' 
});

// PUT请求
await http.put('/users/1', { name: '李四' });

// DELETE请求
await http.delete('/users/1');
```

### 请求配置

```typescript
// 完整的请求配置
const response = await http.request({
  method: 'GET',
  url: '/users',
  params: { page: 1 },
  headers: { 'X-Custom-Header': 'value' },
  timeout: 5000,
  responseType: 'json',
  // 自定义配置
  showLoading: true,       // 显示加载提示
  skipAuth: false,         // 跳过身份验证
  skipErrorHandler: false, // 跳过错误处理
  returnResponse: false,   // 返回完整响应而非data
  requestId: 'users-list', // 请求ID，用于取消请求
  retryCount: 3,           // 自动重试次数
  retryDelay: 1000,        // 重试延迟(ms)
});
```

### 高级缓存系统

#### 标准缓存用法

```typescript
// 启用缓存的GET请求
const data = await http.get('/users', { page: 1 }, {
  useCache: true,       // 启用缓存
  cacheTime: 60000,     // 缓存60秒
  cacheKey: 'users-p1'  // 自定义缓存键（可选）
});

// 清除特定缓存
import { clearCache } from '@kysion/utils/http/cache';
clearCache('users-p1');

// 清除所有缓存
import { clearAllCache } from '@kysion/utils/http/cache';
clearAllCache();

// 清除过期缓存
import { clearExpiredCache } from '@kysion/utils/http/cache';
clearExpiredCache();
```

#### 增强缓存系统

使用`LocalStorageWrapper`实现的增强缓存系统支持加密和版本控制：

```typescript
import { initWithEnhancedStorage } from '@kysion/utils/http/cache';
import { LocalStorageWrapper } from '@kysion/utils';

// 在应用初始化时配置
function setupHttpCache() {
  const httpCache = new LocalStorageWrapper({
    storageKey: 'http_cache',
    keyPrefix: 'api',
    version: '1.0.0',  // 版本号，变更后所有缓存失效
    crypto: true       // 启用加密
  });
  
  initWithEnhancedStorage(httpCache);
  console.log('HTTP缓存系统已配置');
}
```

### 请求拦截与取消

```typescript
// 添加请求拦截器
const interceptorId = http.addRequestInterceptor(config => {
  config.headers = config.headers || {};
  config.headers['X-Timestamp'] = Date.now();
  return config;
});

// 移除拦截器
http.removeRequestInterceptor(interceptorId);

// 取消请求
import { HttpClient } from '@kysion/utils';
const http = new HttpClient();

// 发起请求时指定requestId
const promise = http.get('/users', null, { requestId: 'users-list' });

// 在另一处取消该请求
http.cancel('users-list', '用户取消请求');

// 取消所有请求
http.cancelAll('页面已离开');
```

<a id="存储模块"></a>
## 存储模块

存储模块提供了增强的本地存储功能，支持数据加密、版本控制和自动过期机制。

### LocalStorageWrapper

`LocalStorageWrapper`是一个对本地存储进行增强的类，提供了以下特性：

- 数据版本控制
- 数据加密存储
- 数据自动过期
- 键名前缀管理

#### 基本用法

```typescript
import { LocalStorageWrapper } from '@kysion/utils';

// 创建存储实例
const userStorage = new LocalStorageWrapper({
  storageKey: 'currentUser',  // 存储键名
  keyPrefix: 'app',           // 键前缀
  version: '1.0.0',           // 数据版本
  crypto: true                // 启用加密
});

// 存储数据
userStorage.put({
  data: { id: 1, name: '张三', role: 'admin' }
});

// 读取数据
const user = userStorage.get();
console.log(user); // { id: 1, name: '张三', role: 'admin' }

// 更新数据
userStorage.put({
  data: { id: 1, name: '张三', role: 'user' }
});

// 删除数据
userStorage.remove();

// 使用不同的键
const tokenStorage = new LocalStorageWrapper({
  keyPrefix: 'auth',
  version: '1.0.0'
});

// 存储令牌，30天后过期
tokenStorage.put({
  key: 'accessToken',  // 自定义键
  data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expirationMillis: 30 * 24 * 60 * 60 * 1000
});

// 读取令牌
const token = tokenStorage.get('accessToken');
```

#### 使用具体过期时间

```typescript
import { LocalStorageWrapper } from '@kysion/utils';
import dayjs from 'dayjs';

const sessionStorage = new LocalStorageWrapper({
  storageKey: 'session',
  version: '1.0.0'
});

// 设置到明天午夜过期
sessionStorage.put({
  data: { authenticated: true },
  expireAt: dayjs().add(1, 'day').startOf('day')
});
```

<a id="模型存储"></a>
## 模型存储

模型存储(ModelWithStorage)是一个用于将`BaseModel`与`LocalStorageWrapper`结合使用的工具类，为模型提供持久化存储能力。

### 基本用法

```typescript
import { BaseModel, ILocalStorage } from '@kysion/types';
import { ModelWithStorage } from '@kysion/utils';

// 定义一个使用模型存储的类
class UserPreferences extends ModelWithStorage<UserPreferences> implements ILocalStorage<UserPreferences> {
  theme: string = 'light';
  fontSize: number = 14;
  
  constructor() {
    // 指定存储键名和选项
    super('user_preferences', {
      keyPrefix: 'app',
      version: '1.0.0',
      crypto: true // 启用加密
    });
  }
}

// 使用模型
const prefs = new UserPreferences();

// 修改并保存
prefs.theme = 'dark';
prefs.save();

// 从存储加载
prefs.reload();

// 清除存储
prefs.clear();
```

### 带过期时间的存储

```typescript
// 保存并设置过期时间（1小时）
prefs.saveWithExpiration(60 * 60 * 1000);
```

### 高级用法

结合`BaseModel`的`copyWith`方法实现部分更新：

```typescript
class AppSettings extends ModelWithStorage<AppSettings> implements ILocalStorage<AppSettings> {
  theme: string = 'light';
  language: string = 'en';
  notifications: boolean = true;
  
  constructor() {
    super('app_settings');
  }
  
  // 自定义更新方法
  update(settings: Partial<AppSettings>): AppSettings {
    // 使用BaseModel的copyWith方法进行部分更新
    const updated = this.copyWith(settings);
    Object.assign(this, updated);
    return this.save();
  }
}

// 使用自定义更新方法
const settings = new AppSettings();
settings.update({ theme: 'dark', notifications: false });
```

### 与API缓存结合

可以用于缓存API响应数据：

```typescript
class ProductCache extends ModelWithStorage<ProductCache> implements ILocalStorage<ProductCache> {
  products: Product[] = [];
  lastUpdated: number = 0;
  
  constructor() {
    super('product_cache');
  }
  
  // 更新缓存
  updateCache(products: Product[]): void {
    this.products = products;
    this.lastUpdated = Date.now();
    // 缓存12小时
    this.saveWithExpiration(12 * 60 * 60 * 1000);
  }
  
  // 检查是否需要刷新
  needsRefresh(maxAgeMinutes: number = 60): boolean {
    return Date.now() - this.lastUpdated > maxAgeMinutes * 60 * 1000;
  }
}
```

<a id="工具函数"></a>
## 工具函数

Funs模块提供了一系列常用工具函数，涵盖环境检测、字符串处理、对象操作等领域。

### 环境检测

```typescript
import { Funs } from '@kysion/utils';

// 检查是否是开发环境
if (Funs.isDevelopment()) {
  console.log('当前是开发环境');
}

// 获取环境变量
const apiUrl = Funs.getEnv('API_URL', 'https://default-api.example.com');
```

### 浏览器检测

```typescript
import { Funs } from '@kysion/utils';

// 检查是否是移动设备
if (Funs.isMobile()) {
  // 加载移动端样式
}

// 检查浏览器类型
if (Funs.isIE()) {
  alert('请使用现代浏览器访问本站');
}

if (Funs.isChrome()) {
  // 使用Chrome特有功能
}
```

### 字符串处理

```typescript
import { Funs } from '@kysion/utils';

// 获取字符串字节长度
const length = Funs.getByteLength('你好，世界');
console.log(length); // 10

// 截取字符串
const text = Funs.substringByByte('你好，世界', 0, 5);
console.log(text); // '你好'

// 格式化金额
const amount = Funs.formatAmount(1234567.89);
console.log(amount); // '1,234,567.89'
```

### 对象操作

```typescript
import { Funs } from '@kysion/utils';

// 深度合并对象
const merged = Funs.deepMerge(
  { name: '张三', settings: { theme: 'light' } },
  { age: 30, settings: { notifications: true } }
);
console.log(merged);
// { name: '张三', age: 30, settings: { theme: 'light', notifications: true } }
```

<a id="加密模块"></a>
## 加密模块

加密模块提供了数据加密和解密功能。

```typescript
import { createCrypto } from '@kysion/utils';

// 创建默认的加密实例
const crypto = createCrypto();

// 加密数据
const encrypted = crypto.encrypt('敏感数据');
console.log(encrypted); // 'U2FsdGVkX1+...'

// 解密数据
const decrypted = crypto.decrypt(encrypted);
console.log(decrypted); // '敏感数据'

// 使用自定义密钥
const customCrypto = createCrypto('my-secret-key');
const customEncrypted = customCrypto.encrypt('敏感数据');
```

<a id="数据验证"></a>
## 数据验证

数据验证模块提供了常用的验证功能。

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

// 验证URL
if (Validate.isUrl('https://www.example.com')) {
  // 有效的URL
}

// 验证IP地址
if (Validate.isIp('192.168.1.1')) {
  // 有效的IP地址
}
```

<a id="id生成器"></a>
## ID生成器

提供轻量级的唯一ID生成功能。

```typescript
import { nanoid } from '@kysion/utils';

// 生成默认长度的ID
const id = nanoid();
console.log(id); // 例如 'V1StGXR8_Z5jdHi6B-myT'

// 生成指定长度的ID
const shortId = nanoid(8);
console.log(shortId); // 例如 'Wd9eT5a-'
```

## 最佳实践

### HTTP请求缓存策略

1. **适合缓存的接口**
   - 字典数据、配置项等不常变动的数据
   - 列表数据（但要注意设置合理的过期时间）

2. **不适合缓存的接口**
   - 频繁变动的数据
   - 涉及用户交互的操作（如提交、删除等）

3. **缓存时间设置建议**
   - 配置数据：1小时以上
   - 列表数据：5-15分钟
   - 实时数据：不缓存或缓存时间非常短

### 存储安全建议

1. **敏感数据加密**
   - 对用户信息、令牌等敏感数据启用加密存储
   - 加密密钥不要硬编码在代码中

2. **版本控制策略**
   - 主要功能更新时增加版本号，使所有缓存失效
   - 版本号可以跟随应用版本或独立管理

3. **数据过期设置**
   - 认证信息设置合理的过期时间
   - 用户数据在退出登录时主动清除 
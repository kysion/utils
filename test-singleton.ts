// HttpClient单例测试脚本
import { HttpClient, getHttpInstance, updateHttpConfig } from './src/http';

console.log('---- 测试HttpClient单例模式 ----');

// 创建一个普通实例
const regularClient = new HttpClient({ baseURL: 'https://regular.example.com' });
console.log('普通实例 baseURL:', regularClient['axiosInstance'].defaults.baseURL);

// 获取单例实例
const singletonClient1 = getHttpInstance({ baseURL: 'https://singleton.example.com' });
console.log('单例实例1 baseURL:', singletonClient1['axiosInstance'].defaults.baseURL);

// 再次获取单例，应该返回相同实例
const singletonClient2 = getHttpInstance();
console.log('单例实例2 baseURL:', singletonClient2['axiosInstance'].defaults.baseURL);

// 检查是否为同一实例
console.log('单例1和单例2是同一实例?', singletonClient1 === singletonClient2);
console.log('普通实例和单例1是同一实例?', regularClient === singletonClient1);

// 测试更新配置
console.log('\n---- 测试更新配置 ----');
console.log('更新前 baseURL:', singletonClient1['axiosInstance'].defaults.baseURL);

updateHttpConfig({
    baseURL: 'https://updated.example.com',
    headers: {
        'Authorization': 'Bearer test-token'
    } as any
});

console.log('更新后 baseURL:', singletonClient1['axiosInstance'].defaults.baseURL);
console.log('更新后 Authorization:', singletonClient1['axiosInstance'].defaults.headers['Authorization']);

// 验证两个单例引用的是同一个实例
console.log('单例2的更新后 baseURL:', singletonClient2['axiosInstance'].defaults.baseURL);

console.log('\n测试完成!'); 
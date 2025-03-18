import dayjs from 'dayjs';
import { createCrypto } from '.';
import { isDev } from './funs';
/**
 * 存储版本
 */
const APP_STORE_VERSION = '1.0.0';
/**
 * 存储前缀
 */
const APP_STORE_PREFIX = 'app';
/**
 * 本地存储封装类
 * @template T 存储数据的类型
 */
export class LocalStorageWrapper {
    /**
     * 构造函数，初始化类的属性
     * @param params 包含键前缀、可选的加密对象、默认键和版本的参数对象
     */
    constructor(params) {
        this.crypto = params.crypto === true ? createCrypto() : params.crypto ?? createCrypto();
        this.storageKey = params.storageKey ?? ''; // 设置默认键
        this.keyPrefix = (params.keyPrefix ?? (APP_STORE_PREFIX ?? 'Kysion')) + '-'; // 设置键前缀
        this.version = params.version ?? APP_STORE_VERSION ?? 'v1.0.0'; // 设置版本
    }
    /**
     * 异步将数据存储到本地存储
     * @param params 包含键（可选）、值和过期时间（毫秒）的参数对象
     * @returns 存储操作成功时返回 true
     */
    put(params) {
        // 生成完整的键
        const newKey = this.keyPrefix + (params.key || this.storageKey);
        // 构建带有数据、过期时间和版本的对象
        const data = {
            data: params.data,
            expiration: params.expireAt ? params.expireAt.unix() : (params.expirationMillis ? dayjs(Date.now()).unix() + params.expirationMillis : undefined),
            version: this.version
        };
        // 将对象转换为 JSON 字符串
        const jsonStr = JSON.stringify(data);
        // 如果不是开发环境且存在加密对象
        if (!isDev() && this.crypto) {
            // 对 JSON 字符串进行加密，并在加密完成后将加密后的数据存储到本地存储
            const data = this.crypto.encrypt(jsonStr);
            localStorage.setItem(newKey, data);
        }
        else {
            // 否则直接将 JSON 字符串存储到本地存储
            localStorage.setItem(newKey, jsonStr);
        }
        // 返回存储操作成功的标识
        return true;
    }
    /**
     * 异步获取指定键对应的数据
     * @param key 要获取数据的键
     * @param jsonReplacer 用于解析 JSON 字符串的替换函数（可选）
     * @returns 成功获取且未过期、版本匹配的数据，否则返回 null
     */
    get(key, jsonReplacer) {
        // 生成完整的键
        const newKey = this.keyPrefix + (key || this.storageKey);
        // 从本地存储获取对应键的值
        const ciphertext = localStorage.getItem(newKey);
        // 如果获取到值
        if (ciphertext) {
            try {
                // 初始化数据对象为未定义
                let data;
                // 如果不是开发环境且存在加密对象
                if (!isDev() && this.crypto) {
                    // 对获取的值进行解密，并将结果转换为字符串
                    const jsonStr = this.crypto.decrypt(ciphertext);
                    // 如果解密成功
                    if (jsonStr) {
                        // 使用提供的替换函数或默认方式解析 JSON 字符串
                        data = JSON.parse(jsonStr, jsonReplacer);
                    }
                }
                else {
                    // 直接使用提供的替换函数或默认方式解析 JSON 字符串
                    data = JSON.parse(ciphertext, jsonReplacer);
                }
                // 如果数据不存在或者已过期
                if (!data || data.expiration && data.expiration < dayjs(Date.now()).unix()) {
                    // 移除该键对应的数据
                    this.remove(newKey);
                    return undefined;
                }
                // 如果数据版本与当前版本不匹配
                if (data.version !== this.version) {
                    // 移除该键对应的数据
                    this.remove(newKey);
                    return undefined;
                }
                // 返回数据中的实际数据部分
                return data.data;
            }
            catch (error) {
                // 打印解析错误信息
                return undefined;
            }
        }
        // 如果未获取到值，返回 null
        return undefined;
    }
    /**
     * 从本地存储中移除指定键的数据
     * @param key 要移除的键
     */
    remove(key) {
        // 生成完整的键
        const newKey = this.keyPrefix + (key || this.storageKey);
        localStorage.removeItem(newKey);
    }
    reset() {
        this.remove();
    }
    /**
     * 清空本地存储
     */
    clear() {
        localStorage.clear();
    }
}

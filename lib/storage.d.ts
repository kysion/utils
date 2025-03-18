import { Dayjs } from 'dayjs';
import { Crypto } from '.';
export type LocalStorageOptions = {
    /**
     * 存储数据键名前缀，用于区分不同模块的数据
     */
    keyPrefix?: string;
    /**
     * 存储数据的键名
     */
    storageKey: string;
    /**
     * 存储数据的版本号
     */
    version?: string | number;
    /**
     * 可选的加密对象，用于对数据进行加密和解密
     */
    crypto?: Crypto | true;
};
/**
 * 本地存储封装类
 * @template T 存储数据的类型
 */
export declare class LocalStorageWrapper<T> {
    private crypto?;
    private storageKey;
    private keyPrefix;
    private version;
    /**
     * 构造函数，初始化类的属性
     * @param params 包含键前缀、可选的加密对象、默认键和版本的参数对象
     */
    constructor(params: LocalStorageOptions);
    /**
     * 异步将数据存储到本地存储
     * @param params 包含键（可选）、值和过期时间（毫秒）的参数对象
     * @returns 存储操作成功时返回 true
     */
    put(params: {
        key?: string;
        data: T;
        expirationMillis?: number;
        expireAt?: Dayjs;
    }): boolean;
    /**
     * 异步获取指定键对应的数据
     * @param key 要获取数据的键
     * @param jsonReplacer 用于解析 JSON 字符串的替换函数（可选）
     * @returns 成功获取且未过期、版本匹配的数据，否则返回 null
     */
    get(key?: string, jsonReplacer?: (this: any, key: string, value: any) => any): T | undefined;
    /**
     * 从本地存储中移除指定键的数据
     * @param key 要移除的键
     */
    remove(key?: string): void;
    reset(): void;
    /**
     * 清空本地存储
     */
    clear(): void;
}

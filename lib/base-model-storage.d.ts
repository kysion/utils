/**
 * 基础模型存储工具
 * 为BaseModel提供本地存储功能
 */
import { BaseModel, IBaseModel } from '@kysion/types';
export interface ILocalStorage<T extends IBaseModel<T>> extends IBaseModel<T> {
    clear(): void;
    save(): T;
    reload(): T;
    init(): void;
}
/**
 * 带有本地存储功能的基础模型类
 * 使用LocalStorageWrapper实现存储，支持加密、版本控制和过期机制
 * @template T 模型类型
 */
export declare class ModelWithStorage<T extends ILocalStorage<T>> extends BaseModel<T> implements ILocalStorage<T> {
    private readonly storage;
    /**
     * 构造函数
     * @param storeKey 存储键名
     * @param options 存储选项，如 keyPrefix, version, crypto 等
     */
    constructor(storeKey: string, options?: {
        keyPrefix?: string;
        version?: string | number;
        crypto?: boolean;
    });
    /**
     * 清除存储的数据
     */
    clear(): void;
    /**
     * 保存模型到本地存储
     * @returns 当前模型实例
     */
    save(): T;
    /**
     * 从本地存储加载数据
     * @returns 当前模型实例
     */
    reload(): T;
    /**
     * 初始化模型实例，从本地存储加载数据
     */
    init(): void;
    /**
     * 保存带有过期时间的模型数据
     * @param expirationMillis 过期时间（毫秒）
     * @returns 当前模型实例
     */
    saveWithExpiration(expirationMillis: number): T;
}

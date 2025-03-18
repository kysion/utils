/**
 * 基础模型存储工具
 * 为BaseModel提供本地存储功能
 */

import { BaseModel, IBaseModel } from '@kysion/types';
import { LocalStorageWrapper } from './storage';

// 本地存储接口，继承自基础模型接口
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
export class ModelWithStorage<T extends ILocalStorage<T>> extends BaseModel<T> implements ILocalStorage<T> {
    private readonly storage: LocalStorageWrapper<T>;

    /**
     * 构造函数
     * @param storeKey 存储键名
     * @param options 存储选项，如 keyPrefix, version, crypto 等
     */
    constructor(storeKey: string, options?: {
        keyPrefix?: string;
        version?: string | number;
        crypto?: boolean;
    }) {
        super();

        // 创建存储实例
        this.storage = new LocalStorageWrapper<T>({
            storageKey: storeKey,
            keyPrefix: options?.keyPrefix,
            version: options?.version,
            crypto: options?.crypto === true ? true : undefined
        });

        this.init();
    }

    /**
     * 清除存储的数据
     */
    clear(): void {
        this.storage.remove();
    }

    /**
     * 保存模型到本地存储
     * @returns 当前模型实例
     */
    save(): T {
        try {
            // 使用put方法存储数据
            this.storage.put({
                data: this as unknown as T
            });
            return this as unknown as T;
        } catch (error) {
            console.error(`Error saving to storage: ${(error as Error).message}`);
            return this as unknown as T;
        }
    }

    /**
     * 从本地存储加载数据
     * @returns 当前模型实例
     */
    reload(): T {
        try {
            const savedData = this.storage.get();
            if (savedData) {
                Object.assign(this, savedData);
            }
            return this as unknown as T;
        } catch (error) {
            console.error(`Error reloading from storage: ${(error as Error).message}`);
            return this as unknown as T;
        }
    }

    /**
     * 初始化模型实例，从本地存储加载数据
     */
    init(): void {
        this.reload();
    }

    /**
     * 保存带有过期时间的模型数据
     * @param expirationMillis 过期时间（毫秒）
     * @returns 当前模型实例
     */
    saveWithExpiration(expirationMillis: number): T {
        try {
            this.storage.put({
                data: this as unknown as T,
                expirationMillis
            });
            return this as unknown as T;
        } catch (error) {
            console.error(`Error saving to storage with expiration: ${(error as Error).message}`);
            return this as unknown as T;
        }
    }
} 
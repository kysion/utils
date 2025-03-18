/**
 * 基础模型存储工具
 * 为BaseModel提供本地存储功能
 */
import { BaseModel } from '@kysion/types';
import { LocalStorageWrapper } from './storage';
/**
 * 带有本地存储功能的基础模型类
 * 使用LocalStorageWrapper实现存储，支持加密、版本控制和过期机制
 * @template T 模型类型
 */
export class WithStorage extends BaseModel {
    /**
     * 构造函数
     * @param storeKey 存储键名
     * @param options 存储选项，如 keyPrefix, version, crypto 等
     */
    constructor(storeKey, options) {
        super();
        // 创建存储实例
        this.storage = new LocalStorageWrapper({
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
    clear() {
        this.storage.remove();
    }
    /**
     * 保存模型到本地存储
     * @returns 当前模型实例
     */
    save() {
        try {
            // 使用put方法存储数据
            this.storage.put({
                data: this
            });
            return this;
        }
        catch (error) {
            console.error(`Error saving to storage: ${error.message}`);
            return this;
        }
    }
    /**
     * 从本地存储加载数据
     * @returns 当前模型实例
     */
    reload() {
        try {
            const savedData = this.storage.get();
            if (savedData) {
                Object.assign(this, savedData);
            }
            return this;
        }
        catch (error) {
            console.error(`Error reloading from storage: ${error.message}`);
            return this;
        }
    }
    /**
     * 初始化模型实例，从本地存储加载数据
     */
    init() {
        this.reload();
    }
    /**
     * 保存带有过期时间的模型数据
     * @param expirationMillis 过期时间（毫秒）
     * @returns 当前模型实例
     */
    saveWithExpiration(expirationMillis) {
        try {
            this.storage.put({
                data: this,
                expirationMillis
            });
            return this;
        }
        catch (error) {
            console.error(`Error saving to storage with expiration: ${error.message}`);
            return this;
        }
    }
}

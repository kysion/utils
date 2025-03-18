/**
 * ModelWithStorage使用示例
 * 展示如何使用增强的模型存储类
 */
import { ModelWithStorage, ILocalStorage } from '../base-model-storage';
declare class UserSettings extends ModelWithStorage<UserSettings> implements ILocalStorage<UserSettings> {
    theme: string;
    fontSize: number;
    enableNotifications: boolean;
    language: string;
    lastUpdated: number;
    constructor();
    toggleTheme(): UserSettings;
    updateSettings(settings: Partial<UserSettings>): UserSettings;
}
declare class ProductCache extends ModelWithStorage<ProductCache> implements ILocalStorage<ProductCache> {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
    cachedAt: number;
    constructor();
    update(product: Partial<ProductCache>): ProductCache;
}
/**
 * 使用示例
 */
declare function demoUserSettings(): void;
/**
 * 产品缓存示例
 */
declare function demoProductCache(): void;
export { demoUserSettings, demoProductCache, UserSettings, ProductCache };

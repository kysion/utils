/**
 * ModelWithStorage使用示例
 * 展示如何使用增强的模型存储类
 */
import { ModelWithStorage } from '../base-model-storage';
// 定义一个用户设置模型类型
class UserSettings extends ModelWithStorage {
    // 主题设置
    theme = 'light';
    // 字体大小
    fontSize = 14;
    // 是否开启通知
    enableNotifications = true;
    // 语言设置
    language = 'zh-CN';
    // 最后更新时间
    lastUpdated = Date.now();
    constructor() {
        // 设置存储键名和选项
        super('user_settings', {
            keyPrefix: 'app',
            version: '1.0.0',
            crypto: true // 启用加密存储
        });
    }
    // 自定义方法：切换主题
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.lastUpdated = Date.now();
        return this.save(); // 保存并返回更新后的实例
    }
    // 自定义方法：更新设置
    updateSettings(settings) {
        // 使用BaseModel提供的copyWith方法创建部分更新
        const updated = this.copyWith(settings);
        Object.assign(this, updated);
        this.lastUpdated = Date.now();
        return this.save();
    }
}
// 产品模型示例，支持带过期时间的存储
class ProductCache extends ModelWithStorage {
    id = 0;
    name = '';
    price = 0;
    inStock = false;
    cachedAt = Date.now();
    constructor() {
        super('product_cache', {
            keyPrefix: 'shop',
            version: '1.0.0'
        });
    }
    // 更新缓存，并设置1小时过期
    update(product) {
        Object.assign(this, product);
        this.cachedAt = Date.now();
        // 使用增强功能：设置过期时间
        return this.saveWithExpiration(60 * 60 * 1000); // 1小时过期
    }
}
/**
 * 使用示例
 */
function demoUserSettings() {
    // 创建用户设置实例
    const settings = new UserSettings();
    console.log('初始设置:', settings);
    // 更新设置
    settings.updateSettings({
        fontSize: 16,
        language: 'en-US'
    });
    console.log('更新后设置:', settings);
    // 切换主题
    settings.toggleTheme();
    console.log('主题切换后:', settings);
    // 清除存储的设置
    settings.clear();
    console.log('清除后 (内存中仍保留):', settings);
    // 重新加载 (此时已无存储数据)
    settings.reload();
    console.log('重新加载后 (应为默认值):', settings);
}
/**
 * 产品缓存示例
 */
function demoProductCache() {
    const productCache = new ProductCache();
    // 更新产品信息，并设置1小时过期
    productCache.update({
        id: 100,
        name: '高级笔记本电脑',
        price: 6999,
        inStock: true
    });
    console.log('缓存的产品信息:', productCache);
    // 从存储重新加载
    const reloadedCache = new ProductCache();
    console.log('重新加载的产品信息:', reloadedCache);
}
// 导出示例函数
export { demoUserSettings, demoProductCache, UserSettings, ProductCache };

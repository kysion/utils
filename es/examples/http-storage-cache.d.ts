/**
 * 示例：使用LocalStorageWrapper增强HTTP缓存
 *
 * 这个示例展示如何使用LocalStorageWrapper来增强HTTP请求的缓存功能，
 * 从而添加加密、版本控制和更强大的过期机制。
 */
/**
 * 初始化HTTP缓存
 */
declare function initHttpCache(): void;
/**
 * 使用带缓存的HTTP客户端
 */
declare function useHttpClientWithCache(): Promise<void>;
export { initHttpCache, useHttpClientWithCache };

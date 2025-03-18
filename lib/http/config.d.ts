/**
 * HTTP全局配置管理模块
 */
import type { HttpGlobalConfig } from './types';
declare const DEFAULT_ERROR_MESSAGES: Record<string, string>;
declare const defaultConfig: HttpGlobalConfig;
/**
 * 配置HTTP客户端
 * @param config 配置对象
 */
export declare function configureHttp(config: Partial<HttpGlobalConfig>): void;
/**
 * 重置为默认配置
 */
export declare function resetHttpConfig(): void;
/**
 * 获取全局配置
 */
export declare function getHttpConfig(): HttpGlobalConfig;
/**
 * 获取错误消息
 * @param code 错误码
 * @param defaultMessage 默认消息
 */
export declare function getErrorMessage(code: string | number, defaultMessage: string): string;
/**
 * 获取当前语言
 */
export declare function getCurrentLanguage(): string;
/**
 * 获取认证令牌
 */
export declare function getAuthToken(): string | null;
/**
 * 处理认证失败
 */
export declare function handleAuthFailed(): void;
export { defaultConfig, DEFAULT_ERROR_MESSAGES };

/**
 * 通用工具函数
 */
import { nanoid } from 'nanoid';
/**
 * 检查是否为空值
 * @param value 待检查的值
 * @returns 如果值为 null、undefined 或空字符串，则返回 true
 */
export declare const isEmpty: (value: unknown) => boolean;
/**
 * 判断环境是否为开发环境
 * @returns true表示当前为开发环境
 */
export declare const isDev: () => boolean;
export { nanoid };
export declare class Funs {
    static toBase64(file: any): Promise<string>;
    /**
     * 获取当前环境
     * @param key 可选参数，指定要读取的环境变量键名（无需前缀）
     * @param def 默认值，当环境变量不存在时返回
     * @returns 环境变量值，如果未指定key则返回NODE_ENV
     */
    static getEnv<T>(key?: string, def?: T, callback?: (v: any) => T): T;
    /**
     * 判断是否为开发环境
     * @param env_key 可选的环境变量键名
     * @returns true表示当前为开发环境
     */
    static isDevelopment(env_key?: string): boolean;
    /**
     * 校验 JSON 字符串格式是否合法
     * @param {string} jsonString 要校验的字符串
     * @param {boolean} [needParse=false] 是否需要返回解析后的对象
     * @returns {{
     *   isValid: boolean,
     *   error?: string,
     *   data?: any
     * }} 校验结果对象
     */
    static validateJSON(jsonString: string, needParse?: boolean): {
        isValid: boolean;
        error?: string;
        data?: any;
    };
}

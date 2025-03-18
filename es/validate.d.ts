/**
 * 常用验证工具函数
 */
/**
 * 验证中国大陆手机号格式
 * @param mobile 手机号
 * @returns 是否符合格式
 */
export declare const isValidChineseMobile: (mobile: string) => boolean;
/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否符合格式
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * 验证用户名格式(字母开头，允许字母、数字、下划线，长度5-20)
 * @param username 用户名
 * @returns 是否符合格式
 */
export declare const isValidUsername: (username: string) => boolean;
/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度级别: 0-弱, 1-中, 2-强
 */
export declare const getPasswordStrength: (password: string) => number;
export declare function validateDate(str: string): boolean;

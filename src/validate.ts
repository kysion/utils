/**
 * 常用验证工具函数
 */

/**
 * 验证中国大陆手机号格式
 * @param mobile 手机号
 * @returns 是否符合格式
 */
export const isValidChineseMobile = (mobile: string): boolean => {
    const pattern = /^1[3-9]\d{9}$/;
    return pattern.test(mobile);
};

/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否符合格式
 */
export const isValidEmail = (email: string): boolean => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return pattern.test(email);
};

/**
 * 验证用户名格式(字母开头，允许字母、数字、下划线，长度5-20)
 * @param username 用户名
 * @returns 是否符合格式
 */
export const isValidUsername = (username: string): boolean => {
    const pattern = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/;
    return pattern.test(username);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度级别: 0-弱, 1-中, 2-强
 */
export const getPasswordStrength = (password: string): number => {
    if (password.length < 6) return 0;

    let strength = 0;
    // 包含数字
    if (/\d/.test(password)) strength++;
    // 包含小写字母
    if (/[a-z]/.test(password)) strength++;
    // 包含大写字母
    if (/[A-Z]/.test(password)) strength++;
    // 包含特殊字符
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // 根据密码长度和包含的字符类型评估强度
    if (password.length >= 10 && strength >= 3) {
        return 2; // 强
    } else if (password.length >= 8 && strength >= 2) {
        return 1; // 中
    }
    return 0; // 弱
};

export function validateDate(str: string): boolean {
    // 定义一个名为 `validateDate` 的函数，它接受一个字符串参数 `str`，并返回一个布尔值
    const dateFormats = [
        // 定义一个数组 `dateFormats`，其中包含了各种可能的日期格式的正则表达式
        /^\d{4}-\d{1,2}-\d{1,2}$/,
        // 匹配类似于 "YYYY-MM-DD" 的格式，其中月和日可以是 1 位或 2 位
        /^\d{4}\/\d{1,2}\/\d{1,2}$/,
        // 匹配类似于 "YYYY/MM/DD" 的格式，月和日可以是 1 位或 2 位
        /^\d{2}\.\d{1,2}\.\d{4}$/,
        // 匹配类似于 "DD.MM.YYYY" 的格式，月和日可以是 1 位或 2 位
        /^\d{2}\/\d{1,2}\/\d{4}$/,
        // 匹配类似于 "DD/MM/YYYY" 的格式，月和日可以是 1 位或 2 位
        /^\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/,
        // 匹配类似于 "DD MMM YYYY" 的格式，其中月份为英文缩写
        /^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "YYYY-MM-DD HH:mm:ss" 的格式，小时、分钟和秒可以是 1 位或 2 位
        /^\d{4}\/\d{1,2}\/\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "YYYY/MM/DD HH:mm:ss" 的格式，小时、分钟和秒可以是 1 位或 2 位
        /^\d{2}\.\d{1,2}\.\d{4}\s\d{1,2}:\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "DD.MM.YYYY HH:mm:ss" 的格式，小时、分钟和秒可以是 1 位或 2 位
        /^\d{2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "DD/MM/YYYY HH:mm:ss" 的格式，小时、分钟和秒可以是 1 位或 2 位
        /^\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "HH:mm" 的格式，小时和分钟可以是 1 位或 2 位
        /^\d{1,2}:\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "HH:mm:ss" 的格式，小时、分钟和秒可以是 1 位或 2 位
        /^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}\.\d{1,3}$/,
        // 匹配类似于 "YYYY-MM-DD HH:mm:ss.SSS" 的格式，毫秒可以是 1 到 3 位
        /^\d{4}年\d{1,2}月\d{1,2}日$/,
        // 匹配类似于 "YYYY 年 MM 月 DD 日" 的中文格式
        /^\d{4}年\d{1,2}月\d{1,2}日\s\d{1,2}:\d{1,2}:\d{1,2}$/,
        // 匹配类似于 "YYYY 年 MM 月 DD 日 HH:mm:ss" 的中文格式
        /^\d{4}年\d{1,2}月\d{1,2}日\s\d{1,2}:\d{1,2}:\d{1,2}\.\d{1,3}$/
        // 匹配类似于 "YYYY 年 MM 月 DD 日 HH:mm:ss.SSS" 的中文格式
    ];

    for (const format of dateFormats) {
        // 遍历 `dateFormats` 数组中的每个正则表达式
        if (format.test(str)) {
            // 如果当前正则表达式能够匹配输入的字符串 `str`
            return true;
            // 则返回 `true`，表示输入的字符串是有效的日期格式
        }
    }

    // 如果遍历完所有的正则表达式都没有匹配成功，则返回 `false`，表示输入的字符串不是有效的日期格式
    return false;
}

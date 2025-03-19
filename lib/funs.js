/**
 * 检查是否为空值
 * @param value 待检查的值
 * @returns 如果值为 null、undefined 或空字符串，则返回 true
 */
export const isEmpty = (value) => {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    return false;
};
/**
 * 判断环境是否为开发环境
 * @returns true表示当前为开发环境
 */
export const isDev = () => {
    // 浏览器环境检测
    if (typeof window !== 'undefined' && window.location) {
        const host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
    }
    // Node环境检测
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'development';
    }
    // Vite等打包工具的环境变量
    try {
        // 首先尝试访问import.meta
        // @ts-ignore TypeScript不识别扩展的import.meta属性
        if (typeof import.meta !== 'undefined' && import.meta?.env?.MODE) {
            // @ts-ignore
            return import.meta.env.MODE === 'development';
        }
    }
    catch (e) {
        // 忽略错误
    }
    return false;
};
export class Funs {
    static toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }
    /**
     * 获取当前环境
     * @param key 可选参数，指定要读取的环境变量键名（无需前缀）
     * @param def 默认值，当环境变量不存在时返回
     * @returns 环境变量值，如果未指定key则返回NODE_ENV
     */
    static getEnv(key, def = undefined, callback = undefined) {
        // 确定当前环境变量对象
        let env;
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                env = import.meta.env;
            }
            else if (typeof process !== 'undefined' && process.env) {
                env = process.env;
            }
            else {
                env = {};
            }
        }
        catch (e) {
            // 在Jest环境下，直接使用process.env
            env = typeof process !== 'undefined' && process.env ? process.env : {};
        }
        // 处理未提供 key 的情况
        if (key === undefined) {
            const nodeEnv = env.NODE_ENV || def || 'production';
            return typeof callback === 'function' ? callback(nodeEnv) : nodeEnv;
        }
        // 准备参数
        const keyString = String(key);
        let possibleKeys = [];
        // 生成可能的键名组合
        possibleKeys = [
            `REACT_APP_${keyString}`,
            `VITE_APP_${keyString}`,
            `VUE_APP_${keyString}`,
            `REACT_${keyString}`,
            `VITE_${keyString}`,
            `VUE_${keyString}`,
            keyString // 原始 key
        ];
        // 查找存在的环境变量
        let value;
        for (const envKey of possibleKeys) {
            if (env[envKey] !== undefined) {
                value = env[envKey];
                break;
            }
        }
        // 处理未找到的情况
        if (value === undefined) {
            value = def;
        }
        // 执行回调处理
        if (typeof callback === 'function') {
            try {
                value = callback(value);
            }
            catch (e) {
                console.error('Callback function error:', e);
            }
        }
        return value;
    }
    /**
     * 判断是否为开发环境
     * @param env_key 可选的环境变量键名
     * @returns true表示当前为开发环境
     */
    static isDevelopment(env_key) {
        if (env_key) {
            const env = this.getEnv(env_key);
            return env === 'development' || env === 'dev' || env === true || env === 'true';
        }
        const nodeEnv = this.getEnv('NODE_ENV');
        if (nodeEnv) {
            return nodeEnv === 'development' || nodeEnv === 'dev';
        }
        // 检测minification
        try {
            // 生产环境代码通常会被压缩，函数名会被缩短
            const isMinified = /function\s+\w{1,2}\(/.test(Funs.isDevelopment.toString());
            return !isMinified;
        }
        catch (e) {
            return false;
        }
    }
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
    static validateJSON(jsonString, needParse = false) {
        // 基础类型校验
        if (typeof jsonString !== 'string') {
            return {
                isValid: false,
                error: `Expected string but received ${typeof jsonString}`
            };
        }
        // 空字符串处理
        const trimmed = jsonString.trim();
        if (trimmed === '') {
            return {
                isValid: false,
                error: 'Empty JSON string'
            };
        }
        try {
            // 核心解析逻辑
            const parsed = JSON.parse(trimmed);
            // 处理非合法JSON对象的情况（如纯量值）
            if (!needParse && typeof parsed !== 'object' && !Array.isArray(parsed)) {
                return {
                    isValid: false,
                    error: 'Valid JSON but not an object/array'
                };
            }
            // 返回结果
            const result = { isValid: true, data: undefined };
            if (needParse)
                result.data = parsed;
            return result;
        }
        catch (e) {
            // 错误信息增强处理
            let errorMessage = 'Invalid JSON format';
            if (e instanceof SyntaxError) {
                errorMessage += `: ${e.message}`;
                // 增强位置信息提示
                const match = e.message.match(/at position (\d+)/);
                if (match) {
                    const position = parseInt(match[1]);
                    const preview = jsonString.slice(Math.max(0, position - 10), position + 10);
                    errorMessage += ` (near "...${preview}...")`;
                }
            }
            return {
                isValid: false,
                data: jsonString,
                error: errorMessage
            };
        }
        // 基础校验
        // console.log(validateJSON('{"name": "John"}'))
        // { isValid: true }
        // 带解析的校验
        // console.log(validateJSON('{"age": 30}', true))
        // { isValid: true, data: { age: 30 } }
        // 错误示例
        // const badJSON = '{name: "John"}'
        // console.log(validateJSON(badJSON))
        // {
        //   isValid: false,
        //   error: 'Invalid JSON format: Unexpected token n in JSON at position 1 (near "...{name: "John"}...")'
        // }
        // 非对象校验
        // console.log(validateJSON('123'))
        // { isValid: false, error: 'Valid JSON but not an object/array' }
        // 错误类型输入
        // console.log(validateJSON(null))
        // { isValid: false, error: 'Expected string but received object' }
    }
}

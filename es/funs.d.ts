export declare class Funs {
    static toBase64(file: any): Promise<string>;
    /**
   * 自动检测当前是否处于开发环境
   * @returns {boolean} true=开发环境，false=生产环境
   */
    static isDevelopment(env_key?: string): boolean;
    /**
    * 检测项目类型，并自动补全前缀读取环境变量
    * @param {string} [key] 可选参数，指定要读取的环境变量键名（无需前缀）
    * @returns {Object} 包含项目类型和键名对应的值
    */
    static getEnv<T>(key: string, def?: T): "" | NonNullable<T>;
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

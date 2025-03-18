export class Funs {
  public static toBase64(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    })
  }


  /**
 * 自动检测当前是否处于开发环境
 * @returns {boolean} true=开发环境，false=生产环境
 */
  public static isDevelopment(env_key?: string) {
    if (env_key) {
      return Funs.getEnv(env_key, '').toLocaleLowerCase() === 'true';
    }

    // ================= 优先级1：标准环境变量检测 =================
    // Node.js / Webpack / Vite 等环境
    if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
      return process.env.NODE_ENV === 'development';
    }

    // ================= 优先级2：Vite 环境检测 =================
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE) {
        return (import.meta as any).env.MODE === 'development';
      }
    } catch (e) {
      // 忽略 import.meta 不可用的情况
    }

    // ================= 优先级3：浏览器宿主特征检测 =================
    if (typeof window !== 'undefined' && window.location) {
      const { hostname, port } = window.location;
      // 特征1：本地域名
      const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(hostname);
      // 特征2：常见开发端口
      const isDevPort = ['3000', '5173', '8080', ''].includes(port); // 空端口表示80/443
      return isLocalhost || isDevPort;
    }

    // ================= 优先级4：代码压缩特征检测（兜底逻辑） =================
    try {
      // 生产环境代码通常会被压缩，函数名会被缩短
      const isMinified = /function\s+\w{1,2}\(/.test(Funs.isDevelopment().toString());
      return !isMinified;
    } catch (e) {
      return false;
    }
  }


  /**
  * 检测项目类型，并自动补全前缀读取环境变量
  * @param {string} [key] 可选参数，指定要读取的环境变量键名（无需前缀）
  * @returns {Object} 包含项目类型和键名对应的值
  */
  public static getEnv<T>(key: string, def?: T) {
    let projectType = '未知类型';
    let detectedValue = def;

    const env = (
      // 1. 优先检测 Node.js 环境变量
      (typeof process !== 'undefined' && process?.env) ||
      // 2. 其次检测 Vite/Webpack 等构建工具注入的环境变量
      (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ||
      // 3. 兜底空对象避免 undefined
      {}
    );

    // 项目类型特征检测
    const isUmi = Object.keys(env).some(k => k.startsWith('UMI_APP_') || k === 'UMI_ENV');
    const isVite = Object.keys(env).some(k => k.startsWith('VITE_APP_') || k.startsWith('VITE_'));
    const isNode = Object.keys(env).some(k => k.startsWith('NODE_ENV_') || k.startsWith('NODE_'));

    // 确定项目类型
    if (isUmi) projectType = 'umi';
    else if (isVite) projectType = 'vite';
    else if (isNode) projectType = 'node';

    // 处理键名参数
    if (key) {
      // 生成候选键名列表（按优先级排序）
      const candidateKeys = [];

      switch (projectType) {
        case 'umi':
          // Umi 可能存在的键名格式：UMI_ENV 或 UMI_APP_[key]
          candidateKeys.push(`UMI_APP_${key}`, `UMI_${key}`);
          break;
        case 'vite':
          candidateKeys.push(`VITE_APP_${key}`, `VITE_${key}`);
          break;
        case 'node':
          // NODE 可能存在的键名格式：NODE 或 NODE_ENV_[key]
          candidateKeys.push(`NODE_ENV_${key}`, `NODE_${key}`);
          break;
        default:
          // 未知类型直接尝试原键名
          candidateKeys.push(key);
      }

      // 追加原始键名作为兜底
      candidateKeys.push(key);

      // 遍历查找存在的键
      for (const candidateKey of candidateKeys) {
        if (env.hasOwnProperty(candidateKey)) {
          detectedValue = env[candidateKey];
          break;
        }
      }
    }

    return detectedValue ?? "";

    // 使用示例
    // 场景1：在 Umi 项目中读取 API_URL（实际使用 UMI_APP_API_URL）
    // console.log(detectProjectType('API_URL'));

    // 场景2：在 Vite 项目中读取 MODE（实际使用 VITE_MODE）
    // console.log(detectProjectType('MODE'));

    // 场景3：读取特殊键 UMI_ENV（自动匹配 UMI_ENV）
    // console.log(detectProjectType('ENV'));

    // 场景4：未知项目类型
    // console.log(detectProjectType('VERSION'));
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
  public static validateJSON(jsonString: string, needParse = false): { isValid: boolean, error?: string, data?: any } {
    // 基础类型校验
    if (typeof jsonString !== 'string') {
      return {
        isValid: false,
        error: `Expected string but received ${typeof jsonString}`
      }
    }

    // 空字符串处理
    const trimmed = jsonString.trim()
    if (trimmed === '') {
      return {
        isValid: false,
        error: 'Empty JSON string'
      }
    }

    try {
      // 核心解析逻辑
      const parsed = JSON.parse(trimmed)

      // 处理非合法JSON对象的情况（如纯量值）
      if (!needParse && typeof parsed !== 'object' && !Array.isArray(parsed)) {
        return {
          isValid: false,
          error: 'Valid JSON but not an object/array'
        }
      }

      // 返回结果
      const result = { isValid: true, data: undefined }
      if (needParse) result.data = parsed
      return result
    } catch (e) {
      // 错误信息增强处理
      let errorMessage = 'Invalid JSON format'
      if (e instanceof SyntaxError) {
        errorMessage += `: ${e.message}`

        // 增强位置信息提示
        const match = e.message.match(/at position (\d+)/)
        if (match) {
          const position = parseInt(match[1])
          const preview = jsonString.slice(Math.max(0, position - 10), position + 10)
          errorMessage += ` (near "...${preview}...")`
        }
      }

      return {
        isValid: false,
        data: jsonString,
        error: errorMessage
      }
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

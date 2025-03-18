// 模拟 import.meta 对象
if (typeof globalThis.import === 'undefined') {
  globalThis.import = {};
}

if (typeof globalThis.import.meta === 'undefined') {
  globalThis.import.meta = {
    env: {
      MODE: 'test',
      DEV: false,
      PROD: false,
      SSR: false,
      APP_SERVICE_BASE_URL: 'https://api.example.com',
    },
    url: 'file:///test/url',
  };
}

// 修复 HTMLElement 缺失问题
if (typeof globalThis.HTMLElement === 'undefined') {
  globalThis.HTMLElement = class HTMLElement {};
}

// 清理控制台输出的警告信息
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  // 过滤一些已知的警告
  if (args[0] && 
      (String(args[0]).includes('import.meta') || 
       String(args[0]).includes('rewriteModuleImports'))) {
    return;
  }
  originalConsoleWarn.apply(console, args);
}; 
// 引入Jest扩展
// 注释掉暂时不需要的扩展
// require('@testing-library/jest-dom');

// 扩展Jest匹配器
expect.extend({
  toHaveBeenCalledTimes(received, expected) {
    const receivedCount = received.mock.calls.length;
    const pass = receivedCount === expected;
    
    return {
      pass,
      message: () => {
        if (pass) {
          return `预期函数被调用 ${expected} 次，实际被调用 ${receivedCount} 次`;
        } else {
          return `预期函数被调用 ${expected} 次，实际被调用 ${receivedCount} 次`;
        }
      }
    };
  },
});

// 模拟 import.meta
global.import = { 
  meta: { 
    env: { 
      MODE: 'test' 
    } 
  } 
};

// 全局测试配置
beforeAll(() => {
  // 模拟浏览器环境的localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // 全局模拟console对象，避免测试输出过多日志
  global.console = {
    ...console,
    // 保留错误日志，但可以通过jest.spyOn监控
    error: jest.fn(),
    // 不显示警告和信息日志
    warn: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
  };
}); 
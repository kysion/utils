/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        // 解决 import.meta 问题
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid|axios)/)',
  ],
  moduleNameMapper: {
    // 处理 ESM 导入
    '^(\\.\\.?\\/.+)\\.js$': '$1',
    // 处理nanoid - 使用简单mock
    '^nanoid$': '<rootDir>/src/__mocks__/nanoid.js'
  },
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/dist/',
    '/es/',
    '/lib/'
  ],
  globals: {
    // 为 import.meta 提供模拟值
    'ts-jest': {
      useESM: true,
    },
  },
  // 模拟 import.meta
  setupFiles: ['<rootDir>/jest.setup.js'],
}; 
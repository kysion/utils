/**
 * HTTP模块文件上传下载示例
 * 演示如何使用HTTP模块进行文件上传、下载、断点续传和进度跟踪
 */
/**
 * 配置HTTP模块
 */
declare function configureHttpExample(): void;
/**
 * 基本文件上传示例
 */
declare function basicUploadExample(): Promise<void>;
/**
 * 大文件上传示例（带断点续传）
 */
declare function largeFileUploadExample(): Promise<void>;
/**
 * 文件下载示例
 */
declare function downloadExample(): Promise<void>;
/**
 * 大文件下载示例（带断点续传）
 */
declare function largeFileDownloadExample(): Promise<void>;
/**
 * 运行所有示例
 */
declare function runAllExamples(): Promise<void>;
export { configureHttpExample, basicUploadExample, largeFileUploadExample, downloadExample, largeFileDownloadExample, runAllExamples };

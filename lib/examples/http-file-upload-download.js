/**
 * HTTP模块文件上传下载示例
 * 演示如何使用HTTP模块进行文件上传、下载、断点续传和进度跟踪
 */
import { upload, uploadLargeFile, download, downloadLargeFile, configureHttp } from '../http';
/**
 * 配置HTTP模块
 */
function configureHttpExample() {
    // 设置全局配置
    configureHttp({
        // 默认分块大小为2MB
        defaultChunkSize: 2 * 1024 * 1024,
        // 默认上传并发数为3
        defaultUploadConcurrency: 3,
        // 默认下载并发数为3
        defaultDownloadConcurrency: 3
    });
}
/**
 * 基本文件上传示例
 */
async function basicUploadExample() {
    // 确保upload函数可用
    if (!upload) {
        console.error('上传功能不可用，可能是环境限制');
        return;
    }
    try {
        // 在浏览器环境中获取文件
        // const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
        // if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
        // const file = fileInput.files[0];
        // 为演示创建一个模拟文件
        const mockFile = new File(['文件内容示例'], 'test-file.txt', { type: 'text/plain' });
        // 基本上传
        const result = await upload('/api/upload', mockFile);
        console.log('上传成功:', result);
        // 带进度跟踪的上传
        await upload('/api/upload', mockFile, {
            // 简单进度回调
            onUploadProgress: (event) => {
                const percent = Math.floor(((event.loaded || 0) / (event.total || 1)) * 100);
                console.log(`简单进度: ${percent}%`);
            },
            // 增强进度回调
            onUploadProgressInfo: (info) => {
                console.log(`上传进度: ${info.percent}%`);
                console.log(`上传速度: ${info.speed ? (info.speed / 1024).toFixed(2) : 0} KB/s`);
                console.log(`剩余时间: ${info.remainingTime?.toFixed(1) || '未知'} 秒`);
            },
            // 自动计算上传速度
            calculateSpeed: true,
            // 附加表单数据
            data: {
                category: 'documents',
                tags: 'example,test'
            }
        });
    }
    catch (error) {
        console.error('上传失败:', error);
    }
}
/**
 * 大文件上传示例（带断点续传）
 */
async function largeFileUploadExample() {
    // 确保uploadLargeFile函数可用
    if (!uploadLargeFile) {
        console.error('大文件上传功能不可用，可能是环境限制');
        return;
    }
    try {
        // 创建大文件模拟数据（实际应用中应从表单获取）
        const mockLargeFileData = new Uint8Array(5 * 1024 * 1024); // 5MB
        for (let i = 0; i < mockLargeFileData.length; i++) {
            mockLargeFileData[i] = i % 256;
        }
        const mockLargeFile = new File([mockLargeFileData], 'large-file.dat');
        // 显示上传进度的DOM元素（仅作为示例）
        // const progressElement = document.querySelector('.progress-bar');
        // const statusElement = document.querySelector('.status');
        // 尝试获取之前保存的断点续传信息
        let resumeInfo;
        try {
            const savedResumeInfo = localStorage.getItem('upload-resume-info');
            if (savedResumeInfo) {
                resumeInfo = JSON.parse(savedResumeInfo);
                console.log('发现断点续传信息:', resumeInfo);
            }
        }
        catch (e) {
            console.error('无法解析断点续传信息');
        }
        // 大文件上传
        const result = await uploadLargeFile('/api/upload/chunks', mockLargeFile, {
            // 分块大小 (2MB)
            chunkSize: 2 * 1024 * 1024,
            // 并发上传数
            concurrency: 3,
            // 启用断点续传
            resumable: true,
            // 使用之前的断点续传信息（如果有）
            resumeInfo,
            // 进度回调
            onUploadProgressInfo: (info) => {
                console.log(`上传进度: ${info.percent}%`);
                console.log(`上传速度: ${info.speed ? (info.speed / 1024).toFixed(2) : 0} KB/s`);
                // 在UI上更新进度条（实际应用中）
                // if (progressElement) {
                //     progressElement.style.width = `${info.percent}%`;
                //     progressElement.textContent = `${info.percent}%`;
                // }
                // if (statusElement) {
                //     statusElement.textContent = `已上传 ${(info.loaded / 1024 / 1024).toFixed(2)} MB / ${(info.total / 1024 / 1024).toFixed(2)} MB`;
                // }
            },
            // 计算速度
            calculateSpeed: true
        });
        console.log('大文件上传成功:', result);
        // 清除断点续传信息
        localStorage.removeItem('upload-resume-info');
    }
    catch (error) {
        console.error('大文件上传失败:', error);
        // 如果有断点续传信息，保存它以便稍后恢复
        if (error.resumeInfo) {
            localStorage.setItem('upload-resume-info', JSON.stringify(error.resumeInfo));
            console.log('已保存断点续传信息，可以稍后继续上传');
        }
    }
}
/**
 * 文件下载示例
 */
async function downloadExample() {
    // 确保download函数可用
    if (!download) {
        console.error('下载功能不可用，可能是环境限制');
        return;
    }
    try {
        // 基本下载（自动保存文件）
        await download('/api/files/example.pdf', {
            fileName: 'downloaded-example.pdf'
        });
        // 带进度跟踪的下载
        const fileBlob = await download('/api/files/example.pdf', {
            fileName: 'downloaded-example.pdf',
            onDownloadProgressInfo: (info) => {
                console.log(`下载进度: ${info.percent}%`);
                console.log(`下载速度: ${info.speed ? (info.speed / 1024).toFixed(2) : 0} KB/s`);
            },
            calculateSpeed: true
        });
        // 处理下载的文件
        if (fileBlob instanceof Blob) {
            // 创建预览URL（仅在浏览器环境）
            const previewUrl = URL.createObjectURL(fileBlob);
            console.log('文件预览URL:', previewUrl);
            // 示例：如果是图片，可以在img标签中显示
            // document.querySelector('img.preview').src = previewUrl;
            // 使用完后释放URL
            // setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
        }
    }
    catch (error) {
        console.error('下载失败:', error);
    }
}
/**
 * 大文件下载示例（带断点续传）
 */
async function largeFileDownloadExample() {
    // 确保downloadLargeFile函数可用
    if (!downloadLargeFile) {
        console.error('大文件下载功能不可用，可能是环境限制');
        return;
    }
    try {
        // 显示下载进度的DOM元素（仅作为示例）
        // const progressElement = document.querySelector('.download-progress');
        // const statusElement = document.querySelector('.download-status');
        // 尝试获取之前保存的断点续传信息
        let resumeInfo;
        try {
            const savedResumeInfo = localStorage.getItem('download-resume-info');
            if (savedResumeInfo) {
                resumeInfo = JSON.parse(savedResumeInfo);
                console.log('发现下载断点续传信息:', resumeInfo);
            }
        }
        catch (e) {
            console.error('无法解析下载断点续传信息');
        }
        // 大文件下载
        const fileBlob = await downloadLargeFile('/api/files/large-example.zip', {
            fileName: 'large-example.zip',
            // 分块大小 (5MB)
            chunkSize: 5 * 1024 * 1024,
            // 并发下载数
            concurrency: 3,
            // 启用断点续传
            resumable: true,
            // 使用之前的断点续传信息（如果有）
            resumeInfo,
            // 进度回调
            onDownloadProgressInfo: (info) => {
                console.log(`下载进度: ${info.percent}%`);
                console.log(`下载速度: ${info.speed ? (info.speed / 1024).toFixed(2) : 0} KB/s`);
                // 在UI上更新进度条（实际应用中）
                // if (progressElement) {
                //     progressElement.style.width = `${info.percent}%`;
                //     progressElement.textContent = `${info.percent}%`;
                // }
                // if (statusElement) {
                //     statusElement.textContent = `已下载 ${(info.loaded / 1024 / 1024).toFixed(2)} MB / ${(info.total / 1024 / 1024).toFixed(2)} MB`;
                // }
            },
            // 计算速度
            calculateSpeed: true
        });
        console.log('大文件下载成功，文件大小:', fileBlob instanceof Blob ? fileBlob.size :
            Buffer.isBuffer(fileBlob) ? fileBlob.length : '未知大小');
        // 清除断点续传信息
        localStorage.removeItem('download-resume-info');
    }
    catch (error) {
        console.error('大文件下载失败:', error);
        // 如果有断点续传信息，保存它以便稍后恢复
        if (error.resumeInfo) {
            localStorage.setItem('download-resume-info', JSON.stringify(error.resumeInfo));
            console.log('已保存下载断点续传信息，可以稍后继续下载');
        }
    }
}
/**
 * 运行所有示例
 */
async function runAllExamples() {
    // 配置HTTP模块
    configureHttpExample();
    console.log('1. 运行基本上传示例');
    await basicUploadExample();
    console.log('2. 运行大文件上传示例');
    await largeFileUploadExample();
    console.log('3. 运行基本下载示例');
    await downloadExample();
    console.log('4. 运行大文件下载示例');
    await largeFileDownloadExample();
}
// 仅在浏览器环境运行示例
if (typeof window !== 'undefined') {
    // 示例：绑定到全局变量以便在控制台运行
    window.httpExamples = {
        runAll: runAllExamples,
        basicUpload: basicUploadExample,
        largeFileUpload: largeFileUploadExample,
        download: downloadExample,
        largeFileDownload: largeFileDownloadExample
    };
    console.log('HTTP文件上传下载示例已加载。可以在控制台运行 httpExamples.runAll() 来执行所有示例。');
}
// 导出示例函数
export { configureHttpExample, basicUploadExample, largeFileUploadExample, downloadExample, largeFileDownloadExample, runAllExamples };

export const APP_NAME: string = 'esayimage';
export const APP_START_YEAR: number = 2025;
export const APP_LOGIN_REDIRECT_URI: string = '/image/upload';
export const APP_LOGIN_URI: string = '/user/login';
export const NO_CHECK_PATH_LIST: string[] = ['/', 'user/login'];
export const NO_TOKEN_API_LIST: string[] = [
    "/api/user/login",
    "/api/ping",
    "/api/metrics",
    "/api/server_info",
];

// 图片上传配置
export const IMAGE_UPLOAD_CONFIG = {
    // 支持的图片MIME类型
    supportedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/heic',
        'image/heif'
    ],
    // 支持的图片扩展名
    supportedExtensions: [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.bmp',
        '.tiff',
        '.heic',
        '.heif'
    ],
    // 最大文件大小（MB）
    maxSizeMB: 50
};
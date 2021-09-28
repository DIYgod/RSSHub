import dotenv from 'dotenv';
dotenv.config();
const envs = process.env;

export default {
    isPackage: envs.IS_PACKAGE,
    noLogfiles: envs.NO_LOGFILES,
    connect: {
        port: envs.PORT || 1200, // 监听端口
        socket: envs.SOCKET || null, // 监听 Unix Socket, null 为禁用
    },
    cache: {
        type: typeof envs.CACHE_TYPE === 'undefined' ? 'memory' : envs.CACHE_TYPE, // 缓存类型，支持 'memory' 和 'redis'，设为空可以禁止缓存
        requestTimeout: parseInt(envs.CACHE_REQUEST_TIMEOUT) || 60,
        routeExpire: parseInt(envs.CACHE_EXPIRE) || 5 * 60, // 路由缓存时间，单位为秒
        contentExpire: parseInt(envs.CACHE_CONTENT_EXPIRE) || 1 * 60 * 60, // 不变内容缓存时间，单位为秒
    },
    ua: envs.UA || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    listenInaddrAny: envs.LISTEN_INADDR_ANY || 1, // 是否允许公网连接，取值 0 1
    requestRetry: parseInt(envs.REQUEST_RETRY) || 2, // 请求失败重试次数
    requestTimeout: parseInt(envs.REQUEST_TIMEOUT) || 30000, // Milliseconds to wait for the server to end the response before aborting the request
    // 是否显示 Debug 信息，取值 'true' 'false' 'some_string' ，取值为 'true' 时永久显示，取值为 'false' 时永远隐藏，取值为 'some_string' 时请求带上 '?debug=some_string' 显示
    debugInfo: envs.DEBUG_INFO || 'true',
    disallowRobot: envs.DISALLOW_ROBOT !== '0' && envs.DISALLOW_ROBOT !== 'false',
    titleLengthLimit: parseInt(envs.TITLE_LENGTH_LIMIT) || 150,
    redis: {
        url: envs.REDIS_URL || 'redis://localhost:6379/',
    },
    nodeName: envs.NODE_NAME,
};
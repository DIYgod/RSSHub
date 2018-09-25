module.exports = {
    connect: {
        port: process.env.PORT || 1200, // 监听端口
        socket: process.env.SOCKET || null, // 监听 Unix Socket, null 为禁用
    },
    cacheType: 'memory', // 缓存类型，支持 'memory' 和 'redis'，设为空可以禁止缓存
    cacheExpire: 5 * 60, // 缓存时间，单位为秒
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    listenInaddrAny: 1, // 是否允许公网连接，取值 0 1
    requestRetry: 2, // 请求失败重试次数
    // 是否显示 Debug 信息，取值 boolean 'false' 'key' ，取值为 'false' false 时永远不显示，取值为 'key' 时带上 ?debug=key 显示
    debugInfo: true,
    sentry: '', // 使用 sentry 进行错误追踪，这里是 sentry 提供的 DSN 链接
    titleLengthLimit: 100,
    redis: {
        url: 'redis://localhost:6379/',
        options: {
            // 支持这些参数 https://github.com/NodeRedis/node_redis#options-object-properties
            password: process.env.REDIS_PASSWORD || null,
        },
    },
    pixiv: {
        client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
        client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
        username: undefined,
        password: undefined,
    },
    disqus: {
        api_key: undefined,
    },
    twitter: {
        consumer_key: undefined,
        consumer_secret: undefined,
        access_token: undefined,
        access_token_secret: undefined,
    },
    youtube: {
        key: undefined,
    },
    telegram: {
        token: undefined,
    },
    github: {
        access_token: undefined,
    },
    imgur: {
        clientId: undefined,
    },
    authentication: {
        name: process.env.HTTP_BASIC_AUTH_NAME || 'usernam3',
        pass: process.env.HTTP_BASIC_AUTH_PASS || 'passw0rd',
    },
};

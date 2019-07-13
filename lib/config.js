const bilibili_cookies = {};
const twitter_tokens = {};
const envs = process.env;
for (const name in envs) {
    if (name.startsWith('BILIBILI_COOKIE_')) {
        const uid = name.slice(16);
        bilibili_cookies[uid] = envs[name];
    } else if (name.startsWith('TWITTER_TOKEN_')) {
        const id = name.slice(14);
        twitter_tokens[id] = envs[name];
    }
}

module.exports = {
    connect: {
        port: process.env.PORT || 1200, // 监听端口
        socket: process.env.SOCKET || null, // 监听 Unix Socket, null 为禁用
    },
    cache: {
        type: typeof process.env.CACHE_TYPE === 'undefined' ? 'memory' : process.env.CACHE_TYPE, // 缓存类型，支持 'memory' 和 'redis'，设为空可以禁止缓存
        routeExpire: parseInt(process.env.CACHE_EXPIRE) || 5 * 60, // 路由缓存时间，单位为秒
        contentExpire: parseInt(process.env.CACHE_CONTENT_EXPIRE) || 1 * 60 * 60, // 不变内容缓存时间，单位为秒
    },
    ua: process.env.UA || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    listenInaddrAny: parseInt(process.env.LISTEN_INADDR_ANY) || 1, // 是否允许公网连接，取值 0 1
    requestRetry: parseInt(process.env.REQUEST_RETRY) || 2, // 请求失败重试次数
    // 是否显示 Debug 信息，取值 boolean 'false' 'key' ，取值为 'false' false 时永远不显示，取值为 'key' 时带上 ?debug=key 显示
    debugInfo: process.env.DEBUG_INFO || true,
    titleLengthLimit: parseInt(process.env.TITLE_LENGTH_LIMIT) || 100,
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379/',
        options: {
            // 支持这些参数 https://github.com/NodeRedis/node_redis#options-object-properties
            password: process.env.REDIS_PASSWORD || null,
        },
    },
    pixiv: {
        client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
        client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
        username: process.env.PIXIV_USERNAME,
        password: process.env.PIXIV_PASSWORD,
    },
    disqus: {
        api_key: process.env.DISQUS_API_KEY,
    },
    twitter: {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        tokens: twitter_tokens,
    },
    youtube: {
        key: process.env.YOUTUBE_KEY,
    },
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
    },
    github: {
        access_token: process.env.GITHUB_ACCESS_TOKEN,
    },
    imgur: {
        clientId: process.env.IMGUR_CLIRNT_ID,
    },
    authentication: {
        name: process.env.HTTP_BASIC_AUTH_NAME || 'usernam3',
        pass: process.env.HTTP_BASIC_AUTH_PASS || 'passw0rd',
    },
    bilibili: {
        cookies: bilibili_cookies,
    },
    yuque: {
        token: process.env.YUQUE_TOKEN,
    },
    puppeteerWSEndpoint: process.env.PUPPETEER_WS_ENDPOINT,
    loggerLevel: process.env.LOGGER_LEVEL || 'info',
    proxy: {
        protocol: process.env.PROXY_PROTOCOL,
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT,
        auth: process.env.PROXY_AUTH,
        url_regex: process.env.PROXY_URL_REGEX || '.*',
    },
    blacklist: process.env.BLACKLIST && process.env.BLACKLIST.split(','),
    whitelist: process.env.WHITELIST && process.env.WHITELIST.split(','),
    enableCluster: process.env.ENABLE_CLUSTER,
};

require('dotenv').config();
let envs = process.env;
let value;

const calculateValue = () => {
    const bilibili_cookies = {};
    const twitter_tokens = {};
    const email_config = {};
    const discuz_cookies = {};

    for (const name in envs) {
        if (name.startsWith('BILIBILI_COOKIE_')) {
            const uid = name.slice(16);
            bilibili_cookies[uid] = envs[name];
        } else if (name.startsWith('TWITTER_TOKEN_')) {
            const id = name.slice(14);
            twitter_tokens[id] = envs[name];
        } else if (name.startsWith('EMAIL_CONFIG_')) {
            const id = name.slice(13);
            email_config[id] = envs[name];
        } else if (name.startsWith('DISCUZ_COOKIE_')) {
            const cid = name.slice(14);
            discuz_cookies[cid] = envs[name];
        }
    }

    value = {
        isPackage: envs.isPackage,
        connect: {
            port: envs.PORT || 1200, // 监听端口
            socket: envs.SOCKET || null, // 监听 Unix Socket, null 为禁用
        },
        cache: {
            type: typeof envs.CACHE_TYPE === 'undefined' ? 'memory' : envs.CACHE_TYPE, // 缓存类型，支持 'memory' 和 'redis'，设为空可以禁止缓存
            routeExpire: parseInt(envs.CACHE_EXPIRE) || 5 * 60, // 路由缓存时间，单位为秒
            contentExpire: parseInt(envs.CACHE_CONTENT_EXPIRE) || 1 * 60 * 60, // 不变内容缓存时间，单位为秒
        },
        ua: envs.UA || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
        listenInaddrAny: envs.LISTEN_INADDR_ANY || 1, // 是否允许公网连接，取值 0 1
        requestRetry: parseInt(envs.REQUEST_RETRY) || 2, // 请求失败重试次数
        // 是否显示 Debug 信息，取值 boolean 'false' 'key' ，取值为 'false' false 时永远不显示，取值为 'key' 时带上 ?debug=key 显示
        debugInfo: envs.DEBUG_INFO || true,
        titleLengthLimit: parseInt(envs.TITLE_LENGTH_LIMIT) || 100,
        redis: {
            url: envs.REDIS_URL || 'redis://localhost:6379/',
            options: {
                // 支持这些参数 https://github.com/NodeRedis/node_redis#options-object-properties
                password: envs.REDIS_PASSWORD || null,
            },
        },
        nodeName: envs.NODE_NAME,
        suffix: envs.SUFFIX,
        pixiv: {
            username: envs.PIXIV_USERNAME,
            password: envs.PIXIV_PASSWORD,
        },
        disqus: {
            api_key: envs.DISQUS_API_KEY,
        },
        twitter: {
            consumer_key: envs.TWITTER_CONSUMER_KEY,
            consumer_secret: envs.TWITTER_CONSUMER_SECRET,
            tokens: twitter_tokens,
        },
        youtube: {
            key: envs.YOUTUBE_KEY,
        },
        telegram: {
            token: envs.TELEGRAM_TOKEN,
        },
        github: {
            access_token: envs.GITHUB_ACCESS_TOKEN,
        },
        authentication: {
            name: envs.HTTP_BASIC_AUTH_NAME || 'usernam3',
            pass: envs.HTTP_BASIC_AUTH_PASS || 'passw0rd',
        },
        bilibili: {
            cookies: bilibili_cookies,
        },
        yuque: {
            token: envs.YUQUE_TOKEN,
        },
        puppeteerWSEndpoint: envs.PUPPETEER_WS_ENDPOINT,
        loggerLevel: envs.LOGGER_LEVEL || 'info',
        proxy: {
            protocol: envs.PROXY_PROTOCOL,
            host: envs.PROXY_HOST,
            port: envs.PROXY_PORT,
            auth: envs.PROXY_AUTH,
            url_regex: envs.PROXY_URL_REGEX || '.*',
        },
        blacklist: envs.BLACKLIST && envs.BLACKLIST.split(','),
        whitelist: envs.WHITELIST && envs.WHITELIST.split(','),
        enableCluster: envs.ENABLE_CLUSTER,
        email: {
            config: email_config,
        },
        sentry: envs.SENTRY,
        chuiniu: {
            member: envs.CHUINIU_MEMBER,
        },
        weibo: {
            app_key: envs.WEIBO_APP_KEY,
            app_secret: envs.WEIBO_APP_SECRET,
            redirect_url: envs.WEIBO_REDIRECT_URL,
        },
        fanfou: {
            consumer_key: envs.FANFOU_CONSUMER_KEY,
            consumer_secret: envs.FANFOU_CONSUMER_SECRET,
            username: envs.FANFOU_USERNAME,
            password: envs.FANFOU_PASSWORD,
        },
        lastfm: {
            api_key: envs.LASTFM_API_KEY,
        },
        pkubbs: {
            cookie: envs.PKUBBS_COOKIE,
        },
        nhentai: {
            username: envs.NHENTAI_USERNAME,
            password: envs.NHENTAI_PASSWORD,
        },
        discuz: {
            cookies: discuz_cookies,
        },
        scihub: {
            host: envs.SCIHUB_HOST || 'https://sci-hub.tw/',
        },
    };
};
calculateValue();

module.exports = {
    set: (env) => {
        envs = Object.assign(process.env, env);
        calculateValue();
    },
    get value() {
        return value;
    },
};

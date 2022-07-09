require('dotenv').config();
const randUserAgent = require('./utils/rand-user-agent');
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
        // app config
        disallowRobot: envs.DISALLOW_ROBOT !== '0' && envs.DISALLOW_ROBOT !== 'false',
        enableCluster: envs.ENABLE_CLUSTER,
        isPackage: envs.IS_PACKAGE,
        nodeName: envs.NODE_NAME,
        puppeteerWSEndpoint: envs.PUPPETEER_WS_ENDPOINT,
        chromiumExecutablePath: envs.CHROMIUM_EXECUTABLE_PATH,
        // network
        connect: {
            port: envs.PORT || 1200, // 监听端口
            socket: envs.SOCKET || null, // 监听 Unix Socket, null 为禁用
        },
        listenInaddrAny: envs.LISTEN_INADDR_ANY || 1, // 是否允许公网连接，取值 0 1
        requestRetry: parseInt(envs.REQUEST_RETRY) || 2, // 请求失败重试次数
        requestTimeout: parseInt(envs.REQUEST_TIMEOUT) || 30000, // Milliseconds to wait for the server to end the response before aborting the request
        ua: envs.UA || randUserAgent({ browser: 'chrome', os: 'mac os', device: 'desktop' }),
        // cors request
        allowOrigin: envs.ALLOW_ORIGIN,
        // cache
        cache: {
            type: typeof envs.CACHE_TYPE === 'undefined' ? 'memory' : envs.CACHE_TYPE, // 缓存类型，支持 'memory' 和 'redis'，设为空可以禁止缓存
            requestTimeout: parseInt(envs.CACHE_REQUEST_TIMEOUT) || 60,
            routeExpire: parseInt(envs.CACHE_EXPIRE) || 5 * 60, // 路由缓存时间，单位为秒
            contentExpire: parseInt(envs.CACHE_CONTENT_EXPIRE) || 1 * 60 * 60, // 不变内容缓存时间，单位为秒
        },
        memory: {
            max: parseInt(envs.MEMORY_MAX) || Math.pow(2, 8), // The maximum number of items that remain in the cache. This must be a positive finite intger.
            // https://github.com/isaacs/node-lru-cache#options
        },
        redis: {
            url: envs.REDIS_URL || 'redis://localhost:6379/',
        },
        // proxy
        proxyUri: envs.PROXY_URI,
        proxy: {
            protocol: envs.PROXY_PROTOCOL,
            host: envs.PROXY_HOST,
            port: envs.PROXY_PORT,
            auth: envs.PROXY_AUTH,
            url_regex: envs.PROXY_URL_REGEX || '.*',
        },
        // auth
        authentication: {
            name: envs.HTTP_BASIC_AUTH_NAME || 'usernam3',
            pass: envs.HTTP_BASIC_AUTH_PASS || 'passw0rd',
        },
        // access control
        blacklist: envs.BLACKLIST && envs.BLACKLIST.split(','),
        whitelist: envs.WHITELIST && envs.WHITELIST.split(','),
        allowLocalhost: envs.ALLOW_LOCALHOST,
        accessKey: envs.ACCESS_KEY,
        // logging
        // 是否显示 Debug 信息，取值 'true' 'false' 'some_string' ，取值为 'true' 时永久显示，取值为 'false' 时永远隐藏，取值为 'some_string' 时请求带上 '?debug=some_string' 显示
        debugInfo: envs.DEBUG_INFO || 'true',
        loggerLevel: envs.LOGGER_LEVEL || 'info',
        noLogfiles: envs.NO_LOGFILES,
        sentry: {
            dsn: envs.SENTRY,
            routeTimeout: parseInt(envs.SENTRY_ROUTE_TIMEOUT) || 30000,
        },
        // feed config
        hotlink: {
            template: envs.HOTLINK_TEMPLATE,
            includePaths: envs.HOTLINK_INCLUDE_PATHS && envs.HOTLINK_INCLUDE_PATHS.split(','),
            excludePaths: envs.HOTLINK_EXCLUDE_PATHS && envs.HOTLINK_EXCLUDE_PATHS.split(','),
        },
        feature: {
            allow_user_hotlink_template: envs.ALLOW_USER_HOTLINK_TEMPLATE === 'true',
            filter_regex_engine: envs.FILTER_REGEX_ENGINE || 're2',
        },
        suffix: envs.SUFFIX,
        titleLengthLimit: parseInt(envs.TITLE_LENGTH_LIMIT) || 150,

        // Route-specific Configurations
        bilibili: {
            cookies: bilibili_cookies,
        },
        bitbucket: {
            username: envs.BITBUCKET_USERNAME,
            password: envs.BITBUCKET_PASSWORD,
        },
        btbyr: {
            host: envs.BTBYR_HOST,
            cookies: envs.BTBYR_COOKIE,
        },
        bupt: {
            portal_cookie: envs.BUPT_PORTAL_COOKIE,
        },
        chuiniu: {
            member: envs.CHUINIU_MEMBER,
        },
        dida365: {
            username: envs.DIDA365_USERNAME,
            password: envs.DIDA365_PASSWORD,
        },
        discuz: {
            cookies: discuz_cookies,
        },
        disqus: {
            api_key: envs.DISQUS_API_KEY,
        },
        douban: {
            cookie: envs.DOUBAN_COOKIE,
        },
        ehentai: {
            ipb_member_id: envs.EH_IPB_MEMBER_ID,
            ipb_pass_hash: envs.EH_IPB_PASS_HASH,
            sk: envs.EH_SK,
            igneous: envs.EH_IGNEOUS,
            img_proxy: envs.EH_IMG_PROXY,
        },
        email: {
            config: email_config,
        },
        fanbox: {
            session: envs.FANBOX_SESSION_ID,
        },
        fanfou: {
            consumer_key: envs.FANFOU_CONSUMER_KEY,
            consumer_secret: envs.FANFOU_CONSUMER_SECRET,
            username: envs.FANFOU_USERNAME,
            password: envs.FANFOU_PASSWORD,
        },
        game4399: {
            cookie: envs.GAME_4399,
        },
        github: {
            access_token: envs.GITHUB_ACCESS_TOKEN,
        },
        gitee: {
            access_token: envs.GITEE_ACCESS_TOKEN,
        },
        google: {
            fontsApiKey: envs.GOOGLE_FONTS_API_KEY,
        },
        hefeng: {
            // weather
            key: envs.HEFENG_KEY,
        },
        infzm: {
            cookie: envs.INFZM_COOKIE,
        },
        initium: {
            username: envs.INITIUM_USERNAME,
            password: envs.INITIUM_PASSWORD,
            bearertoken: envs.INITIUM_BEARER_TOKEN,
            iap_receipt: envs.INITIUM_IAP_RECEIPT,
        },
        instagram: {
            username: envs.IG_USERNAME,
            password: envs.IG_PASSWORD,
            proxy: envs.IG_PROXY,
        },
        lastfm: {
            api_key: envs.LASTFM_API_KEY,
        },
        mastodon: {
            apiHost: envs.MASTODON_API_HOST,
            accessToken: envs.MASTODON_API_ACCESS_TOKEN,
            acctDomain: envs.MASTODON_API_ACCT_DOMAIN,
        },
        miniflux: {
            instance: envs.MINIFLUX_INSTANCE || 'https://reader.miniflux.app',
            token: envs.MINIFLUX_TOKEN || '',
        },
        ncm: {
            cookies: envs.NCM_COOKIES || '',
        },
        newrank: {
            cookie: envs.NEWRANK_COOKIE,
        },
        nga: {
            uid: envs.NGA_PASSPORT_UID,
            cid: envs.NGA_PASSPORT_CID,
        },
        nhentai: {
            username: envs.NHENTAI_USERNAME,
            password: envs.NHENTAI_PASSWORD,
        },
        pianyuan: {
            cookie: envs.PIANYUAN_COOKIE,
        },
        pixiv: {
            refreshToken: envs.PIXIV_REFRESHTOKEN,
            bypassCdn: envs.PIXIV_BYPASS_CDN !== '0' && envs.PIXIV_BYPASS_CDN !== 'false',
            bypassCdnHostname: envs.PIXIV_BYPASS_HOSTNAME || 'public-api.secure.pixiv.net',
            bypassCdnDoh: envs.PIXIV_BYPASS_DOH || 'https://1.1.1.1/dns-query',
            imgProxy: envs.PIXIV_IMG_PROXY || 'https://i.pixiv.cat',
        },
        pkubbs: {
            cookie: envs.PKUBBS_COOKIE,
        },
        scboy: {
            token: envs.SCBOY_BBS_TOKEN,
        },
        scihub: {
            host: envs.SCIHUB_HOST || 'https://sci-hub.se/',
        },
        spotify: {
            clientId: envs.SPOTIFY_CLIENT_ID,
            clientSecret: envs.SPOTIFY_CLIENT_SECRET,
            refreshToken: envs.SPOTIFY_REFRESHTOKEN,
        },
        telegram: {
            token: envs.TELEGRAM_TOKEN,
        },
        twitter: {
            consumer_key: envs.TWITTER_CONSUMER_KEY,
            consumer_secret: envs.TWITTER_CONSUMER_SECRET,
            tokens: twitter_tokens,
            authorization: envs.TWITTER_WEBAPI_AUTHORIZAION || 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
            // 此处硬编码参考自https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py#L550
        },
        weibo: {
            app_key: envs.WEIBO_APP_KEY,
            app_secret: envs.WEIBO_APP_SECRET,
            redirect_url: envs.WEIBO_REDIRECT_URL,
        },
        wenku8: {
            cookie: envs.WENKU8_COOKIE,
        },
        wordpress: {
            cdnUrl: envs.WORDPRESS_CDN,
        },
        xiaoyuzhou: {
            device_id: envs.XIAOYUZHOU_ID,
            refresh_token: envs.XIAOYUZHOU_TOKEN,
        },
        ximalaya: {
            token: envs.XIMALAYA_TOKEN,
        },
        youtube: {
            key: envs.YOUTUBE_KEY,
            clientId: envs.YOUTUBE_CLIENT_ID,
            clientSecret: envs.YOUTUBE_CLIENT_SECRET,
            refreshToken: envs.YOUTUBE_REFRESH_TOKEN,
        },
        yuque: {
            token: envs.YUQUE_TOKEN,
        },
        zhihu: {
            cookies: envs.ZHIHU_COOKIES,
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

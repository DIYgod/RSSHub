import randUserAgent from '@/utils/rand-user-agent';
import 'dotenv/config';
import { ofetch } from 'ofetch';

let envs = process.env;

export type Config = {
    // app config
    disallowRobot: boolean;
    enableCluster?: string;
    isPackage: boolean;
    nodeName?: string;
    puppeteerWSEndpoint?: string;
    chromiumExecutablePath?: string;
    // network
    connect: {
        port: number;
    };
    listenInaddrAny: boolean;
    requestRetry: number;
    requestTimeout: number;
    ua: string;
    trueUA: string;
    allowOrigin?: string;
    // cache
    cache: {
        type: string;
        requestTimeout: number;
        routeExpire: number;
        contentExpire: number;
    };
    memory: {
        max: number;
    };
    redis: {
        url: string;
    };
    // proxy
    proxyUri?: string;
    proxyUris?: string[];
    proxy: {
        protocol?: string;
        host?: string;
        port?: string;
        auth?: string;
        url_regex: string;
        strategy: 'on_retry' | 'all';
        failoverTimeout?: number;
        healthCheckInterval?: number;
    };
    pacUri?: string;
    pacScript?: string;
    // access control
    accessKey?: string;
    // logging
    debugInfo: string;
    loggerLevel: string;
    noLogfiles?: boolean;
    otel: {
        seconds_bucket?: string;
        milliseconds_bucket?: string;
    };
    showLoggerTimestamp?: boolean;
    sentry: {
        dsn?: string;
        routeTimeout: number;
    };
    enableRemoteDebugging?: boolean;
    // feed config
    hotlink: {
        template?: string;
        includePaths?: string[];
        excludePaths?: string[];
    };
    feature: {
        allow_user_hotlink_template: boolean;
        filter_regex_engine: string;
        allow_user_supply_unsafe_domain: boolean;
        disable_nsfw: boolean;
    };
    suffix?: string;
    titleLengthLimit: number;
    openai: {
        apiKey?: string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
        endpoint: string;
        inputOption: string;
        promptTitle: string;
        promptDescription: string;
    };
    follow: {
        ownerUserId?: string;
        description?: string;
        price?: number;
        userLimit?: number;
    };

    // Route-specific Configurations
    bilibili: {
        cookies: Record<string, string | undefined>;
        dmImgList?: string;
        dmImgInter?: string;
    };
    bitbucket: {
        username?: string;
        password?: string;
    };
    btbyr: {
        host?: string;
        cookies?: string;
    };
    bupt: {
        portal_cookie?: string;
    };
    caixin: {
        cookie?: string;
    };
    civitai: {
        cookie?: string;
    };
    dianping: {
        cookie?: string;
    };
    dida365: {
        username?: string;
        password?: string;
    };
    discord: {
        authorization?: string;
    };
    discourse: {
        config: Record<string, string | undefined>;
    };
    discuz: {
        cookies: Record<string, string | undefined>;
    };
    disqus: {
        api_key?: string;
    };
    douban: {
        cookie?: string;
    };
    ehentai: {
        ipb_member_id?: string;
        ipb_pass_hash?: string;
        sk?: string;
        igneous?: string;
        star?: string;
        img_proxy?: string;
    };
    email: {
        config: Record<string, string | undefined>;
    };
    fanbox: {
        session?: string;
    };
    fanfou: {
        consumer_key?: string;
        consumer_secret?: string;
        username?: string;
        password?: string;
    };
    fantia: {
        cookies?: string;
    };
    game4399: {
        cookie?: string;
    };
    gelbooru: {
        apiKey?: string;
        userId?: string;
    };
    github: {
        access_token?: string;
    };
    gitee: {
        access_token?: string;
    };
    google: {
        fontsApiKey?: string;
    };
    guozaoke: {
        cookies?: string;
    };
    hefeng: {
        key?: string;
    };
    infzm: {
        cookie?: string;
    };
    initium: {
        username?: string;
        password?: string;
        bearertoken?: string;
    };
    instagram: {
        username?: string;
        password?: string;
        proxy?: string;
        cookie?: string;
    };
    iwara: {
        username?: string;
        password?: string;
    };
    javdb: {
        session?: string;
    };
    jumeili: {
        cookie?: string;
    };
    keylol: {
        cookie?: string;
    };
    lastfm: {
        api_key?: string;
    };
    lightnovel: {
        cookie?: string;
    };
    lorientlejour: {
        token?: string;
        username?: string;
        password?: string;
    };
    malaysiakini: {
        email?: string;
        password?: string;
        refreshToken?: string;
    };
    mangadex: {
        username?: string;
        password?: string;
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
    };
    manhuagui: {
        cookie?: string;
    };
    mastodon: {
        apiHost?: string;
        accessToken?: string;
        acctDomain?: string;
    };
    medium: {
        cookies: Record<string, string | undefined>;
        articleCookie?: string;
    };
    mihoyo: {
        cookie?: string;
    };
    miniflux: {
        instance?: string;
        token?: string;
    };
    misskey: {
        accessToken?: string;
    };
    mixi2: {
        authToken?: string;
        authKey?: string;
    };
    mox: {
        cookie: string;
    };
    ncm: {
        cookies?: string;
    };
    newrank: {
        cookie?: string;
    };
    nga: {
        uid?: string;
        cid?: string;
    };
    nhentai: {
        username?: string;
        password?: string;
    };
    notion: {
        key?: string;
    };
    patreon: {
        sessionId?: string;
    };
    pianyuan: {
        cookie?: string;
    };
    pixabay: {
        key?: string;
    };
    pixiv: {
        refreshToken?: string;
        bypassCdn?: boolean;
        bypassCdnHostname?: string;
        bypassCdnDoh?: string;
        imgProxy?: string;
    };
    pkubbs: {
        cookie?: string;
    };
    qingting: {
        id?: string;
    };
    readwise: {
        accessToken?: string;
    };
    saraba1st: {
        cookie?: string;
        host?: string;
    };
    sehuatang: {
        cookie?: string;
    };
    scboy: {
        token?: string;
    };
    scihub: {
        host?: string;
    };
    sis001: {
        baseUrl?: string;
    };
    skeb: {
        bearerToken?: string;
    };
    sorrycc: {
        cookie?: string;
    };
    spotify: {
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
    };
    sspai: {
        bearertoken?: string;
    };
    telegram: {
        token?: string;
        session?: string;
        apiId?: number;
        apiHash?: string;
        maxConcurrentDownloads?: number;
        proxy?: {
            host?: string;
            port?: number;
            secret?: string;
        };
    };
    tophub: {
        cookie?: string;
    };
    tsdm39: {
        cookie: string;
    };
    twitter: {
        username?: string[];
        password?: string[];
        authenticationSecret?: string[];
        phoneOrEmail?: string[];
        authToken?: string[];
        thirdPartyApi?: string;
    };
    uestc: {
        bbsCookie?: string;
        bbsAuthStr?: string;
    };
    weibo: {
        app_key?: string;
        app_secret?: string;
        cookies?: string;
        redirect_url?: string;
    };
    wenku8: {
        cookie?: string;
    };
    wordpress: {
        cdnUrl?: string;
    };
    xiaoyuzhou: {
        device_id?: string;
        refresh_token?: string;
    };
    xiaohongshu: {
        cookie?: string;
    };
    ximalaya: {
        token?: string;
    };
    xsijishe: {
        cookie?: string;
        userAgent?: string;
    };
    xueqiu: {
        cookies?: string;
    };
    yamibo: {
        salt?: string;
        auth?: string;
    };
    youtube: {
        key?: string;
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
    };
    zhihu: {
        cookies?: string;
    };
    zodgame: {
        cookie?: string;
    };
    zsxq: {
        accessToken?: string;
    };
    smzdm: {
        cookie?: string;
    };
};

const value: Config | Record<string, any> = {};

const TRUE_UA = 'RSSHub/1.0 (+http://github.com/DIYgod/RSSHub; like FeedFetcher-Google)';

const toBoolean = (value: string | undefined, defaultValue: boolean) => {
    if (value === undefined) {
        return defaultValue;
    } else {
        return value === '' || value === '0' || value === 'false' ? false : !!value;
    }
};

const toInt = (value: string | undefined, defaultValue?: number) => (value === undefined ? defaultValue : Number.parseInt(value));

const calculateValue = () => {
    const bilibili_cookies: Record<string, string | undefined> = {};
    const email_config: Record<string, string | undefined> = {};
    const discuz_cookies: Record<string, string | undefined> = {};
    const medium_cookies: Record<string, string | undefined> = {};
    const discourse_config: Record<string, string | undefined> = {};

    for (const name in envs) {
        if (name.startsWith('BILIBILI_COOKIE_')) {
            const uid = name.slice(16);
            bilibili_cookies[uid] = envs[name];
        } else if (name.startsWith('EMAIL_CONFIG_')) {
            const id = name.slice(13);
            email_config[id] = envs[name];
        } else if (name.startsWith('DISCUZ_COOKIE_')) {
            const cid = name.slice(14);
            discuz_cookies[cid] = envs[name];
        } else if (name.startsWith('MEDIUM_COOKIE_')) {
            const username = name.slice(14).toLowerCase();
            medium_cookies[username] = envs[name];
        } else if (name.startsWith('DISCOURSE_CONFIG_')) {
            const id = name.slice('DISCOURSE_CONFIG_'.length);
            discourse_config[id] = JSON.parse(envs[name] || '{}');
        }
    }

    const _value = {
        // app config
        disallowRobot: toBoolean(envs.DISALLOW_ROBOT, false),
        enableCluster: toBoolean(envs.ENABLE_CLUSTER, false),
        isPackage: !!envs.IS_PACKAGE,
        nodeName: envs.NODE_NAME,
        puppeteerWSEndpoint: envs.PUPPETEER_WS_ENDPOINT,
        chromiumExecutablePath: envs.CHROMIUM_EXECUTABLE_PATH,
        // network
        connect: {
            port: toInt(envs.PORT, 1200), // 监听端口
        },
        listenInaddrAny: toBoolean(envs.LISTEN_INADDR_ANY, true), // 是否允许公网连接，取值 0 1
        requestRetry: toInt(envs.REQUEST_RETRY, 2), // 请求失败重试次数
        requestTimeout: toInt(envs.REQUEST_TIMEOUT, 30000), // Milliseconds to wait for the server to end the response before aborting the request
        ua: envs.UA ?? (toBoolean(envs.NO_RANDOM_UA, false) ? TRUE_UA : randUserAgent({ browser: 'chrome', os: 'mac os', device: 'desktop' })),
        trueUA: TRUE_UA,
        allowOrigin: envs.ALLOW_ORIGIN,
        // cache
        cache: {
            type: envs.CACHE_TYPE || (envs.CACHE_TYPE === '' ? '' : 'memory'), // 缓存类型，支持 'memory' 和 'redis'，设为空可以禁止缓存
            requestTimeout: toInt(envs.CACHE_REQUEST_TIMEOUT, 60),
            routeExpire: toInt(envs.CACHE_EXPIRE, 5 * 60), // 路由缓存时间，单位为秒
            contentExpire: toInt(envs.CACHE_CONTENT_EXPIRE, 1 * 60 * 60), // 不变内容缓存时间，单位为秒
        },
        memory: {
            max: toInt(envs.MEMORY_MAX, Math.pow(2, 8)), // The maximum number of items that remain in the cache. This must be a positive finite intger.
            // https://github.com/isaacs/node-lru-cache#options
        },
        redis: {
            url: envs.REDIS_URL || 'redis://localhost:6379/',
        },
        // proxy
        proxyUri: envs.PROXY_URI,
        proxyUris: envs.PROXY_URIS
            ? envs.PROXY_URIS.split(',')
                  .map((uri) => uri.trim())
                  .filter(Boolean)
            : undefined,
        proxy: {
            protocol: envs.PROXY_PROTOCOL,
            host: envs.PROXY_HOST,
            port: envs.PROXY_PORT,
            auth: envs.PROXY_AUTH,
            url_regex: envs.PROXY_URL_REGEX || '.*',
            strategy: envs.PROXY_STRATEGY || 'all', // all / on_retry
            failoverTimeout: toInt(envs.PROXY_FAILOVER_TIMEOUT, 5000),
            healthCheckInterval: toInt(envs.PROXY_HEALTH_CHECK_INTERVAL, 60000),
        },
        pacUri: envs.PAC_URI,
        pacScript: envs.PAC_SCRIPT,
        // access control
        accessKey: envs.ACCESS_KEY,
        // logging
        // 是否显示 Debug 信息，取值 'true' 'false' 'some_string' ，取值为 'true' 时永久显示，取值为 'false' 时永远隐藏，取值为 'some_string' 时请求带上 '?debug=some_string' 显示
        debugInfo: envs.DEBUG_INFO || 'true',
        loggerLevel: envs.LOGGER_LEVEL || 'info',
        noLogfiles: toBoolean(envs.NO_LOGFILES, false),
        otel: {
            seconds_bucket: envs.OTEL_SECONDS_BUCKET || '0.01,0.1,1,2,5,15,30,60',
            milliseconds_bucket: envs.OTEL_MILLISECONDS_BUCKET || '10,20,50,100,250,500,1000,5000,15000',
        },
        showLoggerTimestamp: toBoolean(envs.SHOW_LOGGER_TIMESTAMP, false),
        sentry: {
            dsn: envs.SENTRY,
            routeTimeout: toInt(envs.SENTRY_ROUTE_TIMEOUT, 30000),
        },
        enableRemoteDebugging: toBoolean(envs.ENABLE_REMOTE_DEBUGGING, false),
        // feed config
        hotlink: {
            template: envs.HOTLINK_TEMPLATE,
            includePaths: envs.HOTLINK_INCLUDE_PATHS ? envs.HOTLINK_INCLUDE_PATHS.split(',') : undefined,
            excludePaths: envs.HOTLINK_EXCLUDE_PATHS ? envs.HOTLINK_EXCLUDE_PATHS.split(',') : undefined,
        },
        feature: {
            allow_user_hotlink_template: toBoolean(envs.ALLOW_USER_HOTLINK_TEMPLATE, false),
            filter_regex_engine: envs.FILTER_REGEX_ENGINE || 're2',
            allow_user_supply_unsafe_domain: toBoolean(envs.ALLOW_USER_SUPPLY_UNSAFE_DOMAIN, false),
            disable_nsfw: toBoolean(envs.DISABLE_NSFW, false),
        },
        suffix: envs.SUFFIX,
        titleLengthLimit: toInt(envs.TITLE_LENGTH_LIMIT, 150),
        openai: {
            apiKey: envs.OPENAI_API_KEY,
            model: envs.OPENAI_MODEL || 'gpt-3.5-turbo-16k',
            temperature: toInt(envs.OPENAI_TEMPERATURE, 0.2),
            maxTokens: toInt(envs.OPENAI_MAX_TOKENS, 0) || undefined,
            endpoint: envs.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1',
            inputOption: envs.OPENAI_INPUT_OPTION || 'description',
            promptDescription: envs.OPENAI_PROMPT || 'Please summarize the following article and reply with markdown format.',
            promptTitle: envs.OPENAI_PROMPT_TITLE || 'Please translate the following title into Simplified Chinese and reply only translated text.',
        },
        follow: {
            ownerUserId: envs.FOLLOW_OWNER_USER_ID,
            description: envs.FOLLOW_DESCRIPTION,
            price: toInt(envs.FOLLOW_PRICE),
            userLimit: toInt(envs.FOLLOW_USER_LIMIT),
        },

        // Route-specific Configurations
        bilibili: {
            cookies: bilibili_cookies,
            dmImgList: envs.BILIBILI_DM_IMG_LIST,
            dmImgInter: envs.BILIBILI_DM_IMG_INTER,
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
        caixin: {
            cookie: envs.CAIXIN_COOKIE,
        },
        civitai: {
            cookie: envs.CIVITAI_COOKIE,
        },
        dianping: {
            cookie: envs.DIANPING_COOKIE,
        },
        dida365: {
            username: envs.DIDA365_USERNAME,
            password: envs.DIDA365_PASSWORD,
        },
        discord: {
            authorization: envs.DISCORD_AUTHORIZATION,
        },
        discourse: {
            config: discourse_config,
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
            star: envs.EH_STAR,
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
        fantia: {
            cookies: envs.FANTIA_COOKIE,
        },
        game4399: {
            cookie: envs.GAME_4399,
        },
        gelbooru: {
            apiKey: envs.GELBOORU_API_KEY,
            userId: envs.GELBOORU_USER_ID,
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
        guozaoke: {
            cookies: envs.GUOZAOKE_COOKIES,
        },
        hefeng: {
            key: envs.HEFENG_KEY,
        },
        infzm: {
            cookie: envs.INFZM_COOKIE,
        },
        initium: {
            username: envs.INITIUM_USERNAME,
            password: envs.INITIUM_PASSWORD,
            bearertoken: envs.INITIUM_BEARER_TOKEN,
        },
        instagram: {
            username: envs.IG_USERNAME,
            password: envs.IG_PASSWORD,
            proxy: envs.IG_PROXY,
            cookie: envs.IG_COOKIE,
        },
        iwara: {
            username: envs.IWARA_USERNAME,
            password: envs.IWARA_PASSWORD,
        },
        javdb: {
            session: envs.JAVDB_SESSION,
        },
        jumeili: {
            cookie: envs.JUMEILI_COOKIE,
        },
        keylol: {
            cookie: envs.KEYLOL_COOKIE,
        },
        lastfm: {
            api_key: envs.LASTFM_API_KEY,
        },
        lightnovel: {
            cookie: envs.SECURITY_KEY,
        },
        lorientlejour: {
            token: envs.LORIENTLEJOUR_TOKEN,
            username: envs.LORIENTLEJOUR_USERNAME,
            password: envs.LORIENTLEJOUR_PASSWORD,
        },
        malaysiakini: {
            email: envs.MALAYSIAKINI_EMAIL,
            password: envs.MALAYSIAKINI_PASSWORD,
            refreshToken: envs.MALAYSIAKINI_REFRESHTOKEN,
        },
        mangadex: {
            username: envs.MANGADEX_USERNAME, // required when refresh-token is not set
            password: envs.MANGADEX_PASSWORD, // required when refresh-token is not set
            clientId: envs.MANGADEX_CLIENT_ID,
            clientSecret: envs.MANGADEX_CLIENT_SECRET,
            refreshToken: envs.MANGADEX_REFRESH_TOKEN,
        },
        manhuagui: {
            cookie: envs.MHGUI_COOKIE,
        },
        mastodon: {
            apiHost: envs.MASTODON_API_HOST,
            accessToken: envs.MASTODON_API_ACCESS_TOKEN,
            acctDomain: envs.MASTODON_API_ACCT_DOMAIN,
        },
        medium: {
            cookies: medium_cookies,
            articleCookie: envs.MEDIUM_ARTICLE_COOKIE || '',
        },
        mihoyo: {
            cookie: envs.MIHOYO_COOKIE,
        },
        miniflux: {
            instance: envs.MINIFLUX_INSTANCE || 'https://reader.miniflux.app',
            token: envs.MINIFLUX_TOKEN || '',
        },
        misskey: {
            accessToken: envs.MISSKEY_ACCESS_TOKEN,
        },
        mixi2: {
            authToken: envs.MIXI2_AUTH_TOKEN,
            authKey: envs.MIXI2_AUTH_KEY,
        },
        mox: {
            cookie: envs.MOX_COOKIE,
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
        notion: {
            key: envs.NOTION_TOKEN,
        },
        patreon: {
            sessionId: envs.PATREON_SESSION_ID,
        },
        pianyuan: {
            cookie: envs.PIANYUAN_COOKIE,
        },
        pixabay: {
            key: envs.PIXABAY_KEY,
        },
        pixiv: {
            refreshToken: envs.PIXIV_REFRESHTOKEN,
            bypassCdn: toBoolean(envs.PIXIV_BYPASS_CDN, false),
            bypassCdnHostname: envs.PIXIV_BYPASS_HOSTNAME || 'public-api.secure.pixiv.net',
            bypassCdnDoh: envs.PIXIV_BYPASS_DOH || 'https://1.1.1.1/dns-query',
            imgProxy: envs.PIXIV_IMG_PROXY || 'https://i.pixiv.re',
        },
        pkubbs: {
            cookie: envs.PKUBBS_COOKIE,
        },
        qingting: {
            id: envs.QINGTING_ID,
        },
        readwise: {
            accessToken: envs.READWISE_ACCESS_TOKEN,
        },
        saraba1st: {
            cookie: envs.SARABA1ST_COOKIE,
            host: envs.SARABA1ST_HOST || 'https://stage1st.com',
        },
        sehuatang: {
            cookie: envs.SEHUATANG_COOKIE,
        },
        scboy: {
            token: envs.SCBOY_BBS_TOKEN,
        },
        scihub: {
            host: envs.SCIHUB_HOST || 'https://sci-hub.se/',
        },
        sis001: {
            baseUrl: envs.SIS001_BASE_URL || 'https://sis001.com',
        },
        skeb: {
            bearerToken: envs.SKEB_BEARER_TOKEN,
        },
        sorrycc: {
            cookie: envs.SORRYCC_COOKIES,
        },
        spotify: {
            clientId: envs.SPOTIFY_CLIENT_ID,
            clientSecret: envs.SPOTIFY_CLIENT_SECRET,
            refreshToken: envs.SPOTIFY_REFRESHTOKEN,
        },
        sspai: {
            bearertoken: envs.SSPAI_BEARERTOKEN,
        },
        telegram: {
            token: envs.TELEGRAM_TOKEN,
            session: envs.TELEGRAM_SESSION,
            apiId: envs.TELEGRAM_API_ID,
            apiHash: envs.TELEGRAM_API_HASH,
            maxConcurrentDownloads: envs.TELEGRAM_MAX_CONCURRENT_DOWNLOADS,
            proxy: {
                host: envs.TELEGRAM_PROXY_HOST,
                port: envs.TELEGRAM_PROXY_PORT,
                secret: envs.TELEGRAM_PROXY_SECRET,
            },
        },
        tophub: {
            cookie: envs.TOPHUB_COOKIE,
        },
        tsdm39: {
            cookie: envs.TSDM39_COOKIES,
        },
        twitter: {
            username: envs.TWITTER_USERNAME?.split(','),
            password: envs.TWITTER_PASSWORD?.split(','),
            authenticationSecret: envs.TWITTER_AUTHENTICATION_SECRET?.split(','),
            phoneOrEmail: envs.TWITTER_PHONE_OR_EMAIL?.split(','),
            authToken: envs.TWITTER_AUTH_TOKEN?.split(','),
            thirdPartyApi: envs.TWITTER_THIRD_PARTY_API,
        },
        uestc: {
            bbsCookie: envs.UESTC_BBS_COOKIE,
            bbsAuthStr: envs.UESTC_BBS_AUTH_STR,
        },
        weibo: {
            app_key: envs.WEIBO_APP_KEY,
            app_secret: envs.WEIBO_APP_SECRET,
            cookies: envs.WEIBO_COOKIES,
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
        xiaohongshu: {
            cookie: envs.XIAOHONGSHU_COOKIE,
        },
        ximalaya: {
            token: envs.XIMALAYA_TOKEN,
        },
        xsijishe: {
            cookie: envs.XSIJISHE_COOKIE,
            user_agent: envs.XSIJISHE_USER_AGENT,
        },
        xueqiu: {
            cookies: envs.XUEQIU_COOKIES,
        },
        yamibo: {
            salt: envs.YAMIBO_SALT,
            auth: envs.YAMIBO_AUTH,
        },
        youtube: {
            key: envs.YOUTUBE_KEY,
            clientId: envs.YOUTUBE_CLIENT_ID,
            clientSecret: envs.YOUTUBE_CLIENT_SECRET,
            refreshToken: envs.YOUTUBE_REFRESH_TOKEN,
        },
        zhihu: {
            cookies: envs.ZHIHU_COOKIES,
        },
        zodgame: {
            cookie: envs.ZODGAME_COOKIE,
        },
        zsxq: {
            accessToken: envs.ZSXQ_ACCESS_TOKEN,
        },
        smzdm: {
            cookie: envs.SMZDM_COOKIE,
        },
    };

    for (const name in _value) {
        value[name] = _value[name];
    }
};
calculateValue();

(async () => {
    if (envs.REMOTE_CONFIG) {
        const { default: logger } = await import('@/utils/logger');
        try {
            const data = await ofetch(envs.REMOTE_CONFIG, {
                headers: {
                    Authorization: `Basic ${envs.REMOTE_CONFIG_AUTH}`,
                },
            });
            if (data) {
                envs = Object.assign(envs, data);
                calculateValue();
                logger.info('Remote config loaded.');
            } else {
                logger.error('Remote config load failed.');
            }
        } catch (error) {
            logger.error('Remote config load failed.', error);
        }
    }
})();

// @ts-expect-error value is set
export const config: Config = value;

export const setConfig = (env: Record<string, any>) => {
    envs = Object.assign(process.env, env);
    calculateValue();
};

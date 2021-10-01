import dotenv from 'dotenv';
dotenv.config();


export function calculateValue(envs) {
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

    return {
        suffix: envs.SUFFIX,
        pixiv: {
            refreshToken: envs.PIXIV_REFRESHTOKEN,
            bypassCdn: envs.PIXIV_BYPASS_CDN !== '0' && envs.PIXIV_BYPASS_CDN !== 'false',
            bypassCdnHostname: envs.PIXIV_BYPASS_HOSTNAME || 'public-api.secure.pixiv.net',
            bypassCdnDoh: envs.PIXIV_BYPASS_DOH || 'https://1.1.1.1/dns-query',
        },
        fanbox: {
            session: envs.FANBOX_SESSION_ID,
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
        zhihu: {
            cookies: envs.ZHIHU_COOKIES,
        },
        puppeteerWSEndpoint: envs.PUPPETEER_WS_ENDPOINT,
        loggerLevel: envs.LOGGER_LEVEL || 'info',
        proxyUri: envs.PROXY_URI,
        proxy: {
            protocol: envs.PROXY_PROTOCOL,
            host: envs.PROXY_HOST,
            port: envs.PROXY_PORT,
            auth: envs.PROXY_AUTH,
            url_regex: envs.PROXY_URL_REGEX || '.*',
        },
        allowOrigin: envs.ALLOW_ORIGIN,
        blacklist: envs.BLACKLIST && envs.BLACKLIST.split(','),
        whitelist: envs.WHITELIST && envs.WHITELIST.split(','),
        allowLocalhost: envs.ALLOW_LOCALHOST,
        accessKey: envs.ACCESS_KEY,
        enableCluster: envs.ENABLE_CLUSTER,
        email: {
            config: email_config,
        },
        sentry: {
            dsn: envs.SENTRY,
            routeTimeout: parseInt(envs.SENTRY_ROUTE_TIMEOUT) || 30000,
        },
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
        bupt: {
            portal_cookie: envs.BUPT_PORTAL_COOKIE,
        },
        nhentai: {
            username: envs.NHENTAI_USERNAME,
            password: envs.NHENTAI_PASSWORD,
        },
        discuz: {
            cookies: discuz_cookies,
        },
        scihub: {
            host: envs.SCIHUB_HOST || 'https://sci-hub.se/',
        },
        hotlink: {
            template: envs.HOTLINK_TEMPLATE,
        },
        initium: {
            username: envs.INITIUM_USERNAME,
            password: envs.INITIUM_PASSWORD,
            bearertoken: envs.INITIUM_BEARER_TOKEN,
            iap_receipt: envs.INITIUM_IAP_RECEIPT,
        },
        btbyr: {
            host: envs.BTBYR_HOST,
            cookies: envs.BTBYR_COOKIE,
        },
        mastodon: {
            apiHost: envs.MASTODON_API_HOST,
            accessToken: envs.MASTODON_API_ACCESS_TOKEN,
            acctDomain: envs.MASTODON_API_ACCT_DOMAIN,
        },
        xiaoyuzhou: {
            device_id: envs.XIAOYUZHOU_ID,
            refresh_token: envs.XIAOYUZHOU_TOKEN,
        },
        miniflux: {
            instance: envs.MINIFLUX_INSTANCE || 'https://reader.miniflux.app',
            token: envs.MINIFLUX_TOKEN || '',
        },
        nga: {
            uid: envs.NGA_PASSPORT_UID,
            cid: envs.NGA_PASSPORT_CID,
        },
        newrank: {
            cookie: envs.NEWRANK_COOKIE,
        },
        ximalaya: {
            token: envs.XIMALAYA_TOKEN,
        },
        game4399: {
            cookie: envs.GAME_4399,
        },
        dida365: {
            username: envs.DIDA365_USERNAME,
            password: envs.DIDA365_PASSWORD,
        },
        scboy: {
            token: envs.SCBOY_BBS_TOKEN,
        },
        wordpress: {
            cdnUrl: envs.WORDPRESS_CDN,
        },
        ehentai: {
            ipb_member_id: envs.EH_IPB_MEMBER_ID,
            ipb_pass_hash: envs.EH_IPB_PASS_HASH,
            sk: envs.EH_SK,
        },
    };
};


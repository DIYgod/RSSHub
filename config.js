module.exports = {
    port: process.env.PORT || 1200,
    cacheType: process.env.CACHE_TYPE || 'memory', // support memory and redis, set empty to disable cache
    cacheExpire: process.env.CACHE_EXPIRE || 5 * 60,
    ua: process.env.UA || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379/',
        options: {                                 // 支持这些参数 https://github.com/NodeRedis/node_redis#options-object-properties
            password: process.env.REDIS_PASSWORD || null,
        }
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
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    },
    youtube: {
        key: process.env.YOUTUBE_KEY
    }
};

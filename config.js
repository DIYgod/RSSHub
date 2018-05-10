module.exports = {
    port: 1200,
    cacheType: 'memory',      // support memory and redis, set empty to disable cache
    cacheExpire: 5 * 60,
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
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
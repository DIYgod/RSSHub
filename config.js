module.exports = {
    port: 1200,
    cacheType: 'memory',      // support memory and redis, set empty to disable cache
    cacheExpire: 5 * 60,
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    pixiv: {
        client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
        client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
        username: 'rsshub@tmpmail.org',
        password: 'rsshubpixiv'
    },
    github_token: '', // your github personal access token
};

const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const logger = require('@/utils/logger');
const cheerio = require('cheerio');
const config = require('@/config').value;

// 方法为封装后的，便于使用。
function setCookie(token) {
    const cookie = {
        domain: 'www.lightnovel.us',
        expirationDate: 1703689372,
        hostOnly: true,
        httpOnly: false,
        name: 'token',
        path: '/',
        sameSite: 'unspecified',
        secure: false,
        session: false,
        storeId: '0',
        value: token,
    };
    return cookie;
}

module.exports = async (ctx) => {
    const baseUrl = 'https://www.lightnovel.us';
    const { type, keywords, security_key = config.lightNovel.cookie } = ctx.params;
    const { data: response } = await got({
        method: 'POST',
        url: `${baseUrl}/proxy/api/search/search-result`,
        headers: {
            // 此处是为什么
            'User-Agent': config.trueUA,
        },
        json: {
            is_encrypted: 0,
            platform: 'pc',
            client: 'web',
            sign: '',
            gz: 0,
            d: {
                q: keywords,
                type: 0,
                page: 1,
                security_key,
            },
        },
    });
    const list = response.data.articles
        ?.map((item) => ({
            title: item.title,
            link: `${baseUrl}/cn/detail/${item.aid}`,
            pubDate: parseDate(item.time),
            author: item.author,
        }))
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 5);

    const browser = await require('@/utils/puppeteer')();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.setCookie(setCookie(`{"security_key":"${security_key}"}`));
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                page.close();
                const $ = cheerio.load(response);
                item.description = $('#article-main-contents').html();
                return item;
            })
        )
    );
    browser.close();

    ctx.state.data = {
        title: `轻之国度-追踪${keywords}更新-${type} `,
        link: baseUrl,
        item: items,
    };
};

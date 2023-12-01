const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const logger = require('@/utils/logger');
const cheerio = require('cheerio');

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
    const { type, security_key, keywords } = ctx.params;
    const { data: response } = await got({
        method: 'POST',
        url: `${baseUrl}/proxy/api/search/search-result`,
        headers: {
            'Content-Type': 'application/json',
            // 此处是为什么
            'User-Agent': 'Node/12.14.1',
        },
        data: JSON.stringify({
            is_encrypted: 0,
            platform: `pc`,
            client: `web`,
            sign: ``,
            gz: 0,
            d: {
                q: keywords,
                type: 0,
                page: 1,
                security_key: String(security_key),
            },
        }),
    });
    const list = [];
    for (const key in response.data) {
        if (key === type && type === 'articles') {
            list.values = response.data[key].slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 2).map((item) => ({
                title: item.title,
                link: `${baseUrl}/cn/detail/${item.aid}`,
                pubDate: parseDate(item.time),
                author: item.author,
            }));
        } else if (key === type && type === 'collections') {
            list.values = response.data[key].map((item) => ({
                title: item.name,
                link: `${baseUrl}/cn/series/${item.sid}`,
                description: `目前只适配articles哦`,
                pubDate: parseDate(item.last_time),
                author: item.author,
            }));
        }
    }

    const browser = await require('@/utils/puppeteer')();

    const items = await Promise.all(
        list.values.map((item) =>
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

    ctx.state.data = {
        title: `轻之国度-追踪${keywords}更新-${type} `,
        link: baseUrl,
        item: items,
    };
};

const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { type = 'latest', section = 'posts' } = ctx.params;
    const limit = ctx.query.limit ? Number(ctx.query.limit) : 30;
    const browser = await require('@/utils/puppeteer')();

    let link = `https://www.dcard.tw/f`;
    let api = `https://www.dcard.tw/service/api/v2`;
    let title = `Dcard - `;

    if (section !== 'posts' && section !== 'popular' && section !== 'latest') {
        link += `/${section}`;
        api += `/forums/${section}`;
        title += `${section} - `;
    }
    api += `/posts`;
    if (type === 'popular') {
        link += '?latest=false';
        api += '?popular=true';
        title += '熱門';
    } else {
        link += '?latest=true';
        api += '?popular=false';
        title += '最新';
    }

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.setExtraHTTPHeaders({
        referer: `https://www.dcard.tw/f/${section}`,
    });

    await page.goto(`${api}&limit=100`);
    await page.waitForSelector('body > pre');
    const response = await page.evaluate(() => document.querySelector('body > pre').innerText);
    const cookies = await ctx.cache.tryGet('dcard:cookies', () => page.cookies(), 3600, false);
    await page.close();

    const data = JSON.parse(response);
    const items = data.map((item) => ({
        title: `「${item.forumName}」${item.title}`,
        link: `https://www.dcard.tw/f/${item.forumAlias}/p/${item.id}`,
        description: item.excerpt,
        author: `${item.school || '匿名'}．${item.gender === 'M' ? '男' : '女'}`,
        pubDate: parseDate(item.createdAt),
        category: [item.forumName, ...item.topics],
        forumAlias: item.forumAlias,
        id: item.id,
    }));

    // parse fulltext for first `limit` items
    const result = await utils.ProcessFeed(items, cookies, browser, limit, ctx.cache);
    await browser.close();

    ctx.state.data = {
        title,
        link,
        description: '不想錯過任何有趣的話題嗎？趕快加入我們吧！',
        item: result,
    };
};

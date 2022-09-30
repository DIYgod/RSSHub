const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('./utils');
const config = require('@/config').value;

const getInitEntry = async (url) =>
    await got(url)
        .then((_r) => _r.data)
        .catch((err) => {
            if (err.response.statusCode === 404) {
                throw new Error('This category / WeChat Official Account is not found on GZH360.');
            }
            throw err;
        });

module.exports = async (ctx, path, id, titleHeader = '', custom_title = null, skipAuthor = false, cacheInitEntry = false) => {
    const rootUrl = 'http://web.gzh360.com';
    const currentUrl = `${rootUrl}/${id ? `${path}?id=${id}` : ''}`;

    const respData = cacheInitEntry ? await ctx.cache.tryGet(currentUrl, async () => await getInitEntry(currentUrl), config.cache.routeExpire, false) : await getInitEntry(currentUrl);
    const $ = cheerio.load(respData);

    const title = id ? $('head > title').text().split(' - ', 1)[0] : '首页';

    let items = $('div.content div.news_desc')
        .map((_, item) => {
            item = $(item);
            const link = item.find('h3 > a');
            const href = link.attr('href');
            const title = link.text();
            const pubDate = item.find('span.datecss > span').attr('data-timestamp');
            let author;
            if (!skipAuthor) {
                author = item.find('span.fromcss > a').text(); // only some pages have this
            }
            return {
                link: `${href.startsWith('http') ? '' : rootUrl}${href}`,
                title,
                pubDate: parseDate(pubDate),
                author,
            };
        })
        .get();

    items = await Promise.all(items.map((item) => finishArticleItem(ctx, item, skipAuthor)));

    ctx.state.data = {
        title: `${titleHeader}${custom_title ?? title}`,
        link: currentUrl,
        item: items.filter((item) => item),
    };
};

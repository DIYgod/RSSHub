const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'china';
    const keyword = ctx.params.keyword === 'RSS' ? 'rss' : ctx.params.keyword ?? '';

    // raise error for invalid languages
    if (!['china', 'tchina'].includes(language)) {
        throw Error('Invalid language');
    }

    const rootUrl = `https://${language}.kyodonews.net`;
    const currentUrl = `${rootUrl}/${keyword ? (keyword === 'rss' ? 'rss/news.xml' : `news/${keyword}`) : ''}`;

    let response;
    try {
        response = await got(currentUrl);
    } catch (e) {
        throw e.response && e.response.statusCode === 404 ? new Error('Invalid keyword') : e;
    }

    const $ = cheerio.load(response.data, { xmlMode: keyword === 'rss' });

    let title, description, items;
    if (keyword === 'rss') {
        title = $('channel > title').text();
        description = $('channel > description').text();
        items = $('item')
            .map((_, item) => {
                const $item = $(item);
                const link = $item.find('link').text();
                // const pubDate = $item.find('pubDate').text();
                return {
                    link,
                    // pubDate,  // no need to normalize because it's from a valid RSS feed
                };
            })
            .get();
    } else {
        title = $('head > title').text();
        description = $('meta[name="description"]').attr('content');
        items = $('div.sec-latest > ul > li')
            .map((_, item) => {
                item = $(item);
                const link = item.find('a').attr('href');
                return {
                    link: `${link.startsWith('http') ? '' : rootUrl}${link}`,
                };
            })
            .get();
    }

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(detailResponse.data);
                item.title = $('head > title').text();
                item.author = $('meta[name="author"]').attr('content');
                item.description = $('div.article-body')
                    .html()
                    .replace(/（完）(?=<\/p>\s*$)/m, '');

                const pubDate_match = $('script[type="application/ld+json"]')
                    .html()
                    .match(/"datePublished":"([\d\s-:]*?)"/);
                if (pubDate_match) {
                    item.pubDate = timezone(parseDate(pubDate_match[1]), 9);
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        description,
        link: currentUrl,
        item: items,
    };
};

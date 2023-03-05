const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    let language = '';
    let path = ctx.path;

    if (!/^\/cn\/(cn|zh)/.test(path)) {
        language = 'cn';
    } else {
        language = path.match(/^\/cn\/(cn|zh)/)[1];
        path = path.match(new RegExp('\\/cn\\/' + language + '(.*)'))[1];
    }

    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 25;

    const rootUrl = `https://${language === 'zh' ? 'zh.' : ''}cn.nikkei.com`;
    const currentUrl = `${rootUrl}${path}`;
    const isOfficialRSS = path === `/rss`;
    let officialFeed;

    let items = [],
        $;

    if (isOfficialRSS) {
        officialFeed = await parser.parseURL(currentUrl);
        items = officialFeed.items.slice(0, limit).map((item) => ({
            title: item.title,
            link: `${rootUrl}/x-columnviewpoint/${item.link.match(/\/([\d-]+\.html)/)[1]}`,
        }));
    } else {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        $ = cheerio.load(response.data);

        items = $('dt a')
            .toArray()
            .map((item) => {
                item = $(item);

                return {
                    title: item.text(),
                    link: `${rootUrl}/x-columnviewpoint/${item.attr('href').match(/\/([\d-]+\.html)/)[1]}`,
                };
            })
            .reduce((prev, cur) => (prev.length && prev[prev.length - 1].link === cur.link ? prev : [...prev, cur]), [])
            .slice(0, limit);
    }

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${item.link}?print=1`,
                });

                const content = cheerio.load(detailResponse.data);

                const divs = content('#contentDiv div');
                divs.first().remove();
                divs.last().remove();

                item.pubDate = timezone(parseDate(item.link.match(/\/\d+-(.*?)\.html/)[1], 'YYYY-MM-DD-HH-mm-ss'), +9);

                item.author = content('meta[name="author"]').attr('content');
                item.title = item.title ?? content('meta[name="twitter:title"]').attr('content');
                item.description = content('#contentDiv')
                    .html()
                    ?.replace(/&nbsp;/g, '')
                    .replace(/<p><\/p>/g, '');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: isOfficialRSS ? officialFeed.title : $('title').first().text(),
        description: isOfficialRSS ? officialFeed.description : '',
        link: currentUrl,
        item: items,
    };
};

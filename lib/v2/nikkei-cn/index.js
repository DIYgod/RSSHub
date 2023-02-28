const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    if (!/^\/(cn|zh)/.test(ctx.path)) {
        throw Error(`Invalid language. Please check the doc https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen-zhong-wen-ban`);
    }

    const language = ctx.path.match(/^\/(cn|zh)/)[1];
    const path = ctx.path.match(new RegExp('\\/' + language + '(.*)'))[1];
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 25;

    const rootUrl = `https://${language === 'zh' ? 'zh.' : ''}cn.nikkei.com`;
    const currentUrl = `${rootUrl}${path}`;

    let items = [],
        $;

    if (path === '/rss') {
        items = await parser
            .parseURL(currentUrl)
            .items.slice(0, limit)
            .toArray()
            .map((item) => ({
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
            .sort((a, b) => b.pubDate - a.pubDate)
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
        title: $('title')?.first().text() ?? (language === 'zh' ? '日經中文網' : '日经中文网'),
        link: currentUrl,
        item: items,
    };
};

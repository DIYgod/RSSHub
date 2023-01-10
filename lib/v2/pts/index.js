const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '/dailynews' : ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('h2 a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.author = content('meta[name="author"]')
                    .attr('content')
                    .replace(/文／/, '')
                    .split(/／|\/|編譯|報導/)[0];
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.category = content('.tag-list')
                    .first()
                    .find('.blue-tag')
                    .toArray()
                    .map((t) => content(t).text())
                    .filter((t) => t !== '...');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.post-article').html(),
                });
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/第\d+頁 ｜ /, ''),
        link: currentUrl,
        item: items,
    };
};

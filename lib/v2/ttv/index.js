const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://news.ttv.com.tw';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '/realtime' : ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('div.news-list li')
        .slice(0, ctx.query.limit ? Number.parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: $(item).find('a').attr('href'),
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

                item.title = content('title').text();
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.category = content('div.article-body ul.tag')
                    .find('a')
                    .toArray()
                    .map((t) => content(t).text());
                const section = content("meta[property='article:section']").attr('content');
                if (!item.category.includes(section)) {
                    item.category.push(section);
                }
                item.description = content('#newscontent').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

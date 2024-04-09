const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'channel';
    const id = ctx.params.id ?? 1;
    const rootUrl = 'http://www.myzaker.com';
    const link = type === 'focusread' ? `${rootUrl}/?pos=selected_article` : `${rootUrl}/${type}/${id}`;

    const response = await got({
        url: link,
        headers: {
            Referer: rootUrl,
        },
    });
    const $ = cheerio.load(response.data);
    const feedTitle = $('head title').text();

    let items = $('div.content-block')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('.article-title').text(),
                link: 'http:' + item.find('.article-wrap > a').attr('href').replace('http://', ''),
            };
        })
        .get();

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    url: item.link,
                    headers: {
                        Referer: link,
                    },
                });

                const $ = cheerio.load(response.data);

                item.description = $('div.article_content div').html() ?? '原文已被删除';
                item.author = $('a.article-auther.line').text();
                item.category = $('.lebel-list')
                    .find('a')
                    .toArray()
                    .map((item) => $(item).text());
                const date = $('span.time').text() ?? undefined;
                if (date) {
                    item.pubDate = timezone(parseRelativeDate(date), +8);
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: type === 'focusread' ? 'ZAKER 精读新闻' : feedTitle,
        link,
        item: items.filter((t) => t.description !== '原文已被删除'),
    };
};

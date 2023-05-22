const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const needContent = /t|y/i.test(ctx.params.need_content ?? 'true');

    const rootUrl = 'https://gw.m.163.com';
    const currentUrl = `${rootUrl}/nc/api/v1/feed/static/normal-list?start=0&tid=T1573700340788&size=${ctx.query.limit ?? (needContent ? 30 : 200)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.items.map((item) => ({
        title: item.title,
        author: item.source,
        pubDate: timezone(parseDate(item.ptime), +8),
        description: `<p>${item.digest}</p><img src="${item.imgsrc}">`,
        link: item.url || `https://c.m.163.com/news/a/${item.docid}.html`,
    }));

    if (needContent) {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('.bot_word').remove();

                    content('img').each((_, img) => {
                        img.attribs.src = img.attribs['data-src'] ? img.attribs['data-src'] : img.attribs.src;
                    });

                    item.description = content('.content, article').html();

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: '今日关注 - 网易新闻',
        link: 'https://wp.m.163.com/163/html/newsapp/todayFocus/index.html',
        item: items,
    };
};

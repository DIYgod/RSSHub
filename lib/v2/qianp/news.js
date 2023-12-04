const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://qianp.com';
    const { path = 'news/recommend' } = ctx.params;
    const url = `${baseUrl}/${path}/`;

    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const list = $('.newslist .infor')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.category = [...new Set($('meta[name=keywords]').attr('content').split('，'))];
                item.author = $('meta[name=author]').attr('content');
                item.pubDate = parseDate($('meta[property="bytedance:published_time"]').attr('content'));

                item.description = $('.news_center').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: url,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
};

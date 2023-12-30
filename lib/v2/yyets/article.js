const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseURL = 'https://yysub.net';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? '';
    const url = `${baseURL}/article${type ? '?type=' + type : ''}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);

    let items = $('.article-list li .fl-info')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('h3 a').text(),
                link: `${baseURL}${e.find('h3 a').attr('href')}`,
                author: e.find('p a').text(),
                pubDate: timezone(parseDate(e.find('p').eq(2).text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('.information-desc').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()} - 人人影视`,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: items,
    };
};

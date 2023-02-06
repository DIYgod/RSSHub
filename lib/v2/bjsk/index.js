const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.bjsk.org.cn';

module.exports = async (ctx) => {
    const { path = 'newslist-1486-0-0' } = ctx.params;
    const link = `${baseUrl}/${path}.html`;
    const { data: response } = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response);

    const list = $('.article-list a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${baseUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.time').text(), 'YYYY.MM.DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = cheerio.load(response);
                item.description = $('.article-main').html();
                item.author = $('.info')
                    .text()
                    .match(/作者：(.*)\s+来源/)[1];
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link,
        image: 'https://www.bjsk.org.cn/favicon.ico',
        item: items,
    };
};

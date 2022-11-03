const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'http://www.dyyy.xjtu.edu.cn';

module.exports = async (ctx) => {
    const { path } = ctx.params;
    const response = await got(`${baseUrl}/${path}.htm`);

    const $ = cheerio.load(response.data);

    const items = $('.list_right_con div li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), response.url).href,
                pubDate: parseDate(item.find('.data').text()),
            };
        });

    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.author = $('.content_source')
                    .text()
                    .match(/责任编辑：(.*)\(点击/)[1];
                item.description = $('.content_con').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: `${baseUrl}/${path}.htm`,
        item: items,
    };
};

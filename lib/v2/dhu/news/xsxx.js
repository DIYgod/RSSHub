const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://news.dhu.edu.cn/6410';

module.exports = async (ctx) => {
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);
    const list = $('.news_UlA>li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('p').text()),
            };
        });

    // item content
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.new_zwCot').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '学术信息',
        link: baseUrl,
        item: items,
    };
};

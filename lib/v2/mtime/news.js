const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    const link = 'https://news.mtime.com';
    const response = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.left-cont.fix li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h4 a').text(),
                link: item.find('h4 a').attr('href'),
            };
        });

    const items = [];
    for await (const item of asyncPool(4, list, (item) =>
        ctx.cache.tryGet(item.link, async () => {
            const detailResponse = await got(item.link);
            const content = cheerio.load(detailResponse.data);

            content('.DRE-subject-wrapper').remove();

            item.author = content('.editor').text().replace('编辑：', '');
            item.description = content('.body').first().html();
            item.pubDate = timezone(parseDate(content('.userCreateTime').text()), 8);
            item.category = content('.keyword a')
                .toArray()
                .map((item) => content(item).text());

            return item;
        })
    )) {
        items.push(item);
    }

    ctx.state.data = {
        title: $('head title').text().trim(),
        link,
        image: 'http://static1.mtime.cn/favicon.ico',
        item: items,
    };
};

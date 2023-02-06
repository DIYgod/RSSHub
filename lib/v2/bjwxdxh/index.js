const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.bjwxdxh.org.cn';
    const type = ctx.params.type;
    const link = type ? `${baseUrl}/news/class/?${type}.html` : `${baseUrl}/news/class/`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('div#newsquery > ul > li')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('div.title > a').text(),
                link: new URL(item.find('div.title > a').attr('href'), baseUrl).href,
                // pubDate: parseDate(item.find('div.time').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(response.data);
                const info = content('div.info')
                    .text()
                    .match(/作者：(.*?)\s+发布于：(.*?\s+.*?)\s/);
                item.author = info[1];
                item.pubDate = timezone(parseDate(info[2], 'YYYY-MM-DD HH:mm:ss'), +8);
                item.description = content('div#con').html().trim().replace(/\n/g, '');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link,
        item: list,
    };
};

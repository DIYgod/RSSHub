const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate, parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'https://gamegene.cn/news';
    const { data: response } = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response);
    const list = $('div.mr245')
        .toArray()
        .map((item) => {
            item = $(item);
            const aEle = item.find('a').first();
            const href = aEle.attr('href');
            const title = aEle.find('h3').first().text();
            const author = item.find('a.namenode').text();
            const category = item.find('span.r').text();
            const dateTime = $(item.find('div.meta').find('span')[1]).text();
            const pubDate = isNaN(Date.parse(dateTime)) ? parseRelativeDate(dateTime) : parseDate(dateTime);
            return {
                title,
                link: href,
                author,
                category,
                pubDate,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = cheerio.load(response);
                item.description = $('div.content').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        // 在此处输出您的 RSS
        item: items,
        link: url,
        title: '游戏基因 GameGene',
    };
};

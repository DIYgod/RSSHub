const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

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
            return {
                title,
                link: href,
                author,
                category,
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
                const dateTime = $('div.meta').find('time').first().text();
                item.pubDate = parseDate(dateTime);
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

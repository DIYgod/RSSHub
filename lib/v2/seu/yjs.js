const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'https://seugs.seu.edu.cn/26671/list.htm';

module.exports = async (ctx) => {
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('.news')
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('span.news_title > a').attr('title'),
                link: `https://seugs.seu.edu.cn${$(element).find('span.news_title > a').attr('href')}`,
                date: $(element).find('span.news_meta').text(),
            };
            return info;
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.description = $('.wp_articlecontent').html();
                item.pubDate = new Date(item.date).toUTCString();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '东南大学研究生公告',
        link: url,
        item: items,
    };
};

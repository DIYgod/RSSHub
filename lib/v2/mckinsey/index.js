const got = require('got');
const cheerio = require('cheerio');
const { TYPE } = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'autos';

    const res = await got({
        method: 'get',
        url: `https://www.mckinsey.com.cn/insights/${category}`,
    });

    const $ = cheerio.load(res.body);

    const articles = $('.fusion-column h4 a')
        .map((_, ele) => ({
            title: $(ele).text(),
            link: $(ele).attr('href'),
        }))
        .get();

    const item = await Promise.all(
        articles.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({
                    method: 'get',
                    url: item.link,
                });
                const doc = cheerio.load(res.body);
                doc('.related-posts').remove();
                item.description = doc('#content').html();
                item.pubDate = doc('.fusion-meta-info-wrapper span:nth-child(3)').text();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '麦肯锡中国',
        link: 'https://www.mckinsey.com.cn',
        description: `麦肯锡中国 ${TYPE[category]}`,
        item,
    };

    ctx.state.json = {
        title: '麦肯锡中国',
        link: 'https://www.mckinsey.com.cn',
        description: `麦肯锡中国 ${TYPE[category]}`,
        item,
    };
};

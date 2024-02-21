const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const base = 'https://houqin.qdu.edu.cn/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${base}index/tzgg.htm`,
    });

    const $ = cheerio.load(response.data);
    const list = $('.n_newslist').children();
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('span').text();
            const path = item.find('a').attr('href');
            let itemUrl = '';
            itemUrl = path.startsWith('http') ? path : base + path;
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = '';
                if (path.startsWith('http')) {
                    description = itemTitle;
                } else {
                    const result = await got(itemUrl);
                    const $ = cheerio.load(result.data);
                    description = $('.v_news_content').html().trim();
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: '青岛大学 - 后勤管理处通知',
        link: `${base}index/tzgg.htm`,
        description: '青岛大学 - 后勤管理处通知',
        item: items,
    };
};

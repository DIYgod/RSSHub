const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'http://www.cs.com.cn/';

const config = {
    link: '/sylm/jsbd/',
    title: '中证快讯',
    query: 'ul.some-list li',
};

module.exports = async (ctx) => {
    const currentUrl = new URL(config.link, rootUrl).href;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $(config.query)
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: item.find('h3').text() || a.text(),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('em').text() || item.find('span').text()), +8),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(res.data);

                item.description = content('.cont_article section').html() || content('.article-t').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '中证网 - ' + config.title,
        link: currentUrl,
        item: items,
    };
};

const cheerio = require('cheerio');
const got = require('@/utils/got');
const { resolve } = require('url');

module.exports = async (ctx) => {
    const url = 'http://www.ccdi.gov.cn/scdc/';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);

    const list = $('ul.list_news_dl.fixed li');
    const out = await Promise.all(
        list
            .map(async (index, elem) => {
                elem = $(elem);
                const title = elem.find('a').text();
                const link = resolve(url, elem.find('a').attr('href'));
                const pubDate = new Date(elem.find('span').text()).toUTCString();

                const item = {
                    title,
                    pubDate,
                    link,
                };

                const key = link;
                const value = await ctx.cache.get(key);
                if (value) {
                    item.description = value;
                } else {
                    const response = await got.get(item.link);
                    const data = response.data;
                    const $ = cheerio.load(data);
                    item.description = $('div.TRS_Editor').html();
                    ctx.cache.set(key, item.description);
                }

                return item;
            })
            .get()
    );

    ctx.state.data = {
        title: '中央纪委国家监委-审查调查',
        link: url,
        item: out,
    };
};

const cheerio = require('cheerio');
const dayjs = require('dayjs');
const url = require('url');
const got = require('@/utils/got');

module.exports = {
    ProcessFeed: async (link, ctx) => {
        const got_ins = got.extend({
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1',
            },
        });

        const res = await got_ins.get(link);

        const $ = cheerio.load(res.data);
        const list = $('p.news_tit01, div.news_tit02').slice(0, 10).get();

        return await Promise.all(
            list.map(async (item) => {
                const $ = cheerio.load(item);
                const itemUrl = url.resolve(link, $(item).find('a').attr('href'));
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const res = await got_ins.get(itemUrl);
                const content = cheerio.load(res.data);
                const serverOffset = new Date().getTimezoneOffset() / 60;
                const single = {
                    title: $(item).find('a').text(),
                    guid: itemUrl,
                    link: itemUrl.replace('https://m.', 'https://'),
                    description: content('#v3cont_id > div.news_content > div.news_part_father > div > div:nth-child(1)').html(),
                    pubDate: content('#v3cont_id > div.news_content > p:nth-child(3)').html()
                        ? dayjs(content('#v3cont_id > div.news_content > p:nth-child(3)').html().split('&#xA0;')[0])
                              .add(-8 - serverOffset, 'hour')
                              .toISOString()
                        : null,
                    author: content('#v3cont_id > div.news_content > p:nth-child(2)').text(),
                };
                return Promise.resolve(single);
            })
        );
    },
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const baseUrl = 'http://moxing.net/';
    const response = await got({
        method: 'get',
        url: baseUrl,
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);
    const list = $('ul.text_list.text_list_f14 li')
        .get()
        .map(function (item) {
            const $ = cheerio.load(item);
            return baseUrl + $('a').attr('href');
        })
        .filter(function (link) {
            return !link.includes('taobao');
        });

    const ProcessLink = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
            responseType: 'buffer',
        });
        const data = iconv.decode(response.data, 'gb2312');
        const $ = cheerio.load(data);

        let desc = $('#endtext').html();
        const next_page_link = $('#pages').children().last().attr('href');
        if (next_page_link !== undefined && baseUrl + next_page_link !== link) {
            const next_page = await ProcessLink(baseUrl + next_page_link);
            desc += next_page.desc;
        }
        return {
            title: $('title').text(),
            desc: desc,
        };
    };

    const out = await Promise.all(
        list.map(async (link) => {
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const feed = await ProcessLink(link);
            const single = {
                title: feed.title,
                description: feed.desc,
                link: link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '模型网', link: baseUrl, item: out };
};

const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'http://www.nbd.com.cn/columns/332';
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'http://www.nbd.com.cn',
        },
    });

    const $ = cheerio.load(response.data);
    const $list = $('li.u-news-title').slice(0, 15).get();
    const description = $('head title').text().trim();

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = $(item).find('a').text().trim();
            const pubDate = $(item).find('span').text().trim();
            const itemUrl = $(item).find('a').attr('href');

            const single = {
                title,
                link: itemUrl,
                pubDate,
                description: '',
            };

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const detail = await got({
                method: 'get',
                url: itemUrl,
                headers: {
                    Referer: 'http://www.nbd.com.cn',
                },
            });

            {
                const $ = cheerio.load(detail.data);
                single.description = $('div.g-article').html();
            }

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '重磅原创-每经网',
        link: url,
        item: resultItem,
        description,
    };
};

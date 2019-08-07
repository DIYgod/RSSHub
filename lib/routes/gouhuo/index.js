const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    let tabId;
    if (category == 'switch') {
        tabId = '2_30';
    } else if (category == 'orignal') {
        tabId = '1_109';
    }

    const response = await got({
        method: 'get',
        url: `https://gouhuo.qq.com/content/getHomeMainContent?tabId=${tabId}`,
        headers: {
            Referer: `https://gouhuo.qq.com/`,
        },
    });
    const list = response.data.data;

    const responsePage = await got({
        method: 'get',
        url: `https://gouhuo.qq.com/`,
        headers: {
            Referer: `https://gouhuo.qq.com/`,
        },
    });
    const $ = cheerio.load(responsePage.data);

    const items = await Promise.all(
        list.map(async (item) => {
            const url = item.link;

            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responsePage = await got({
                method: 'get',
                url: url,
                headers: {
                    Referer: `https://gouhuo.qq.com/`,
                },
            });
            const $ = cheerio.load(responsePage.data);
            const content = $('.widget-article')
                .first()
                .html();

            const single = {
                title: item.title,
                description: `${content}<br><img referrerpolicy="no-referrer" src="${item.src_img}">`,
                pubDate: new Date(item.publish_ts * 1000).toUTCString(),
                link: url,
            };
            ctx.cache.set(url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .split('-')[0]
            .trim(),
        link: `https://gouhuo.qq.com/`,
        description: $('title')
            .text()
            .split('-')[1]
            .trim(),
        item: items,
    };
};

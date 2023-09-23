const got = require('@/utils/got');
const cheerio = require('cheerio');
const categories = {
    xwdt: '新闻动态',
    bsyjszstz: '博士研究生招生通知',
    ssyjszstz: '硕士研究生招生通知',
    zzgdsszstz: '在职攻读硕士招生通知',
};

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const rootUrl = 'https://yz.swufe.edu.cn';
    const url = `${rootUrl}/web/xwtz/${category}.htm`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul li div[width="570"] a').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $item = cheerio.load(item);

            const link = new URL($item('a').attr('href').replace(/\.\./g, '/web'), rootUrl).href;
            const pubDate = new Date($item('.list').text().replace('[', '').replace(']', '')).toUTCString();

            const cache = await ctx.cache.tryGet(link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: link,
                });
                const detail = cheerio.load(detailResponse.data);

                const title = $item('a').attr('title');
                const description = detail('#vsb_content').html();

                return {
                    title,
                    description,
                    pubDate,
                    link,
                };
            });

            return cache;
        })
    );

    ctx.state.data = {
        title: `西南财经大学研究生招生网 - ${categories[category]}`,
        link: url,
        item: items,
    };
};

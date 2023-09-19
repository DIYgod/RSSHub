const got = require('@/utils/got');
const cheerio = require('cheerio');
const { URL } = require('url');

const categoryMap = {
    tzgg: '通知公告',
    xysx: '校园时讯',
    xsjz: '学术讲座',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'tzgg';
    const rootUrl = 'https://www.swufe.edu.cn';
    const apiUrl = `${rootUrl}/index/${category}.htm`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.whitenewslist li').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $item = cheerio.load(item);
            const title = $item('a').attr('title');
            const link = new URL($item('a').attr('href'), rootUrl).href;
            const pubDate = new Date($item('.time i').first().text().trim().replace(/\./g, '-')).toUTCString();

            const cache = await ctx.cache.tryGet(link, async () => {
                const detailResponse = await got({ method: 'get', url: link });
                const detailData = cheerio.load(detailResponse.data);

                const description = detailData('.nr_c').html();

                return { title, description, link, pubDate };
            });

            return cache;
        })
    );

    ctx.state.data = {
        title: `西南财经大学 - ${categoryMap[category]}`,
        link: apiUrl,
        item: items,
    };
};

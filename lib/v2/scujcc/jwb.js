const got = require('@/utils/got');
const cheerio = require('cheerio');
const rootUrl = 'https://jwb.scujcc.edu.cn';

const categoryMap = {
    tzgg: '通知公告',
    fwzn: '服务指南',
    zcwj: '政策文件',
    wjxz: '文件下载',
    xydt: '学院动态',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'tzgg';
    const response = await got({
        method: 'get',
        url: `${rootUrl}/index/${category}.htm`,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul li[id^="line_u9"]').slice(0, 10).get();

    const items = await ctx.cache.tryGet(`${rootUrl}/index/${category}.htm`, async () => {
        const promises = list.map(async (item) => {
            const $1 = $(item);
            const link = new URL($1.find('a').attr('href'), rootUrl).href;

            const detailResponse = await got({
                method: 'get',
                url: link,
            });
            const detail = cheerio.load(detailResponse.data);

            return {
                title: $1.find('a').text(),
                link,
                description: detail('.artcon').html(),
                pubDate: new Date(detail('.art_time li').first().text().replace('发布时间：', '')).toUTCString(),
            };
        });
        return await Promise.all(promises);
    });

    ctx.state.data = {
        title: `成都锦城学院教务处 - ${categoryMap[category]}`,
        link: `${rootUrl}/index/${category}.htm`,
        item: items,
    };
};

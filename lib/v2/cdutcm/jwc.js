const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://jwc.cdutcm.edu.cn/jwc/';
const categoryMap = {
    jwgg: '教务公告',
    gszl: '公示专栏',
    xsbszn: '学生办事指南',
    jsbszn: '教师办事指南',
    jwzx: '教务资讯',
};

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const rootUrl = `${baseUrl}${category}`;

    const response = await got.get(rootUrl);
    const $ = cheerio.load(response.data);

    const list = $('ul.pageTPList li')
        .map((_, item) => {
            item = $(item);
            const a = item.find('.title a');
            const date = item.find('.date').text().replace('发表时间：', '');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), rootUrl).href,
                pubDate: new Date(date).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            const cache = await ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);

                const content = $('.conTxt');
                content.find('img').each((_, img) => {
                    img = $(img);
                    const src = img.attr('src');
                    if (src) {
                        img.attr('src', new URL(src, item.link).href);
                    }
                });
                const exactTime = $('.property span:nth-child(2)').text().replace('发布时间：', '');
                return {
                    title: item.title,
                    description: content.html(),
                    link: item.link,
                    pubDate: new Date(exactTime).toUTCString(),
                };
            });

            return cache;
        })
    );

    ctx.state.data = {
        title: `成都中医药大学教务处 - ${categoryMap[category]}`,
        link: rootUrl,
        item: items,
    };
};

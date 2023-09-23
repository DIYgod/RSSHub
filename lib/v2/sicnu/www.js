const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '23'; // 默认为通知公告
    const rootUrl = 'https://www.sicnu.edu.cn';
    const currentUrl = `${rootUrl}/article/${category}#1`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.new-list1 li').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $1 = $(item);
            const $a = $1.find('a');
            const link = new URL($a.attr('href'), rootUrl).href;

            const cachedContent = await ctx.cache.tryGet(link, async () => {
                const res = await got({ method: 'get', url: link });
                return res.data;
            });

            const content = cheerio.load(cachedContent);

            return {
                title: $a.text(),
                link,
                description: content('div.detail-box').html(),
                pubDate: new Date($1.find('.fr').text()).toUTCString(),
            };
        })
    );

    ctx.state.data = {
        title: `四川师范大学 - ${$('div.top-menu p').text()}`,
        link: currentUrl,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || '3157';

    const rootUrl = 'https://www.sqmc.edu.cn';
    const currentUrl = `${rootUrl}/${category}/list.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div#wp_news_w9 ul li').get();

    ctx.state.data = {
        title: `新乡医学院三全学院官网信息${$('title').text()}`,
        link: currentUrl,
        item: await Promise.all(
            list.map(async (item) => {
                item = $(item);

                const link = new URL(item.find('dt a').attr('href'), rootUrl).href;
                const pubDate = parseDate(item.find('dd').eq(0).text(), 'YYYY-MM-DD');

                const cache = await ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    return {
                        title: item.find('dt a').text(),
                        description: content('div.Tr_Detail').html(),
                        link,
                        pubDate: timezone(pubDate, +8),
                    };
                });

                return cache;
            })
        ),
    };
};

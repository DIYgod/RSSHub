const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

const categories = {
    tzgg: '通知公告',
    jxdt: '教学动态',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'tzgg';
    const rootUrl = 'https://jwc.swufe.edu.cn';
    const url = `${rootUrl}/${category}.htm`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('li[id^="line_u2"]');

    const items = await Promise.all(
        list
            .slice(0, 10)
            .map(async (index, item) => {
                item = $(item);
                const link = new URL(item.find('a').attr('href'), rootUrl).href;
                const pubDateText = item.find('span').text().replace('[', '').replace(']', '').trim();
                const pubDate = timezone(new Date(pubDateText.replace(/年|月/g, '-').replace('日', '')), +8);
                const cache = await ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });

                    const content = cheerio.load(detailResponse.data);
                    const description = content('.font_about.content_more').html();

                    return { description };
                });

                return {
                    title: item.find('a').attr('title'),
                    link,
                    pubDate,
                    description: cache.description,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: `西南财经大学教务处 - ${categories[category]}`,
        link: url,
        item: items,
    };
};

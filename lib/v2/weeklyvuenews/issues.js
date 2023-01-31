const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://weekly-vue.news';

    const response = await got({
        method: 'get',
        url: rootUrl + '/issues',
    });

    const $ = cheerio.load(response.data);
    const list = $('div.flex.flex-col.gap-4.mt-12 > a');

    ctx.state.data = {
        title: 'Weekly Vue News',
        link: 'https://weekly-vue.news/issues',
        description: 'Weekly Vue News',
        item:
            list &&
            list
                .map((index, item) => {
                    const title = $(item).find('span.text-2xl').text();
                    const pubDate = $(item).find('span.text-sm.text-gray-400').text();
                    const link = $(item).attr('href');
                    return {
                        title,
                        pubDate,
                        link: rootUrl + link,
                    };
                })
                .get(),
    };
};

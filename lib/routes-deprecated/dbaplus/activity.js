const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'online';

    const rootUrl = 'https://dbaplus.cn';
    const currentUrl = `${rootUrl}/activity-${type === 'online' ? '12' : '48'}-1.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.media')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.find('.media-heading').text(),
                link: item.find('.pull-left').attr('href'),
                description: `<img src="${item.find('.media-object').attr('src')}">`,
                pubDate: timezone(new Date(item.find('.time').text().replace('时间：', '')), +8),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text().split('：')[0],
        link: currentUrl,
        item: items,
    };
};

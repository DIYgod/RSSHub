const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'en';
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://atcoder.jp';
    const currentUrl = `${rootUrl}/posts?lang=${language}${keyword ? `&keyword=${keyword}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.panel')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.panel-title').text(),
                description: item.find('.panel-body').html(),
                link: `${rootUrl}${item.find('.panel-title a').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.timeago').attr('datetime')), +9),
            };
        });

    ctx.state.data = {
        title: `${keyword ? `[${keyword}] - ` : ''}${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};

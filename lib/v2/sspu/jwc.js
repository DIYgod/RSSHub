const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { listId } = ctx.params;
    const baseUrl = 'https://jwc.sspu.edu.cn';

    const { data: response, url: link } = await got(`${baseUrl}/${listId}/list.htm`);
    const $ = cheerio.load(response);

    const list = $('.news_list .news')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.news_title a');
            return {
                title: title.attr('title'),
                link: `${baseUrl}${title.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.wp_articlecontent').html();
                item.pubDate = timezone(parseDate($('.arti_update').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link,
        item: items,
    };
};

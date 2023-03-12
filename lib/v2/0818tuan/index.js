const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.0818tuan.com';
    const { listId = '1' } = ctx.params;
    const url = `${baseUrl}/list-${listId}-0.html`;

    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const list = $(listId === '3' ? '.col-xs-12 .thumbnail > a' : '.col-md-8 .list-group > a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${baseUrl}${item.attr('href')}`,
            };
        })
        .filter((i) => !i.link.includes('m.0818tuan.com/tb1111.php'));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('.pageLink, .alert, p[style="margin:15px;"]').remove();

                item.description = $('.post-content').html();
                item.pubDate = timezone(parseDate($('.panel-body > .text-center').text().replace('时间:', ''), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        image: 'http://www.0818tuan.com/favicon.ico',
        item: items,
    };
};

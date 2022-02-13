const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const shortcuts = {
    'news/news': 'xw/news',
    'news/gd': 'gd',
    'news/sd': 'xw/sd',
    'news/pl': 'xw/pl',
    'data/data': 'data',
};

module.exports = async (ctx) => {
    let path = ctx.path.replace(/\//, '');
    if (shortcuts.hasOwnProperty(path)) {
        path = shortcuts[path];
    }

    const rootUrl = 'https://www.stcn.com';
    const currentUrl = `${rootUrl}/${path || 'xw/news'}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const match = response.data.match(/var curr_channel_id = "(light_\d+)";/);
    const $ = cheerio.load(response.data);

    $('.website, .websit').remove();

    let items = $('.box_left, .box_left2, .left2')
        .find('a[title]')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href').replace(/^\.\./, currentUrl.split('/').slice(0, -1).join('/')).replace(/^\./, currentUrl),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.txt_con').html();
                item.author = content('meta[name="author"]').attr('content');
                item.category = content('meta[name="keywords"]').attr('content').split(';');
                item.pubDate = timezone(parseDate(detailResponse.data.match(/publishdate = '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})';/)[1]), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${(match ? $('#' + match[1]).text() : '') || $('.cur').text()} - 证券时报网`,
        link: currentUrl,
        item: items,
    };
};

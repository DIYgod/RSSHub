const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const config = {
    sub: {
        title: '字幕',
        category: 'new',
    },
    zu: {
        title: '字幕组',
        category: '14',
    },
    newest: {
        category: 'for backwards compatibility',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'sub';
    const category = ctx.params.category ?? config[type].category;

    const rootUrl = 'https://subhd.tv';
    const currentUrl = `${rootUrl}/${type === 'newest' ? 'sub/new' : `${type}/${category}${type === 'zu' ? '/l' : ''}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.align-middle').each(function () {
        $(this).removeClass('link-dark');
    });

    let items = $('.link-dark')
        .toArray()
        .map((item) => {
            item = $(item);

            const pubDate = item.parent().parent().find('.align-text-top').last().text();
            const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

            return {
                link: `${rootUrl}${item.attr('href')}`,
                author: item.parent().parent().find('.text-dark').last().text(),
                pubDate: timezone(parseDate(pubDate.indexOf('-') > -1 ? pubDate : `${today} ${pubDate}`), +8),
                title: `${item.parent().parent().find('.align-middle').text()} ${item.text().replace(/ - SubHD/, '')}`,
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

                content('.rounded-circle').remove();
                content('.view-text').last().remove();

                item.description = content('.view-text').html() + content('.bg-white').first().html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

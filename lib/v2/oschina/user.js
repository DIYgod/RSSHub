const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id, uid } = ctx.params;
    const res = id ? await got(`https://my.oschina.net/${id}`) : await got(`https://my.oschina.net/u/${uid}`);
    const $ = cheerio.load(res.data);

    const author = $('.user-name .name').text();
    const list = $('#newestBlogList .blog-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.extra div .item:nth-of-type(2)').text();
            const accessible = !item.find('div.label[data-tooltip=审核中]').length;
            item.find('.label').remove();
            return {
                title: item.find('.content a.header').text(),
                description: item.find('.description p').text(),
                link: item.find('a.header').attr('href'),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), +8),
                author,
                accessible,
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.accessible) {
                    const detail = await got(item.link);
                    const content = cheerio.load(detail.data);

                    item.description = content('.article-detail').html();
                }
                delete item.accessible;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: author + '的博客',
        description: $('.user-text .user-signature').text(),
        link: `https://my.oschina.net/${id ? id : uid}`,
        item: resultItem,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const day = ctx.params.day || 'all';
    const link = `https://post.smzdm.com/hot_${day}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('li.filter-tab.active').text();

    const list = $('li.feed-row-wide')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('h5.z-feed-title a').text(),
                link: $(this).find('h5.z-feed-title a').attr('href'),
                pubdate: $(this).find('span.z-publish-time').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const pubdate = info.pubdate;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const content = $('#articleId');
            content.find('.item-name').remove();
            content.find('.recommend-tab').remove();
            const description = content.html();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: timezone(parseDate(pubdate, 'H:mm'), +8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-什么值得买好文`,
        link: link,
        item: out,
    };
};

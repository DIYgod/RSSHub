const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const baseUrl = 'https://www.qbittorrent.org';

    const response = await ctx.cache.tryGet(
        `${baseUrl}/news.php`,
        async () =>
            (
                await got(`${baseUrl}/news.php`, {
                    headers: {
                        Referer: baseUrl,
                    },
                })
            ).data,
        config.cache.routeExpire,
        false
    );

    const $ = cheerio.load(response);

    const item = $('.stretcher')
        .find('h3')
        .toArray()
        .map((item) => {
            item = $(item);
            const pubDate = item
                .text()
                .split(' - ')[0]
                .replace(/\w{3,6}day/, '');
            const title = item.text().split(' - ')[1];
            let description = '';
            // nextUntil() does not work here
            while (item.next().length && item.next().get(0).tagName !== 'h3') {
                item = item.next();
                description += item.html();
            }
            return {
                title,
                description,
                pubDate: parseDate(pubDate, 'MMMM D YYYY'),
            };
        });

    ctx.state.data = {
        title: 'qBittorrent News',
        link: `${baseUrl}/news.php`,
        item,
    };

    ctx.state.json = {
        title: 'qBittorrent News',
        link: `${baseUrl}/news.php`,
        item,
    };
};

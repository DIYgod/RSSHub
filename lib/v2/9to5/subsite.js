const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const utils = require('./utils');

module.exports = async (ctx) => {
    let title = '9To5',
        baseLink,
        link,
        description;

    switch (ctx.params.subsite) {
        case 'mac':
            baseLink = 'https://9to5mac.com';
            title += 'Mac';
            description = 'Apple News & Mac Rumors Breaking All Day';
            break;

        case 'google':
            baseLink = 'https://9to5google.com';
            title += 'Google';
            description = 'Google, Pixel news, Android, Home, Chrome OS, apps, more';
            break;

        case 'toys':
            baseLink = 'https://9to5toys.com';
            title += 'Toys';
            description = 'New Gear, reviews and deals';
            break;

        default:
            break;
    }

    if (ctx.params.tag) {
        link = `${baseLink}/guides/${ctx.params.tag}/feed/`;
        title = `${ctx.params.tag} | ${title}`;
    } else {
        link = `${baseLink}/feed/`;
    }

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items
            .filter((item) => item.link.startsWith(baseLink) && !item.link.startsWith('https://9to5mac.com/poll-post/'))
            .splice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const response = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const description = utils.ProcessFeed(response.data);

                    const single = {
                        title: item.title,
                        description,
                        pubDate: item.pubDate,
                        link: item.link,
                        author: item['dc:creator'],
                    };

                    return single;
                })
            )
    );

    ctx.state.data = {
        title,
        link,
        description,
        item: items,
    };
};

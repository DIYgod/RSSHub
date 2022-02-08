const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const filter = ctx.params.filter ?? 'latest';
    const needDetails = /t|y/i.test(ctx.params.needDetails ?? 'false');

    const rootUrl = 'https://wallhaven.cc';
    const currentUrl = `${rootUrl}/${filter.indexOf('=') > 0 ? `search?${filter.replace(/page=\d+/g, 'page=1')}` : filter}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.preview')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 24)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
                title: item.parent().attr('data-wallpaper-id'),
                description: art(path.join(__dirname, 'templates/image.art'), {
                    image: item
                        .prev()
                        .attr('data-src')
                        .replace(/https:\/\/.*\.wallhaven\.cc\/small\/(.*)\/(.*)\..*/, `https://w.wallhaven.cc/full/$1/wallhaven-$2.${item.next().find('span span').text().toLowerCase() || 'jpg'}`),
                }),
            };
        });

    if (needDetails) {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.title = content('meta[name="title"]').attr('content');
                    item.author = content('.username').text();
                    item.pubDate = parseDate(content('time').attr('datetime'));
                    item.category = content('.tagname')
                        .toArray()
                        .map((tag) => content(tag).text());

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

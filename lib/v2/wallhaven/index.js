const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://wallhaven.cc';

module.exports = async (ctx) => {
    const filter = ctx.params.filter ?? 'latest';
    const needDetails = /t|y/i.test(ctx.params.needDetails ?? 'false');
    const url = `${rootUrl}/${filter.indexOf('=') > 0 ? `search?${filter.replace(/page=\d+/g, 'page=1')}` : filter}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    let items = $('li > figure.thumb')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 24)
        .map((_, item) => ({
            title: $(item).find('img.lazyload').attr('data-src').split('/').pop(),
            description: $(item)
                .html()
                .match(/<img.*?>/)[0],
            link: $(item).find('a.preview').attr('href'),
        }))
        .get();
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
                    item.description = content('div.scrollbox').html();

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};

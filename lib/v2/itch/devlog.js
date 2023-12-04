const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const user = ctx.params.user ?? '';
    const id = ctx.params.id ?? '';
    if (!isValidHost(user)) {
        throw Error('Invalid user');
    }

    const rootUrl = `https://${user}.itch.io/${id}/devlog`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: timezone(parseDate(item.text()), +8),
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

                item.author = detailResponse.data.match(/"author":{".*?","name":"(.*?)"/)[1];
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*?)"/)[1]);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images: content('.post_image')
                        .toArray()
                        .map((i) => content(i).attr('src')),
                    description: content('.post_body').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};

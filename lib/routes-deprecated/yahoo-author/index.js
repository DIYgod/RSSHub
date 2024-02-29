const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const author = ctx.params.author;

    const response = await got({
        method: 'get',
        url: `https://www.yahoo.com/author/${author}/`,
    });
    const url = response.url; // got will make sure that this is the final URL after redirects

    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('meta[property="og:title"]').attr('content');
    const description = $('meta[property="og:description"]').attr('content');

    const list = $('li.js-stream-content h3 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const itemURL = new URL(item.attr('href'), url).href;
            return {
                link: itemURL,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const body = content('div.caas-body');

                // remove extra body content that we don't want to see
                body.find('div.caas-iframe-wrapper').remove();
                body.find('div.caas-readmore').remove();
                body.find('ul.caas-list').remove();
                body.find('strong:contains("More from Yahoo Sports:")').parent().remove();

                // fix all img srcs
                body.find('img').attr('src', function () {
                    return cheerio(this).attr('data-src');
                });

                item.title = content('meta[property="og:title"]').attr('content');
                item.description = body.html();
                item.pubDate = new Date(content('div.caas-attr-time-style time').attr('datetime')).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: url,
        description,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const title = ctx.params.title || '';
    const rootUrl = 'https://www.uisdc.com';

    let query, currentUrl;

    if (title === '' || title === 'hot') {
        query = '.zt-item a h2';
        currentUrl = `${rootUrl}/zt?od=${title}`;
    } else {
        query = '.list-item-zt .item-content a h2';
        currentUrl = `${rootUrl}/zt/${title}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(query)
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.parent().attr('href'),
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

                if (title === '' || title === 'hot') {
                    item.title = content('.block-main h2').text();
                    item.description = `${content('.block-main p').text()}`;
                    item.pubDate = new Date(content('.time').eq(0).text()).toUTCString();
                } else {
                    item.title = content('#post_title').text();
                    item.description = content('.article').html();
                    item.pubDate = new Date(content('.time').attr('title')).toUTCString();
                    item.author = content('span.original_author, span.editor').text();
                }

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

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tag = ctx.params.tag || '';

    const rootUrl = 'https://openai.com';
    const currentUrl = `${rootUrl}/blog${tag === '' ? '' : `/tags/${tag}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.col-12 a')
        .slice(0, 5)
        .map((_, item) => {
            item = $(item);
            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                item.title = content('title').text();

                content('.aside').remove();

                item.description = content('.content').html();
                item.pubDate = new Date(content('time').attr('datetime')).toUTCString();

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

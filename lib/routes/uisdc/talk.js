const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const sort = ctx.params.sort || '';

    const rootUrl = 'https://www.uisdc.com';
    const currentUrl = `${rootUrl}/talk${sort === '' ? '' : '?od=' + sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.content-title a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const time = item.parent().parent().prev().find('.time').text();
            return {
                title: item.text(),
                link: item.attr('href'),
                author: item.find('.author-title h3 a').text(),
                pubDate: new Date(time.indexOf('-') === 2 ? `${new Date().getFullYear()}-${time}` : time + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'post',
                        url: `${rootUrl}/ajax.php`,
                        form: {
                            action: 'get_comments',
                            pid: item.link.substr(item.link.length - 11, 6),
                            pd: '1',
                        },
                    });

                    item.description = '';
                    for (const p of detailResponse.data.data) {
                        item.description = `<div><a href="${p.author_url}">${p.author}</a>${p.city === '' ? '' : `(${p.city})`} 回复于 ${p.time}: <p>${p.content}</p></div>`;
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

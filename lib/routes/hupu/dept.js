const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let currentUrl = '';
    if (ctx.params.dept === 'soccer-china') {
        currentUrl = `https://soccer.hupu.com/china`;
    } else {
        currentUrl = `https://${ctx.params.dept}.hupu.com`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const query = {
        nba: 'div.list-item',
        soccer: 'div.list-item',
        'soccer-china': '#focusNews',
        cba: '#focusNews',
        gg: 'div.fouce-news',
    };

    const list = $(query[ctx.params.dept])
        .find('a[href!=""]')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('div.quote-content').html();
                    item.author = content('div.author div.left a.u').eq(0).text();
                    item.pubDate = new Date(content('span.stime').eq(0).text() + ' GMT+8').toUTCString();

                    return item;
                } catch (error) {
                    return Promise.resolve('');
                }
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

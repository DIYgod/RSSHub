const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let currentUrl;
    let query;

    ctx.params.id = ctx.params.id || 'latest';

    if (ctx.params.id === 'latest') {
        currentUrl = 'https://www.x6d.com';
    } else {
        currentUrl = `https://www.x6d.com/html/${ctx.params.id}.html`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('i.rj').remove();

    if (ctx.params.id === 'latest') {
        query = $('#newslist ul').eq(0).find('li').not('.addd').find('a');
    } else {
        query = $('a.soft-title');
    }

    const list = query
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `https://www.x6d.com${item.attr('href')}`,
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

                item.description = content('div.article-content').html();
                item.pubDate = new Date(content('time').text() + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `小刀娱乐网 - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.fulinian.com/';

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '';

    const currentUrl = `${rootUrl}/${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('article.excerpt')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('header h2 a');
            return {
                title: a.text(),
                link: a.attr('href'),
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

                item.description = content('article.article-content').html();
                item.pubDate = new Date(content('div.article-meta span.item').eq(0).text() + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `福利年 - ${$('h1').text()}`,
        link: currentUrl,
        item: items,
    };
};

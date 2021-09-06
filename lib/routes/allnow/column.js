const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.allnow.com';
    const currentUrl = `${rootUrl}/column/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.post-list .post')
        .slice(0, 10)
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

                item.title = content('p.title').text();
                item.author = content('a.single-name').eq(0).text();
                item.description = content('#article-content').html();
                item.pubDate = new Date(detailResponse.data.match(/time:"(.*?)"\}/)[1] + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('p.name').text()} - 全现在`,
        link: rootUrl,
        item: items,
        description: $('p.desc').text(),
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = `https://www.cgtn.com/opinions`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    $('.cg-pic').parent().remove();

    const list = $(`.cg-title h4`)
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(parseInt(a.attr('data-time'))).toUTCString(),
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

                item.author = content('.news-author-name').text();
                item.description = content('#cmsMainContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'CGTN - Opinions',
        link: rootUrl,
        item: items,
    };
};
